# Tehnička dokumentacija za sustav parcijalnih isplata

## Pregled sustava

Sustav parcijalnih isplata omogućuje kladionici da isplaćuje dobitke korisnicima čak i kada nema dovoljno sredstava za isplatu svih dobitaka odjednom. Sustav automatski isplaćuje maksimalni mogući iznos iz trenutno dostupnih sredstava, a preostali iznos stavlja u red čekanja za isplatu kada nova sredstva postanu dostupna.

## Arhitektura sustava

Sustav parcijalnih isplata sastoji se od sljedećih komponenti:

1. **Smart ugovor** - `USDTBettingPlatformWithPartialPayouts.sol`
2. **Backend servisi** - Kontroleri i API endpointi za praćenje statusa isplate
3. **WebSocket servisi** - Obavijesti u realnom vremenu o promjenama statusa isplate
4. **Frontend komponente** - Prikaz statusa isplate i obavijesti korisnicima

### Smart ugovor

Smart ugovor `USDTBettingPlatformWithPartialPayouts.sol` proširuje osnovni ugovor `USDTBettingPlatform.sol` s podrškom za parcijalne isplate. Glavne promjene uključuju:

1. **Prošireni BetStatus enum**:
   ```solidity
   enum BetStatus { Pending, Settled, PartiallyPaid, FullyPaid, Cancelled }
   ```

2. **Proširena Bet struktura**:
   ```solidity
   struct Bet {
       // Postojeća polja...
       uint256 paidAmount;         // Iznos koji je već isplaćen
       uint256 remainingAmount;    // Preostali iznos za isplatu
       uint256 lastPaymentTime;    // Vrijeme zadnje isplate
       uint256 paymentPercentage;  // Postotak isplaćenog iznosa (0-100)
   }
   ```

3. **Red čekanja za isplate**:
   ```solidity
   uint256[] public paymentQueue;
   mapping(uint256 => uint256) public paymentQueuePositions;
   ```

4. **Novi događaji (Events)**:
   ```solidity
   event BetPartiallyPaid(uint256 indexed betId, address indexed bettor, uint256 paidAmount, uint256 remainingAmount, uint256 paymentPercentage);
   event BetFullyPaid(uint256 indexed betId, address indexed bettor, uint256 totalAmount);
   event BetAddedToPaymentQueue(uint256 indexed betId, address indexed bettor, uint256 pendingAmount);
   ```

### Backend servisi

Backend servisi uključuju:

1. **PaymentController** - Kontroler za upravljanje isplatama i praćenje statusa
2. **PaymentRoutes** - API endpointi za dohvat statusa isplate i obavijesti
3. **PaymentNotificationService** - WebSocket servis za obavijesti u realnom vremenu

#### API endpointi

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/payments/payment-status/:betId` | GET | Dohvat statusa isplate za određenu okladu |
| `/api/payments/partial-payments/:userAddress` | GET | Dohvat svih parcijalnih isplata za korisnika |
| `/api/payments/payment-queue-position/:betId` | GET | Dohvat pozicije u redu čekanja za isplatu |
| `/api/payments/process-payment-queue` | POST | Obrada reda čekanja za isplatu (samo admin) |
| `/api/payments/notifications/:userAddress` | GET | Dohvat svih obavijesti o isplatama za korisnika |
| `/api/payments/notifications/:id/read` | PUT | Označavanje obavijesti kao pročitane |

### Frontend komponente

Frontend komponente uključuju:

1. **PaymentStatusCard** - Komponenta za prikaz statusa isplate s vizualnim indikatorom postotka
2. **PaymentNotifications** - Komponenta za prikaz obavijesti o isplatama
3. **UserBetDetails** - Stranica s detaljima oklade koja uključuje prikaz statusa isplate

## Tok podataka

1. Korisnik postavlja okladu kroz `placeBet` funkciju
2. Kada korisnik osvoji okladu, poziva se `settleBet` funkcija
3. Ako nema dovoljno sredstava za isplatu cijelog dobitka:
   - Isplaćuje se maksimalni mogući iznos
   - Preostali iznos se stavlja u red čekanja
   - Emitira se `BetPartiallyPaid` ili `BetAddedToPaymentQueue` događaj
4. WebSocket servis osluškuje događaje i šalje obavijesti korisnicima
5. Frontend komponente prikazuju status isplate i obavijesti

## Automatska obrada isplata

Sustav uključuje automatsku obradu reda čekanja za isplate:

1. Kada nova sredstva postanu dostupna (kroz nove uplate ili depozite), automatski se poziva `processPaymentQueue` funkcija
2. Funkcija obrađuje red čekanja prema redoslijedu "prvi došao, prvi poslužen" (FIFO)
3. Za svaku okladu u redu, isplaćuje se maksimalni mogući iznos iz dostupnih sredstava
4. Ako je oklada potpuno isplaćena, uklanja se iz reda čekanja

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

## Deployment i konfiguracija

### Deployment smart ugovora

Za deployment novog smart ugovora s podrškom za parcijalne isplate:

```bash
npx hardhat run src/blockchain/scripts/deploy_partial_payouts.js --network sepolia
```

### Migracija podataka

Za migraciju podataka iz starog ugovora u novi:

```bash
npx hardhat run src/blockchain/scripts/migrate_data.js --network sepolia
```

### Konfiguracija backend servisa

U `config.js` datoteci postavite adresu novog ugovora:

```javascript
module.exports = {
  // ...
  contractAddress: "0x...", // Adresa novog ugovora
  // ...
};
```

## Testiranje

### End-to-end testovi

Za pokretanje end-to-end testova:

```bash
npx hardhat test tests/partial_payout_e2e.test.js
```

### Testiranje na testnoj mreži

1. Postavite okladu kroz frontend sučelje
2. Simulirajte nedostatak sredstava povlačenjem većine sredstava iz ugovora
3. Postavite okladu kao dobitnu kroz admin sučelje
4. Provjerite status isplate i obavijesti
5. Dodajte nova sredstva i provjerite automatsku obradu isplata

## Rješavanje problema

### Problem: Isplate se ne obrađuju automatski

**Rješenje**:
- Provjerite ima li dovoljno ETH za gas troškove na admin računu
- Provjerite je li WebSocket servis ispravno konfiguriran
- Provjerite logove za greške u automatskoj obradi

### Problem: Korisnici ne primaju obavijesti

**Rješenje**:
- Provjerite je li WebSocket veza uspostavljena
- Provjerite jesu li korisnici pretplaćeni na odgovarajuće kanale
- Provjerite logove za greške u WebSocket servisu

### Problem: Netočan status isplate

**Rješenje**:
- Provjerite je li oklada u ispravnom statusu u smart ugovoru
- Provjerite je li backend ispravno dohvaća podatke iz smart ugovora
- Provjerite je li frontend ispravno prikazuje podatke iz API-ja

## API reference

### Smart ugovor

#### `settleBet(uint256 _betId, bool _won)`
Postavlja okladu kao dobitnu ili gubitnu i inicira isplatu ako je dobitna.

#### `processPaymentQueue()`
Obrađuje red čekanja za isplate prema redoslijedu "prvi došao, prvi poslužen" (FIFO).

#### `getPaymentQueuePosition(uint256 _betId)`
Vraća poziciju oklade u redu čekanja za isplatu.

### Backend API

#### `GET /api/payments/payment-status/:betId`
Vraća status isplate za određenu okladu.

Primjer odgovora:
```json
{
  "betId": "123",
  "status": "PartiallyPaid",
  "paidAmount": "500",
  "remainingAmount": "1500",
  "paymentPercentage": 25,
  "lastPaymentTime": "2025-06-01T03:30:00.000Z",
  "queuePosition": 0
}
```

#### `GET /api/payments/partial-payments/:userAddress`
Vraća sve parcijalne isplate za korisnika.

#### `GET /api/payments/payment-queue-position/:betId`
Vraća poziciju oklade u redu čekanja za isplatu s procjenom vremena isplate.

### WebSocket događaji

#### `paymentUpdate`
Emitira se kada se promijeni status isplate.

Primjer događaja:
```json
{
  "type": "partialPayment",
  "betId": "123",
  "paidAmount": "500",
  "remainingAmount": "1500",
  "paymentPercentage": 25,
  "timestamp": "2025-06-01T03:30:00.000Z"
}
```

## Zaključak

Sustav parcijalnih isplata omogućuje kladionici da isplaćuje dobitke korisnicima čak i kada nema dovoljno sredstava za isplatu svih dobitaka odjednom. Sustav je dizajniran da bude transparentan, siguran i učinkovit, s automatskom obradom isplata i obavijestima u realnom vremenu.
