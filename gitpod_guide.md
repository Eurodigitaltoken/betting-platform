# GitPod Vodič za testiranje online kladionice

Ovaj vodič sadrži upute za testiranje online kladionice s podrškom za parcijalne isplate koristeći GitPod cloud okruženje.

## Pristup GitPod okruženju

1. Kliknite na link koji sam vam poslao za pristup GitPod okruženju
2. Prijavite se na GitPod (možete koristiti GitHub, GitLab ili Google račun)
3. Pričekajte da se okruženje učita i pokrenu svi servisi (ovo može potrajati nekoliko minuta)

## Što se događa pri pokretanju

Kada otvorite GitPod okruženje, automatski se pokreću sljedeći servisi:

1. **MongoDB** - Baza podataka za pohranu korisnika, oklada i sportskih događaja
2. **Ganache** - Lokalna blockchain mreža za testiranje smart ugovora
3. **Backend** - Node.js API server koji povezuje frontend s bazom podataka i blockchainom
4. **Frontend** - React aplikacija koja se automatski otvara u novoj kartici

## Testni računi

### Korisnički račun
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

## Povezivanje MetaMask-a s GitPod okruženjem

Za testiranje blockchain funkcionalnosti, potrebno je povezati MetaMask s Ganache mrežom u GitPod:

1. Instalirajte MetaMask ekstenziju u vašem pregledniku ako je već nemate
2. Otvorite MetaMask i dodajte novu mrežu s sljedećim postavkama:
   - **Network Name**: GitPod Ganache
   - **RPC URL**: https://8545-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}
   (zamijenite ${GITPOD_WORKSPACE_ID} i ${GITPOD_WORKSPACE_CLUSTER_HOST} s vrijednostima iz vašeg GitPod URL-a)
   - **Chain ID**: 5777
   - **Currency Symbol**: ETH
3. Importirajte testni račun koristeći privatni ključ naveden iznad

## Testiranje funkcionalnosti parcijalnih isplata

### Scenarij 1: Potpuna isplata
1. Prijavite se u aplikaciju kao korisnik (test@example.com / Test123456)
2. Odaberite sportski događaj i postavite okladu
3. Prijavite se kao admin (admin@example.com / Admin123456) i označite okladu kao dobitnu
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

## Pristup različitim komponentama

- **Frontend aplikacija**: Automatski se otvara u novoj kartici
- **Backend API**: Dostupan na https://3001-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}/api
- **Ganache blockchain**: Dostupan na https://8545-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}

## Rješavanje problema

### Problem: Frontend se ne učitava
- Provjerite terminal u GitPod sučelju za poruke o greškama
- Pokušajte ručno pokrenuti frontend:
  ```bash
  cd /workspace/betting_platform_project/src/frontend
  npm start
  ```

### Problem: Backend API nije dostupan
- Provjerite terminal u GitPod sučelju za poruke o greškama
- Pokušajte ručno pokrenuti backend:
  ```bash
  cd /workspace/betting_platform_project
  node src/backend/app.js
  ```

### Problem: Ne mogu se povezati s MetaMask
- Provjerite je li RPC URL ispravno postavljen u MetaMask-u
- Provjerite je li Ganache pokrenut u GitPod terminalu

## Važne napomene

- GitPod sesija će se automatski zaustaviti nakon perioda neaktivnosti (obično 30 minuta)
- Svi podaci u GitPod okruženju su privremeni i bit će izgubljeni kada se sesija zaustavi
- Za ponovno pokretanje, jednostavno kliknite na GitPod link koji sam vam poslao

## Kontakt za podršku

Ako naiđete na probleme tijekom testiranja, kontaktirajte me za pomoć.
