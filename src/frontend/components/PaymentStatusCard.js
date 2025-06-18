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
  
  // Fetch initial status
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
  
  // Listen for payment updates
  useEffect(() => {
    if (!socket) return;
    
    const handlePaymentUpdate = (update) => {
      if (update.betId === betId) {
        // Refresh status after receiving notification
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
        
        {paymentStatus.queuePosition !== null && paymentStatus.queuePosition !== undefined && (
          <Typography variant="body2" color="textSecondary">
            {t('payment.status.queuePosition', 'Queue Position')}: {parseInt(paymentStatus.queuePosition) + 1}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default PaymentStatusCard;
