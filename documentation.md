# Dokumentacija - Online Kladionica s USDT na Ethereum Blockchainu

## Pregled projekta

Ova dokumentacija opisuje implementaciju online kladionice koja koristi USDT kriptovalutu na Ethereum blockchainu za uplatu i isplatu sredstava. Aplikacija omogućuje korisnicima klađenje na sportske događaje iz pet različitih sportova (nogomet, košarka, tenis, NFL i hokej na ledu) s transparentnim prikazom manipulativnih troškova od 5% i ograničenjem maksimalne uplate od 9999 USDT.

## Tehnički stack

### Frontend
- **React** - JavaScript biblioteka za izgradnju korisničkog sučelja
- **Next.js** - React framework za server-side rendering i statičku generaciju
- **TypeScript** - Nadskup JavaScripta koji dodaje statičke tipove
- **TailwindCSS** - Utility-first CSS framework
- **i18next** - Biblioteka za višejezičnu podršku
- **Web3.js** - Biblioteka za interakciju s Ethereum blockchainom

### Backend
- **Node.js** - JavaScript runtime za server-side programiranje
- **Express.js** - Web framework za Node.js
- **PostgreSQL** - Relacijska baza podataka
- **Redis** - In-memory baza podataka za caching
- **Socket.io** - Biblioteka za real-time komunikaciju
- **JWT** - JSON Web Tokens za autentifikaciju

### Blockchain
- **Ethereum** - Blockchain platforma
- **Solidity** - Programski jezik za smart ugovore
- **Hardhat** - Razvojno okruženje za Ethereum
- **USDT (ERC-20)** - Stablecoin token na Ethereum mreži
- **Web3.js/Ethers.js** - Biblioteke za interakciju s Ethereum blockchainom

## Arhitektura aplikacije

Aplikacija je podijeljena u tri glavna dijela:

1. **Frontend** - Korisnički dio aplikacije koji omogućuje pregled sportskih događaja, klađenje, upravljanje računom i interakciju s Ethereum novčanikom.

2. **Backend** - Serverski dio aplikacije koji upravlja korisničkim računima, sportskim podacima, okladama i komunikacijom s blockchainom.

3. **Blockchain** - Smart ugovori na Ethereum mreži koji upravljaju USDT transakcijama, okladama i isplatama.

### Dijagram arhitekture

```
+-------------------+       +-------------------+       +-------------------+
|                   |       |                   |       |                   |
|     Frontend      |<----->|      Backend      |<----->|    Blockchain     |
|                   |       |                   |       |                   |
+-------------------+       +-------------------+       +-------------------+
        |                           |                           |
        v                           v                           v
+-------------------+       +-------------------+       +-------------------+
|                   |       |                   |       |                   |
|  User Interface   |       |   Database &      |       |  Smart Contracts  |
|                   |       |     Caching       |       |                   |
+-------------------+       +-------------------+       +-------------------+
```

## Funkcionalnosti aplikacije

### Početna stranica
- Prikaz sportskih događaja s mogućnošću filtriranja po sportovima i datumima
- Prikaz događaja uživo s rezultatima u realnom vremenu
- Prikaz kvota za različite tipove klađenja
- Višejezična podrška (engleski, francuski, španjolski)

### Stranica za klađenje
- Odabir rezultata klađenja (pobjeda domaćina, neriješeno, pobjeda gosta)
- Prikaz kvota u realnom vremenu
- Izračun potencijalnog dobitka
- Transparentni prikaz manipulativnih troškova (5%)
- Ograničenje maksimalne uplate (9999 USDT)

### Korisnički račun
- Registracija i prijava korisnika
- Prikaz stanja računa u USDT
- Uplata i isplata USDT putem Ethereum blockchaina
- Pregled povijesti klađenja i transakcija

### Blockchain integracija
- Povezivanje s MetaMask novčanikom
- USDT transakcije na Ethereum mreži
- Smart ugovori za automatsku isplatu dobitaka
- Sigurnosni mehanizmi za transakcije

## Struktura projekta

```
betting_platform_project/
├── src/
│   ├── frontend/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── styles/
│   │   └── locales/
│   ├── backend/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   └── websocket/
│   ├── blockchain/
│   │   ├── contracts/
│   │   ├── scripts/
│   │   └── utils/
│   └── database/
│       ├── migrations/
│       └── seeds/
├── tests/
│   ├── frontend.test.js
│   ├── backend.test.js
│   └── blockchain.test.js
├── public/
├── hardhat.config.js
├── package.json
└── .env
```

## Instalacija i pokretanje

### Preduvjeti
- Node.js (v14+)
- PostgreSQL
- Redis
- MetaMask ekstenzija za preglednik

### Instalacija
1. Klonirajte repozitorij
   ```
   git clone https://github.com/example/betting-platform.git
   cd betting-platform
   ```

2. Instalirajte ovisnosti
   ```
   npm install
   ```

3. Postavite environment varijable
   ```
   cp .env.example .env
   ```
   Uredite `.env` datoteku s vašim postavkama.

4. Pokrenite migracije baze podataka
   ```
   npm run migrate
   ```

5. Kompajlirajte i deployjajte smart ugovore
   ```
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network sepolia
   ```
   Ažurirajte `.env` datoteku s adresom deployjanog ugovora.

### Pokretanje
1. Pokrenite backend server
   ```
   npm run server
   ```

2. Pokrenite frontend aplikaciju
   ```
   npm run client
   ```

3. Otvorite aplikaciju u pregledniku
   ```
   http://localhost:3000
   ```

## API dokumentacija

### Sports API
- `GET /api/sports` - Dohvat svih sportova
- `GET /api/sports/:sportId/events` - Dohvat događaja za određeni sport
- `GET /api/events/:eventId` - Dohvat detalja događaja
- `GET /api/events/live` - Dohvat događaja uživo

### Authentication API
- `POST /api/auth/register` - Registracija novog korisnika
- `POST /api/auth/login` - Prijava korisnika
- `GET /api/auth/me` - Dohvat trenutnog korisnika
- `PUT /api/auth/me` - Ažuriranje korisničkog profila

### Betting API
- `POST /api/bets` - Postavljanje oklade
- `GET /api/bets` - Dohvat korisničkih oklada

### Wallet API
- `POST /api/wallet/deposit` - Uplata USDT
- `POST /api/wallet/withdraw` - Isplata USDT
- `GET /api/wallet/transactions` - Dohvat korisničkih transakcija

### Blockchain API
- `GET /api/blockchain/status` - Dohvat statusa blockchaina
- `POST /api/blockchain/accounts` - Kreiranje Ethereum računa

## Smart ugovori

### USDTBettingPlatform.sol
Glavni smart ugovor za kladionicu koji upravlja USDT transakcijama, okladama i isplatama.

#### Funkcije
- `placeBet(uint256 _amount, string _eventId, string _outcomeId, uint256 _potentialWin)` - Postavljanje oklade
- `settleBet(uint256 _betId, bool _won)` - Rješavanje oklade (samo admin)
- `cancelBet(uint256 _betId)` - Otkazivanje oklade (samo admin)
- `withdrawFees(uint256 _amount)` - Povlačenje naknada (samo admin)
- `deposit(uint256 _amount)` - Uplata USDT
- `withdraw(address _to, uint256 _amount)` - Isplata USDT (samo admin)
- `getUserBets(address _user)` - Dohvat korisničkih oklada
- `getBet(uint256 _betId)` - Dohvat detalja oklade
- `getContractBalance()` - Dohvat stanja ugovora

## Višejezična podrška

Aplikacija podržava tri jezika:
- Engleski (zadani)
- Francuski
- Španjolski

Prijevodi su organizirani u JSON datotekama u direktoriju `src/frontend/locales`.

## Testiranje

### Frontend testovi
```
npm run test:frontend
```

### Backend testovi
```
npm run test:backend
```

### Blockchain testovi
```
npm run test:blockchain
```

## Sigurnost

- HTTPS enkripcija
- JWT (JSON Web Token) za autentifikaciju
- Sigurnosne provjere za blockchain transakcije
- Ograničenje maksimalne uplate (9999 USDT)
- Sigurnosni mehanizmi u smart ugovorima

## Održavanje i nadogradnja

### Ažuriranje sportskih podataka
Sportski podaci se dohvaćaju putem The Odds API-ja i automatski ažuriraju u bazi podataka. Kvote se ažuriraju svakih 60 sekundi, a rezultati uživo svakih 30 sekundi.

### Dodavanje novih sportova
Za dodavanje novih sportova potrebno je:
1. Dodati novi sport u `SPORT_KEYS` objekt u `src/backend/config/odds-api.js`
2. Dodati prijevode za novi sport u lokalizacijske datoteke
3. Dodati ikonu za novi sport u `public/images/sports`

### Nadogradnja smart ugovora
Za nadogradnju smart ugovora potrebno je:
1. Implementirati novi ugovor
2. Deployati novi ugovor na Ethereum mrežu
3. Ažurirati adresu ugovora u `.env` datoteci
4. Ažurirati ABI u `src/blockchain/utils`

## Zaključak

Ova online kladionica predstavlja modernu platformu za klađenje koja koristi prednosti blockchain tehnologije za sigurne i transparentne transakcije. Korištenje USDT stablecoina na Ethereum mreži omogućuje stabilnost vrijednosti i globalni pristup, dok implementacija smart ugovora osigurava automatizaciju i transparentnost procesa klađenja i isplata.
