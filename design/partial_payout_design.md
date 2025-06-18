# Dizajn sustava za parcijalnu isplatu dobitaka

## Pregled

Ovaj dokument opisuje dizajn sustava za parcijalnu isplatu dobitaka kada kladionica nema dovoljno sredstava za isplatu svih dobitaka odjednom. Sustav će omogućiti praćenje statusa isplate u postotku i obavještavanje igrača o statusu njihove isplate.

## Izmjene u smart ugovoru

### 1. Proširenje Bet strukture

```solidity
// Prošireni BetStatus enum
enum BetStatus { Pending, Settled, PartiallyPaid, FullyPaid, Cancelled }

// Proširena Bet struktura
struct Bet {
    uint256 id;
    address bettor;
    uint256 amount;
    uint256 potentialWin;
    uint256 fee;
    string eventId;
    string outcomeId;
    BetStatus status;
    bool won;
    uint256 createdAt;
    uint256 settledAt;
    
    // Nova polja za praćenje isplate
    uint256 paidAmount;         // Iznos koji je već isplaćen
    uint256 remainingAmount;    // Preostali iznos za isplatu
    uint256 lastPaymentTime;    // Vrijeme zadnje isplate
    uint256 paymentPercentage;  // Postotak isplaćenog iznosa (0-100)
}
```

### 2. Nove funkcije za parcijalnu isplatu

```solidity
/**
 * @dev Settle a bet with partial payment support
 * @param _betId ID of the bet
 * @param _won Whether the bet was won
 */
function settleBet(uint256 _betId, bool _won) external onlyOwner nonReentrant {
    Bet storage bet = bets[_betId];
    require(bet.status == BetStatus.Pending, "Bet is not pending");
    
    bet.won = _won;
    bet.settledAt = block.timestamp;
    
    if (_won) {
        // Provjeri dostupna sredstva
        uint256 contractBalance = usdtToken.balanceOf(address(this)) - totalFees;
        
        if (contractBalance >= bet.potentialWin) {
            // Potpuna isplata
            require(usdtToken.transfer(bet.bettor, bet.potentialWin), "USDT transfer failed");
            bet.status = BetStatus.FullyPaid;
            bet.paidAmount = bet.potentialWin;
            bet.remainingAmount = 0;
            bet.paymentPercentage = 100;
            bet.lastPaymentTime = block.timestamp;
            
            emit BetFullyPaid(_betId, bet.bettor, bet.potentialWin);
        } else if (contractBalance > 0) {
            // Parcijalna isplata
            require(usdtToken.transfer(bet.bettor, contractBalance), "USDT transfer failed");
            bet.status = BetStatus.PartiallyPaid;
            bet.paidAmount = contractBalance;
            bet.remainingAmount = bet.potentialWin - contractBalance;
            bet.paymentPercentage = (contractBalance * 100) / bet.potentialWin;
            bet.lastPaymentTime = block.timestamp;
            
            // Dodaj u red čekanja za isplatu
            paymentQueue.push(_betId);
            
            emit BetPartiallyPaid(_betId, bet.bettor, contractBalance, bet.remainingAmount, bet.paymentPercentage);
        } else {
            // Nema dostupnih sredstava, samo dodaj u red čekanja
            bet.status = BetStatus.PartiallyPaid;
            bet.paidAmount = 0;
            bet.remainingAmount = bet.potentialWin;
            bet.paymentPercentage = 0;
            
            // Dodaj u red čekanja za isplatu
            paymentQueue.push(_betId);
            
            emit BetAddedToPaymentQueue(_betId, bet.bettor, bet.potentialWin);
        }
    } else {
        // Oklada je izgubljena
        bet.status = BetStatus.Settled;
        emit BetSettled(_betId, bet.bettor, false, 0);
    }
}

/**
 * @dev Process pending payments when new funds are available
 */
function processPaymentQueue() external onlyOwner nonReentrant {
    require(paymentQueue.length > 0, "Payment queue is empty");
    
    uint256 contractBalance = usdtToken.balanceOf(address(this)) - totalFees;
    require(contractBalance > 0, "No funds available for payments");
    
    uint256 processedCount = 0;
    uint256 maxProcessCount = 10; // Ograničenje za gas
    
    while (paymentQueue.length > 0 && processedCount < maxProcessCount && contractBalance > 0) {
        uint256 betId = paymentQueue[0];
        Bet storage bet = bets[betId];
        
        if (bet.status != BetStatus.PartiallyPaid || bet.remainingAmount == 0) {
            // Ukloni iz reda ako je već isplaćeno ili nije u ispravnom statusu
            removeFromPaymentQueue(0);
            continue;
        }
        
        uint256 paymentAmount;
        
        if (contractBalance >= bet.remainingAmount) {
            // Možemo isplatiti cijeli preostali iznos
            paymentAmount = bet.remainingAmount;
            bet.status = BetStatus.FullyPaid;
            
            // Ukloni iz reda čekanja
            removeFromPaymentQueue(0);
        } else {
            // Parcijalna isplata
            paymentAmount = contractBalance;
        }
        
        // Izvrši isplatu
        require(usdtToken.transfer(bet.bettor, paymentAmount), "USDT transfer failed");
        
        // Ažuriraj stanje oklade
        bet.paidAmount += paymentAmount;
        bet.remainingAmount -= paymentAmount;
        bet.paymentPercentage = (bet.paidAmount * 100) / bet.potentialWin;
        bet.lastPaymentTime = block.timestamp;
        
        // Ažuriraj dostupna sredstva
        contractBalance -= paymentAmount;
        
        // Emitiraj događaj
        if (bet.status == BetStatus.FullyPaid) {
            emit BetFullyPaid(betId, bet.bettor, bet.potentialWin);
        } else {
            emit BetPartiallyPaid(betId, bet.bettor, paymentAmount, bet.remainingAmount, bet.paymentPercentage);
        }
        
        processedCount++;
    }
}

/**
 * @dev Remove bet from payment queue
 * @param _index Index in the payment queue
 */
function removeFromPaymentQueue(uint256 _index) private {
    require(_index < paymentQueue.length, "Invalid index");
    
    // Premjesti zadnji element na poziciju koja se briše
    if (_index < paymentQueue.length - 1) {
        paymentQueue[_index] = paymentQueue[paymentQueue.length - 1];
    }
    
    // Smanji veličinu niza
    paymentQueue.pop();
}
```

### 3. Novi događaji (Events)

```solidity
// Novi događaji za praćenje isplata
event BetPartiallyPaid(uint256 indexed betId, address indexed bettor, uint256 paidAmount, uint256 remainingAmount, uint256 paymentPercentage);
event BetFullyPaid(uint256 indexed betId, address indexed bettor, uint256 totalAmount);
event BetAddedToPaymentQueue(uint256 indexed betId, address indexed bettor, uint256 pendingAmount);
```

### 4. Nove varijable stanja

```solidity
// Red čekanja za isplatu
uint256[] public paymentQueue;

// Mapiranje za brzi pristup poziciji u redu čekanja
mapping(uint256 => uint256) public paymentQueuePositions;
```

## Izmjene u backend servisu

### 1. Novi API endpointi

```javascript
// Dohvat statusa isplate
app.get('/api/payment-status/:betId', async (req, res) => {
  try {
    const betId = req.params.betId;
    const bet = await bettingContract.methods.getBet(betId).call();
    
    // Provjeri je li oklada u statusu parcijalne isplate
    if (bet.status !== '2' && bet.status !== '3') { // PartiallyPaid ili FullyPaid
      return res.status(400).json({ error: 'Bet is not in payment status' });
    }
    
    // Dohvati poziciju u redu čekanja ako je parcijalno isplaćeno
    let queuePosition = null;
    if (bet.status === '2') { // PartiallyPaid
      queuePosition = await bettingContract.methods.paymentQueuePositions(betId).call();
    }
    
    res.json({
      betId: betId,
      status: bet.status === '2' ? 'PartiallyPaid' : 'FullyPaid',
      paidAmount: web3.utils.fromWei(bet.paidAmount, 'mwei'), // Convert from USDT decimals (6)
      remainingAmount: web3.utils.fromWei(bet.remainingAmount, 'mwei'),
      paymentPercentage: bet.paymentPercentage,
      lastPaymentTime: new Date(bet.lastPaymentTime * 1000).toISOString(),
      queuePosition: queuePosition
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

// Dohvat svih parcijalnih isplata za korisnika
app.get('/api/partial-payments/:userAddress', async (req, res) => {
  try {
    const userAddress = req.params.userAddress;
    
    // Dohvati sve oklade korisnika
    const betIds = await bettingContract.methods.getUserBets(userAddress).call();
    
    // Filtriraj samo one s parcijalnim isplatama
    const partialPayments = [];
    for (const betId of betIds) {
      const bet = await bettingContract.methods.getBet(betId).call();
      if (bet.status === '2' || bet.status === '3') { // PartiallyPaid ili FullyPaid
        partialPayments.push({
          betId: betId,
          status: bet.status === '2' ? 'PartiallyPaid' : 'FullyPaid',
          paidAmount: web3.utils.fromWei(bet.paidAmount, 'mwei'),
          remainingAmount: web3.utils.fromWei(bet.remainingAmount, 'mwei'),
          paymentPercentage: bet.paymentPercentage,
          lastPaymentTime: new Date(bet.lastPaymentTime * 1000).toISOString()
        });
      }
    }
    
    res.json(partialPayments);
  } catch (error) {
    console.error('Error fetching partial payments:', error);
    res.status(500).json({ error: 'Failed to fetch partial payments' });
  }
});
```

### 2. WebSocket servis za obavijesti

```javascript
// WebSocket servis za obavijesti o isplatama
const setupPaymentNotifications = (io) => {
  // Slušaj događaje s blockchaina
  bettingContract.events.BetPartiallyPaid({})
    .on('data', async (event) => {
      const { betId, bettor, paidAmount, remainingAmount, paymentPercentage } = event.returnValues;
      
      // Šalji obavijest korisniku
      io.to(bettor).emit('paymentUpdate', {
        type: 'partialPayment',
        betId: betId,
        paidAmount: web3.utils.fromWei(paidAmount, 'mwei'),
        remainingAmount: web3.utils.fromWei(remainingAmount, 'mwei'),
        paymentPercentage: paymentPercentage,
        timestamp: new Date().toISOString()
      });
      
      // Spremi obavijest u bazu
      await saveNotification(bettor, 'partialPayment', {
        betId, paidAmount, remainingAmount, paymentPercentage
      });
    })
    .on('error', console.error);
  
  bettingContract.events.BetFullyPaid({})
    .on('data', async (event) => {
      const { betId, bettor, totalAmount } = event.returnValues;
      
      // Šalji obavijest korisniku
      io.to(bettor).emit('paymentUpdate', {
        type: 'fullPayment',
        betId: betId,
        totalAmount: web3.utils.fromWei(totalAmount, 'mwei'),
        timestamp: new Date().toISOString()
      });
      
      // Spremi obavijest u bazu
      await saveNotification(bettor, 'fullPayment', {
        betId, totalAmount
      });
    })
    .on('error', console.error);
  
  bettingContract.events.BetAddedToPaymentQueue({})
    .on('data', async (event) => {
      const { betId, bettor, pendingAmount } = event.returnValues;
      
      // Šalji obavijest korisniku
      io.to(bettor).emit('paymentUpdate', {
        type: 'addedToQueue',
        betId: betId,
        pendingAmount: web3.utils.fromWei(pendingAmount, 'mwei'),
        timestamp: new Date().toISOString()
      });
      
      // Spremi obavijest u bazu
      await saveNotification(bettor, 'addedToQueue', {
        betId, pendingAmount
      });
    })
    .on('error', console.error);
};
```

## Izmjene u frontend komponentama

### 1. Komponenta za prikaz statusa isplate

```jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CircularProgress, Typography, Box, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSocket } from '../hooks/useSocket';
import { fetchPaymentStatus } from '../services/ApiService';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  progressContainer: {
    position: 'relative',
    display: 'inline-block',
    margin: theme.spacing(2)
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  statusText: {
    marginTop: theme.spacing(1)
  },
  fullPaid: {
    color: theme.palette.success.main
  },
  partialPaid: {
    color: theme.palette.warning.main
  }
}));

const PaymentStatusCard = ({ betId }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const socket = useSocket();
  
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dohvati inicijalni status
  useEffect(() => {
    const getStatus = async () => {
      try {
        setLoading(true);
        const status = await fetchPaymentStatus(betId);
        setPaymentStatus(status);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch payment status');
      } finally {
        setLoading(false);
      }
    };
    
    getStatus();
  }, [betId]);
  
  // Slušaj obavijesti o promjenama
  useEffect(() => {
    if (!socket) return;
    
    const handlePaymentUpdate = (update) => {
      if (update.betId === betId) {
        // Osvježi status nakon primljene obavijesti
        fetchPaymentStatus(betId)
          .then(status => setPaymentStatus(status))
          .catch(err => console.error('Error updating payment status:', err));
      }
    };
    
    socket.on('paymentUpdate', handlePaymentUpdate);
    
    return () => {
      socket.off('paymentUpdate', handlePaymentUpdate);
    };
  }, [socket, betId]);
  
  if (loading) {
    return <CircularProgress size={24} />;
  }
  
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }
  
  if (!paymentStatus) {
    return null;
  }
  
  return (
    <Paper className={classes.root}>
      <Typography variant="h6">
        {t('payment.status.title', 'Payment Status')}
      </Typography>
      
      <Box className={classes.progressContainer}>
        <CircularProgress 
          variant="determinate" 
          value={paymentStatus.paymentPercentage} 
          size={80}
          color={paymentStatus.status === 'FullyPaid' ? 'secondary' : 'primary'}
        />
        <Typography className={classes.progressText} variant="body2">
          {`${paymentStatus.paymentPercentage}%`}
        </Typography>
      </Box>
      
      <Box>
        <Typography variant="body1">
          {t('payment.status.paidAmount', 'Paid Amount')}: {paymentStatus.paidAmount} USDT
        </Typography>
        
        {paymentStatus.status === 'PartiallyPaid' && (
          <Typography variant="body1">
            {t('payment.status.remainingAmount', 'Remaining Amount')}: {paymentStatus.remainingAmount} USDT
          </Typography>
        )}
        
        <Typography variant="body2" color="textSecondary">
          {t('payment.status.lastUpdate', 'Last Update')}: {new Date(paymentStatus.lastPaymentTime).toLocaleString()}
        </Typography>
        
        <Typography 
          className={`${classes.statusText} ${paymentStatus.status === 'FullyPaid' ? classes.fullPaid : classes.partialPaid}`}
          variant="body1"
        >
          {paymentStatus.status === 'FullyPaid' 
            ? t('payment.status.fullPaid', 'Fully Paid')
            : t('payment.status.partialPaid', 'Partially Paid')}
        </Typography>
        
        {paymentStatus.queuePosition !== null && (
          <Typography variant="body2" color="textSecondary">
            {t('payment.status.queuePosition', 'Queue Position')}: {parseInt(paymentStatus.queuePosition) + 1}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default PaymentStatusCard;
```

### 2. Komponenta za obavijesti o isplatama

```jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Snackbar, 
  IconButton, 
  Typography,
  Box
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import CloseIcon from '@material-ui/icons/Close';
import { useSocket } from '../hooks/useSocket';

const PaymentNotifications = () => {
  const { t } = useTranslation();
  const socket = useSocket();
  
  const [notification, setNotification] = useState(null);
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    if (!socket) return;
    
    const handlePaymentUpdate = (update) => {
      setNotification(update);
      setOpen(true);
    };
    
    socket.on('paymentUpdate', handlePaymentUpdate);
    
    return () => {
      socket.off('paymentUpdate', handlePaymentUpdate);
    };
  }, [socket]);
  
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };
  
  const getNotificationContent = () => {
    if (!notification) return null;
    
    switch (notification.type) {
      case 'partialPayment':
        return (
          <Box>
            <Typography variant="subtitle1">
              {t('notification.partialPayment.title', 'Partial Payment Received')}
            </Typography>
            <Typography variant="body2">
              {t('notification.partialPayment.message', 'You received {{amount}} USDT ({{percentage}}% of your winnings)', {
                amount: notification.paidAmount,
                percentage: notification.paymentPercentage
              })}
            </Typography>
          </Box>
        );
      
      case 'fullPayment':
        return (
          <Box>
            <Typography variant="subtitle1">
              {t('notification.fullPayment.title', 'Full Payment Received')}
            </Typography>
            <Typography variant="body2">
              {t('notification.fullPayment.message', 'You received your full winnings of {{amount}} USDT', {
                amount: notification.totalAmount
              })}
            </Typography>
          </Box>
        );
      
      case 'addedToQueue':
        return (
          <Box>
            <Typography variant="subtitle1">
              {t('notification.addedToQueue.title', 'Payment Queued')}
            </Typography>
            <Typography variant="body2">
              {t('notification.addedToQueue.message', 'Your payment of {{amount}} USDT has been queued and will be processed as funds become available', {
                amount: notification.pendingAmount
              })}
            </Typography>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  const getSeverity = () => {
    if (!notification) return 'info';
    
    switch (notification.type) {
      case 'fullPayment':
        return 'success';
      case 'partialPayment':
        return 'info';
      case 'addedToQueue':
        return 'warning';
      default:
        return 'info';
    }
  };
  
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={getSeverity()}
        action={
          <IconButton size="small" color="inherit" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        {getNotificationContent()}
      </Alert>
    </Snackbar>
  );
};

export default PaymentNotifications;
```

## Sigurnosna razmatranja

1. **Zaštita od reentry napada**:
   - Sve funkcije koje mijenjaju stanje koriste `nonReentrant` modifier
   - Ažuriranje stanja prije vanjskih poziva

2. **Ograničenje pristupa**:
   - Samo vlasnik ugovora može pokrenuti isplate i obradu reda čekanja
   - Implementirane provjere za sprječavanje neovlaštenih isplata

3. **Ograničenje gas troškova**:
   - Obrada reda čekanja ograničena na maksimalni broj oklada po pozivu
   - Optimizacija struktura podataka za učinkovito upravljanje redom čekanja

4. **Provjere stanja**:
   - Provjere dostupnih sredstava prije pokušaja isplate
   - Validacija statusa oklade prije obrade

## Prednosti implementacije

1. **Poboljšano korisničko iskustvo**:
   - Korisnici dobivaju barem dio svojih dobitaka odmah
   - Transparentno praćenje statusa isplate
   - Obavijesti o napretku isplate

2. **Održivost platforme**:
   - Platforma može nastaviti raditi i u slučaju velikih dobitaka
   - Postupna isplata dobitaka iz novih uplata

3. **Transparentnost**:
   - Korisnici imaju jasan uvid u status svoje isplate
   - Postotak isplate jasno prikazan

## Ograničenja i rizici

1. **Kašnjenje isplate**:
   - Korisnici možda neće odmah dobiti cijeli iznos dobitka
   - Potrebno jasno komunicirati očekivano vrijeme isplate

2. **Kompleksnost sustava**:
   - Povećana složenost smart ugovora
   - Potreba za dodatnim testiranjem i revizijom koda

3. **Gas troškovi**:
   - Obrada reda čekanja može biti skupa u smislu gas troškova
   - Potrebna optimizacija za smanjenje troškova

## Sljedeći koraci

1. Implementacija izmjena u smart ugovoru
2. Razvoj backend servisa za praćenje isplata
3. Implementacija frontend komponenti za prikaz statusa isplate
4. Testiranje cijelog sustava
5. Ažuriranje dokumentacije
