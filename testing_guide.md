# Vodič za pokusno korištenje online kladionice

Ovaj vodič sadrži detaljne upute za lokalno testiranje online kladionice s USDT na Ethereum blockchainu. Slijedite ove korake kako biste postavili razvojno okruženje i testirali sve funkcionalnosti aplikacije.

## Preduvjeti

Prije početka testiranja, potrebno je instalirati sljedeće:

1. **Node.js i npm** (verzija 14.0.0 ili novija)
   - Preuzmite s [nodejs.org](https://nodejs.org/)
   - Provjerite instalaciju: `node -v` i `npm -v`

2. **Git**
   - Preuzmite s [git-scm.com](https://git-scm.com/)
   - Provjerite instalaciju: `git --version`

3. **MetaMask ili MEW novčanik**
   - **Za desktop**: Instalirajte [MetaMask](https://metamask.io/download/) ili [MEW](https://www.myetherwallet.com/) ekstenziju za preglednik
   - **Za mobilno**: Instalirajte [MetaMask Mobile](https://metamask.io/download/) ili [MEW Mobile](https://www.mewwallet.com/) aplikaciju

4. **PostgreSQL** (verzija 12 ili novija)
   - Preuzmite s [postgresql.org](https://www.postgresql.org/download/)
   - Kreirajte bazu podataka za aplikaciju

5. **Redis** (opciono, za caching)
   - Preuzmite s [redis.io](https://redis.io/download)

## Postavljanje projekta

### 1. Kloniranje repozitorija

```bash
git clone https://github.com/vas-repozitorij/betting-platform.git
cd betting-platform
```

### 2. Instalacija ovisnosti

```bash
npm install
```

### 3. Postavljanje .env datoteke

Kreirajte `.env` datoteku u korijenskom direktoriju projekta sa sljedećim sadržajem:

```
# Blockchain konfiguracija
REACT_APP_INFURA_ID=your-infura-id
REACT_APP_NETWORK_ID=11155111  # Sepolia testnet
REACT_APP_USDT_CONTRACT_ADDRESS=0x...  # Adresa USDT ugovora na testnoj mreži
REACT_APP_BETTING_CONTRACT_ADDRESS=0x...  # Adresa betting ugovora na testnoj mreži
REACT_APP_PLATFORM_WALLET=0x3AbA3Eb93572e77fD9bAABAD2EA26123750fECf3
REACT_APP_ADMIN_FEE_WALLET=0xE4A87598050D7877a79E2BEff12A25Be636c557e

# Baza podataka
DB_HOST=localhost
DB_PORT=5432
DB_NAME=betting_platform
DB_USER=postgres
DB_PASSWORD=your-password

# API konfiguracija
ODDS_API_KEY=your-odds-api-key
```

### 4. Postavljanje baze podataka

```bash
# Kreiranje baze podataka
psql -U postgres -c "CREATE DATABASE betting_platform;"

# Pokretanje migracija
npm run migrate
```

### 5. Deployment smart ugovora na testnu mrežu

```bash
# Kompiliranje ugovora
npx hardhat compile

# Deployment na Sepolia testnu mrežu
npx hardhat run scripts/deploy.js --network sepolia
```

Nakon deploymenta, zabilježite adresu ugovora i ažurirajte `REACT_APP_BETTING_CONTRACT_ADDRESS` u `.env` datoteci.

### 6. Pokretanje aplikacije

```bash
# Pokretanje backend servera
npm run server

# U novom terminalu, pokretanje frontend aplikacije
npm run client
```

Aplikacija će biti dostupna na `http://localhost:3000`.

## Postavljanje novčanika za testiranje

### 1. Postavljanje MetaMask-a

1. Instalirajte MetaMask ekstenziju za preglednik
2. Kreirajte novi račun ili koristite postojeći
3. Prebacite na Sepolia testnu mrežu:
   - Kliknite na padajući izbornik mreža (obično piše "Ethereum Mainnet")
   - Odaberite "Sepolia Test Network"
   - Ako nije dostupna, idite na Settings > Networks > Add Network i dodajte:
     - Network Name: Sepolia Test Network
     - New RPC URL: https://sepolia.infura.io/v3/your-infura-id
     - Chain ID: 11155111
     - Currency Symbol: ETH
     - Block Explorer URL: https://sepolia.etherscan.io

### 2. Nabavka testnih ETH i USDT tokena

1. **Testni ETH**:
   - Posjetite [Sepolia Faucet](https://sepoliafaucet.com/)
   - Unesite svoju Ethereum adresu
   - Kliknite "Send Me ETH"

2. **Testni USDT**:
   - Za testiranje možete koristiti testni USDT ugovor na Sepolia mreži
   - Adresa testnog USDT ugovora: `0x...` (koristite adresu iz `.env` datoteke)
   - Možete dobiti testne USDT tokene putem [Sepolia USDT Faucet](https://faucet.sepolia.network/)

### 3. Postavljanje MEW novčanika (alternativa)

1. Instalirajte MEW ekstenziju za preglednik ili MEW mobilnu aplikaciju
2. Kreirajte novi račun ili importirajte postojeći
3. Prebacite na Sepolia testnu mrežu
4. Nabavite testne ETH i USDT tokene kao što je opisano iznad

## Testiranje aplikacije

### 1. Registracija i prijava

1. Otvorite aplikaciju na `http://localhost:3000`
2. Kliknite na "Registracija" u gornjem desnom kutu
3. Unesite svoje podatke i kreirajte račun
4. Prijavite se s kreiranim računom

### 2. Povezivanje novčanika

1. Nakon prijave, kliknite na "Povezivanje novčanika" u korisničkom profilu
2. Odaberite tip novčanika:
   - **Desktop**: MetaMask ili MyEtherWallet
   - **Mobilno**: MetaMask Mobile ili MEW Mobile
3. Za mobilne novčanike, skenirajte prikazani QR kod s mobilnom aplikacijom
4. Potvrdite povezivanje u sučelju novčanika

### 3. Uplata USDT tokena

1. Idite na stranicu "Moj račun"
2. Kliknite na "Uplata"
3. Unesite iznos USDT-a koji želite uplatiti (maksimalno 9999 USDT)
4. Kliknite na "Uplati"
5. Potvrdite transakciju u sučelju novčanika
6. Pričekajte da se transakcija potvrdi na blockchainu

### 4. Pregled sportskih događaja

1. Idite na početnu stranicu
2. Pregledajte dostupne sportske događaje
3. Koristite filtere za odabir sporta (nogomet, košarka, tenis, NFL, hokej)
4. Kliknite na događaj za prikaz detalja i dostupnih opcija klađenja

### 5. Postavljanje oklade

1. Na stranici događaja, odaberite tip oklade (npr. "Pobjeda domaćina")
2. Unesite iznos oklade
3. Provjerite prikazani potencijalni dobitak i naknadu od 5%
4. Kliknite na "Postavi okladu"
5. Potvrdite transakciju u sučelju novčanika
6. Pričekajte da se transakcija potvrdi na blockchainu

### 6. Pregled aktivnih oklada

1. Idite na stranicu "Moje oklade"
2. Pregledajte listu aktivnih oklada
3. Kliknite na okladu za prikaz detalja

### 7. Isplata sredstava

1. Idite na stranicu "Moj račun"
2. Kliknite na "Isplata"
3. Unesite iznos USDT-a koji želite isplatiti
4. Kliknite na "Isplati"
5. Potvrdite transakciju u sučelju novčanika
6. Pričekajte da se transakcija potvrdi na blockchainu

## Testiranje mobilnih novčanika

### 1. MetaMask Mobile

1. Instalirajte MetaMask Mobile aplikaciju na svoj mobilni uređaj
2. Postavite račun i prebacite na Sepolia testnu mrežu
3. Na web aplikaciji, kliknite na "Povezivanje novčanika" i odaberite "MetaMask Mobile"
4. Otvorite MetaMask Mobile aplikaciju i skenirajte prikazani QR kod
5. Potvrdite povezivanje u mobilnoj aplikaciji
6. Koristite mobilnu aplikaciju za potvrdu transakcija prilikom klađenja

### 2. MEW Mobile

1. Instalirajte MEW Mobile aplikaciju na svoj mobilni uređaj
2. Postavite račun
3. Na web aplikaciji, kliknite na "Povezivanje novčanika" i odaberite "MEW Mobile"
4. Otvorite MEW Mobile aplikaciju i skenirajte prikazani QR kod
5. Potvrdite povezivanje u mobilnoj aplikaciji
6. Koristite mobilnu aplikaciju za potvrdu transakcija prilikom klađenja

## Rješavanje problema

### Problem: Ne mogu se povezati s novčanikom

**Rješenje**:
- Provjerite jeste li na Sepolia testnoj mreži
- Osvježite stranicu i pokušajte ponovno
- Provjerite imate li instaliranu najnoviju verziju novčanika
- Očistite cache preglednika i pokušajte ponovno

### Problem: Transakcija je odbijena

**Rješenje**:
- Provjerite imate li dovoljno ETH za gas troškove
- Provjerite imate li dovoljno USDT tokena za transakciju
- Provjerite jeste li odobrili pristup USDT tokenima

### Problem: QR kod se ne prikazuje ili ne radi

**Rješenje**:
- Provjerite jeste li omogućili JavaScript u pregledniku
- Osvježite stranicu i pokušajte ponovno
- Provjerite imate li stabilnu internet vezu
- Provjerite jeste li instalirali najnoviju verziju mobilne aplikacije

### Problem: Aplikacija se ne pokreće

**Rješenje**:
- Provjerite jeste li instalirali sve ovisnosti (`npm install`)
- Provjerite jeste li pravilno postavili `.env` datoteku
- Provjerite jesu li PostgreSQL i Redis servisi pokrenuti
- Provjerite logove za specifične greške

## Kontakt za podršku

Ako naiđete na probleme koje ne možete riješiti, kontaktirajte nas na:
- Email: support@betting-platform.com
- Telegram: @betting_platform_support

## Napomene

- Ovo je testno okruženje koje koristi testnu Ethereum mrežu (Sepolia)
- Sve transakcije su besplatne i ne koriste pravi novac
- Testni USDT tokeni nemaju stvarnu vrijednost
- Aplikacija je optimizirana za Chrome, Firefox i Edge preglednike
