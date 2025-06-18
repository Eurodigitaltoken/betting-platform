# Arhitektura aplikacije - Online kladionica s USDT na Ethereum blockchainu

## 1. Pregled arhitekture

Arhitektura online kladionice temelji se na modernom, skalabilnom i sigurnom dizajnu koji integrira frontend, backend, bazu podataka i blockchain komponente. Sustav je dizajniran s fokusom na korisničko iskustvo, sigurnost transakcija i real-time funkcionalnosti.

```
+-------------------+        +-------------------+        +-------------------+
|                   |        |                   |        |                   |
|     Frontend      |<------>|     Backend       |<------>|  Blockchain Layer |
|                   |        |                   |        |                   |
+-------------------+        +-------------------+        +-------------------+
         ^                           ^                            ^
         |                           |                            |
         v                           v                            v
+-------------------+        +-------------------+        +-------------------+
|                   |        |                   |        |                   |
|  Sports Data API  |        |   Database Layer  |        |  Ethereum Network |
|                   |        |                   |        |                   |
+-------------------+        +-------------------+        +-------------------+
```

## 2. Frontend arhitektura

### 2.1 Tehnologije
- **Framework**: React 18+ s TypeScript
- **Server-side rendering**: Next.js 13+
- **Stilizacija**: TailwindCSS
- **State Management**: Redux Toolkit ili React Context API
- **Real-time komunikacija**: Socket.io-client
- **Višejezična podrška**: i18next

### 2.2 Struktura komponenti

```
/src
  /components
    /common          # Zajedničke komponente (Button, Input, Modal, itd.)
    /layout          # Komponente za layout (Header, Footer, Sidebar)
    /sports          # Komponente za prikaz sportskih događaja
    /betting         # Komponente za klađenje
    /user            # Komponente za korisničke račune
    /blockchain      # Komponente za blockchain integraciju
    /admin           # Komponente za admin panel
  /pages             # Next.js stranice
  /hooks             # Custom React hooks
  /context           # React Context providers
  /store             # Redux store (ako se koristi)
  /services          # Servisi za API pozive
  /utils             # Pomoćne funkcije
  /locales           # Prijevodi za višejezičnu podršku
  /styles            # Globalni stilovi
```

### 2.3 Ključne stranice
1. **Početna stranica**
   - Prikaz popularnih događaja
   - Navigacija po sportovima
   - Prikaz događaja uživo

2. **Stranica sporta**
   - Filtriranje po ligama i datumima
   - Prikaz svih događaja za odabrani sport
   - Brzi odabir za klađenje

3. **Stranica događaja**
   - Detalji o događaju
   - Dostupne vrste oklada
   - Kvote u realnom vremenu

4. **Stranica za klađenje**
   - Forma za unos uloga
   - Prikaz potencijalnog dobitka
   - Prikaz manipulativnih troškova (2%)
   - Potvrda oklade

5. **Korisnički račun**
   - Pregled stanja računa
   - Povijest klađenja
   - Upravljanje USDT transakcijama

6. **Admin panel**
   - Upravljanje događajima
   - Pregled korisnika
   - Praćenje transakcija

## 3. Backend arhitektura

### 3.1 Tehnologije
- **Framework**: Node.js s Express.js ili NestJS
- **API**: RESTful API + WebSocket
- **Autentifikacija**: JWT (JSON Web Token)
- **Validacija**: Joi ili class-validator
- **Logging**: Winston ili Pino

### 3.2 Struktura modula

```
/src
  /controllers       # Kontroleri za API endpointe
  /services          # Poslovna logika
  /models            # Modeli podataka
  /repositories      # Pristup bazi podataka
  /middleware        # Middleware funkcije
  /utils             # Pomoćne funkcije
  /config            # Konfiguracija
  /websocket         # WebSocket handleri
  /blockchain        # Blockchain integracija
  /sports-api        # Integracija s API-jem za sportske podatke
  /i18n              # Višejezična podrška na backendu
```

### 3.3 Ključni API endpointi

#### Sportski događaji
- `GET /api/sports` - Dohvat svih sportova
- `GET /api/sports/:sportId/events` - Dohvat događaja za sport
- `GET /api/events/live` - Dohvat događaja uživo
- `GET /api/events/:eventId` - Dohvat detalja događaja

#### Klađenje
- `POST /api/bets` - Kreiranje nove oklade
- `GET /api/bets/user` - Dohvat oklada korisnika
- `GET /api/bets/:betId` - Dohvat detalja oklade

#### Korisnici
- `POST /api/auth/register` - Registracija korisnika
- `POST /api/auth/login` - Prijava korisnika
- `GET /api/users/profile` - Dohvat profila korisnika
- `PUT /api/users/profile` - Ažuriranje profila korisnika

#### Blockchain
- `POST /api/blockchain/deposit` - Iniciranje uplate USDT
- `POST /api/blockchain/withdraw` - Iniciranje isplate USDT
- `GET /api/blockchain/transactions` - Dohvat transakcija korisnika

#### Admin
- `GET /api/admin/events` - Dohvat svih događaja (admin)
- `POST /api/admin/events` - Kreiranje novog događaja
- `PUT /api/admin/events/:eventId` - Ažuriranje događaja
- `GET /api/admin/users` - Dohvat svih korisnika
- `GET /api/admin/transactions` - Dohvat svih transakcija

### 3.4 WebSocket eventi

- `odds_update` - Ažuriranje kvota
- `event_update` - Ažuriranje statusa događaja
- `bet_result` - Rezultat oklade

## 4. Baza podataka

### 4.1 Tehnologije
- **Primarna baza**: PostgreSQL
- **Cache**: Redis

### 4.2 Shema baze podataka

#### Korisnici
```
users
  id: UUID (PK)
  username: VARCHAR
  email: VARCHAR
  password_hash: VARCHAR
  ethereum_address: VARCHAR
  balance: DECIMAL
  language: VARCHAR
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
```

#### Sportovi
```
sports
  id: UUID (PK)
  name: VARCHAR
  icon: VARCHAR
  active: BOOLEAN
```

#### Događaji
```
events
  id: UUID (PK)
  sport_id: UUID (FK)
  home_team: VARCHAR
  away_team: VARCHAR
  start_time: TIMESTAMP
  status: VARCHAR
  result: VARCHAR
  live: BOOLEAN
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
```

#### Kvote
```
odds
  id: UUID (PK)
  event_id: UUID (FK)
  type: VARCHAR
  value: DECIMAL
  updated_at: TIMESTAMP
```

#### Oklade
```
bets
  id: UUID (PK)
  user_id: UUID (FK)
  event_id: UUID (FK)
  odds_id: UUID (FK)
  amount: DECIMAL
  fee_amount: DECIMAL
  potential_win: DECIMAL
  status: VARCHAR
  result: VARCHAR
  created_at: TIMESTAMP
  settled_at: TIMESTAMP
```

#### Transakcije
```
transactions
  id: UUID (PK)
  user_id: UUID (FK)
  type: VARCHAR
  amount: DECIMAL
  fee: DECIMAL
  ethereum_tx_hash: VARCHAR
  status: VARCHAR
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
```

### 4.3 Redis cache
- Privremena pohrana kvota
- Sesije korisnika
- Rate limiting
- Podaci o događajima uživo

## 5. Blockchain integracija

### 5.1 Tehnologije
- **Mreža**: Ethereum testna mreža (Goerli ili Sepolia)
- **Token**: USDT (ERC-20)
- **Biblioteke**: Web3.js ili Ethers.js
- **Wallet integracija**: MetaMask ili WalletConnect

### 5.2 Smart Contract funkcionalnosti
- Provjera stanja USDT
- Prihvaćanje uplata
- Izvršavanje isplata
- Provjera transakcija

### 5.3 Proces transakcija

#### Uplata
1. Korisnik inicira uplatu kroz sučelje
2. Sustav generira jedinstveni identifikator transakcije
3. Korisnik potvrđuje transakciju kroz Ethereum novčanik
4. Backend prati status transakcije na blockchainu
5. Nakon potvrde, stanje računa se ažurira u bazi podataka

#### Isplata
1. Korisnik zahtijeva isplatu
2. Sustav provjerava stanje računa i ograničenja
3. Backend inicira transakciju na blockchainu
4. Korisnik prima USDT na svoju Ethereum adresu
5. Transakcija se bilježi u bazi podataka

## 6. Integracija s API-jem za sportske podatke

### 6.1 Funkcionalnosti
- Dohvat popisa sportova
- Dohvat događaja po sportu
- Dohvat kvota za događaje
- Praćenje rezultata uživo
- Ažuriranje konačnih rezultata

### 6.2 Proces ažuriranja podataka
1. Periodičko dohvaćanje novih događaja
2. Real-time praćenje promjena kvota
3. Ažuriranje baze podataka
4. Slanje obavijesti klijentima putem WebSocketa

## 7. Višejezična podrška

### 7.1 Podržani jezici
- Engleski
- Francuski
- Španjolski

### 7.2 Implementacija
- Odvojeni JSON datoteke za svaki jezik
- Dinamičko učitavanje prijevoda
- Detekcija jezika korisnika
- Mogućnost ručnog odabira jezika
- Lokalizacija datuma, vremena i valuta

## 8. Sigurnost

### 8.1 Autentifikacija i autorizacija
- JWT tokeni za autentifikaciju
- Role-based pristup (korisnik, admin)
- Sigurno pohranjivanje lozinki (bcrypt)
- Rate limiting za API pozive

### 8.2 Blockchain sigurnost
- Verifikacija Ethereum adresa
- Provjera transakcija
- Ograničenja za uplate i isplate
- Monitoring sumnjivih aktivnosti

### 8.3 Zaštita podataka
- HTTPS enkripcija
- Zaštita od SQL injekcija
- Zaštita od XSS napada
- CSRF tokeni

## 9. Skalabilnost i performanse

### 9.1 Strategije skaliranja
- Horizontalno skaliranje backend servisa
- Redis caching za smanjenje opterećenja baze
- CDN za statičke resurse
- Optimizacija database upita

### 9.2 Monitoring i održavanje
- Logging sustav
- Praćenje performansi
- Automatske obavijesti o problemima
- Backup strategija

## 10. Zaključak

Predložena arhitektura pruža robustan okvir za razvoj online kladionice s USDT na Ethereum blockchainu. Arhitektura je dizajnirana s fokusom na skalabilnost, sigurnost i korisničko iskustvo, uz podršku za sve zahtijevane funkcionalnosti.

Ključne prednosti ove arhitekture su:
- Modularni dizajn koji omogućuje jednostavno održavanje i proširenje
- Real-time funkcionalnosti za ažuriranje kvota i rezultata
- Sigurna integracija s Ethereum blockchainom
- Višejezična podrška za širu dostupnost
- Skalabilnost za podršku rastućem broju korisnika

Sljedeći korak je implementacija osnovne infrastrukture prema ovoj arhitekturi, počevši od postavljanja razvojnog okruženja i konfiguracije testne Ethereum mreže.
