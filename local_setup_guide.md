# Vodič za lokalno pokretanje online kladionice

Ovaj vodič sadrži detaljne upute za pokretanje online kladionice s podrškom za parcijalne isplate na vašem lokalnom računalu koristeći Docker.

## Preduvjeti

Prije početka, potrebno je instalirati Docker i Docker Compose na vašem računalu:

### Windows
1. Preuzmite i instalirajte [Docker Desktop za Windows](https://www.docker.com/products/docker-desktop)
2. Tijekom instalacije, slijedite zadane postavke
3. Nakon instalacije, pokrenite Docker Desktop
4. Pričekajte da Docker Desktop pokrene Docker Engine (ikona u system tray-u će postati zelena)

### macOS
1. Preuzmite i instalirajte [Docker Desktop za Mac](https://www.docker.com/products/docker-desktop)
2. Povucite Docker ikonu u Applications folder
3. Pokrenite Docker Desktop iz Applications foldera
4. Pričekajte da Docker Desktop pokrene Docker Engine (ikona u menu bar-u će postati zelena)

### Linux
1. Instalirajte Docker koristeći upute za vašu distribuciju:
   - [Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
   - [Debian](https://docs.docker.com/engine/install/debian/)
   - [Fedora](https://docs.docker.com/engine/install/fedora/)
   - [CentOS](https://docs.docker.com/engine/install/centos/)
2. Instalirajte Docker Compose:
   ```bash
   sudo apt-get install docker-compose-plugin
   ```

## Preuzimanje projekta

1. Preuzmite ZIP arhivu projekta s priloženog linka
2. Raspakirajte arhivu u željeni direktorij na vašem računalu
3. Otvorite terminal (Command Prompt ili PowerShell na Windows-u, Terminal na macOS/Linux)
4. Navigirajte do direktorija projekta:
   ```bash
   cd put/do/betting_platform_project
   ```

## Pokretanje aplikacije

### 1. Pokretanje Docker kontejnera

U terminalu, unutar direktorija projekta, izvršite sljedeću naredbu:

```bash
docker-compose up -d
```

Ova naredba će:
- Preuzeti potrebne Docker slike
- Izgraditi kontejnere za backend i frontend
- Pokrenuti sve servise (MongoDB, Redis, Ganache, Backend, Frontend)

Prvo pokretanje može potrajati nekoliko minuta jer Docker mora preuzeti sve potrebne slike i izgraditi kontejnere.

### 2. Provjera statusa kontejnera

Da biste provjerili jesu li svi kontejneri uspješno pokrenuti, izvršite:

```bash
docker-compose ps
```

Trebali biste vidjeti 5 kontejnera sa statusom "Up":
- mongodb
- redis
- ganache
- backend
- frontend

### 3. Deployment smart ugovora

Nakon što su svi kontejneri pokrenuti, potrebno je deployati smart ugovor na lokalnu blockchain mrežu:

```bash
docker-compose exec backend npx hardhat run src/blockchain/scripts/deploy_partial_payouts.js --network localhost
```

Ova naredba će deployati smart ugovor s podrškom za parcijalne isplate na lokalnu Ganache blockchain mrežu i ažurirati adresu ugovora u konfiguraciji.

## Pristup aplikaciji

Nakon što su svi kontejneri pokrenuti i smart ugovor je deployan, možete pristupiti aplikaciji:

### Frontend aplikacija
- Otvorite web preglednik i posjetite: [http://localhost:3000](http://localhost:3000)

### Backend API
- Backend API je dostupan na: [http://localhost:3001/api](http://localhost:3001/api)
- Swagger dokumentacija API-ja: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

### Blockchain (Ganache)
- Lokalna blockchain mreža je dostupna na: [http://localhost:8545](http://localhost:8545)
- Možete koristiti MetaMask za povezivanje s lokalnom mrežom (Network ID: 5777)

## Testni računi

### Korisnički računi
- **Email**: test@example.com
- **Lozinka**: Test123456

### Admin račun
- **Email**: admin@example.com
- **Lozinka**: Admin123456

### Blockchain računi (Ganache)
Ganache automatski generira 10 testnih računa s po 100 ETH. Prvi račun se koristi kao admin račun za deployment smart ugovora.

Privatni ključ prvog računa (za import u MetaMask):
```
0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
```

## Testiranje funkcionalnosti parcijalnih isplata

### Scenarij 1: Potpuna isplata
1. Prijavite se u aplikaciju kao korisnik
2. Odaberite sportski događaj i postavite okladu
3. Prijavite se kao admin i označite okladu kao dobitnu
4. Provjerite da je dobitak u potpunosti isplaćen

### Scenarij 2: Parcijalna isplata
1. Prijavite se u aplikaciju kao korisnik
2. Odaberite sportski događaj i postavite okladu s velikim potencijalnim dobitkom
3. Prijavite se kao admin i povucite većinu sredstava iz ugovora (simulacija nedostatka sredstava)
4. Označite okladu kao dobitnu
5. Provjerite da je dobitak djelomično isplaćen
6. Pratite status isplate i postotak isplaćenog iznosa
7. Dodajte nova sredstva u ugovor
8. Provjerite da se preostali iznos automatski isplaćuje

## Zaustavljanje aplikacije

Kada završite s testiranjem, možete zaustaviti sve kontejnere:

```bash
docker-compose down
```

Ako želite zaustaviti kontejnere i ukloniti sve volumene (baza podataka i ostali podaci):

```bash
docker-compose down -v
```

## Rješavanje problema

### Problem: Kontejneri se ne pokreću
- Provjerite je li Docker Desktop pokrenut
- Provjerite poruke o greškama u logu:
  ```bash
  docker-compose logs
  ```

### Problem: Ne mogu pristupiti frontend aplikaciji
- Provjerite je li frontend kontejner pokrenut:
  ```bash
  docker-compose ps frontend
  ```
- Provjerite logove frontend kontejnera:
  ```bash
  docker-compose logs frontend
  ```

### Problem: Ne mogu pristupiti backend API-ju
- Provjerite je li backend kontejner pokrenut:
  ```bash
  docker-compose ps backend
  ```
- Provjerite logove backend kontejnera:
  ```bash
  docker-compose logs backend
  ```

### Problem: Greške pri deploymentu smart ugovora
- Provjerite je li Ganache kontejner pokrenut:
  ```bash
  docker-compose ps ganache
  ```
- Provjerite logove Ganache kontejnera:
  ```bash
  docker-compose logs ganache
  ```

### Problem: Ne mogu se povezati s MetaMask
- Dodajte novu mrežu u MetaMask s sljedećim postavkama:
  - Network Name: Ganache Local
  - RPC URL: http://localhost:8545
  - Chain ID: 5777
  - Currency Symbol: ETH

## Kontakt za podršku

Ako naiđete na probleme tijekom testiranja, kontaktirajte nas na:
- **Email**: support@betting-platform.com
- **Telegram**: @betting_platform_support
