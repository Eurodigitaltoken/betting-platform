# Vodič za testiranje online kladionice

## Pristup testnoj aplikaciji

Testna verzija online kladionice s podrškom za parcijalne isplate dostupna je na sljedećim adresama:

- **Frontend aplikacija**: [https://betting-platform-frontend.vercel.app](https://betting-platform-frontend.vercel.app)
- **Backend API**: [https://betting-platform-backend.herokuapp.com/api](https://betting-platform-backend.herokuapp.com/api)

## Testni računi

Za testiranje aplikacije možete koristiti sljedeće testne račune:

### Korisnički račun
- **Email**: test@example.com
- **Lozinka**: Test123456

### Admin račun
- **Email**: admin@example.com
- **Lozinka**: Admin123456

## Testni novčanici

Za testiranje blockchain funkcionalnosti potreban vam je Ethereum novčanik s testnim ETH i USDT tokenima na Sepolia testnoj mreži.

### Opcija 1: Koristite postojeći testni novčanik
- **Adresa**: 0x8f5B2b7E199ea39151bA6c92DD717551Bd2F6F3A
- **Privatni ključ**: (dostavljen u privatnoj poruci)

### Opcija 2: Kreirajte vlastiti testni novčanik
1. Instalirajte MetaMask ekstenziju za preglednik
2. Kreirajte novi račun
3. Prebacite na Sepolia testnu mrežu
4. Nabavite testne ETH s [Sepolia Faucet](https://sepoliafaucet.com/)
5. Nabavite testne USDT s naše testne adrese (kontaktirajte nas za transfer)

## Testiranje funkcionalnosti parcijalnih isplata

### Scenarij 1: Potpuna isplata
1. Prijavite se u aplikaciju
2. Odaberite sportski događaj i postavite okladu
3. Administrator označava okladu kao dobitnu
4. Provjerite da je dobitak u potpunosti isplaćen

### Scenarij 2: Parcijalna isplata
1. Prijavite se u aplikaciju
2. Odaberite sportski događaj i postavite okladu s velikim potencijalnim dobitkom
3. Administrator povlači većinu sredstava iz ugovora (simulacija nedostatka sredstava)
4. Administrator označava okladu kao dobitnu
5. Provjerite da je dobitak djelomično isplaćen
6. Pratite status isplate i postotak isplaćenog iznosa
7. Administrator dodaje nova sredstva u ugovor
8. Provjerite da se preostali iznos automatski isplaćuje

### Scenarij 3: Više korisnika u redu čekanja
1. Više korisnika postavlja oklade
2. Administrator povlači većinu sredstava iz ugovora
3. Administrator označava sve oklade kao dobitne
4. Provjerite da su dobitci djelomično isplaćeni prema redoslijedu "prvi došao, prvi poslužen"
5. Pratite status isplate i poziciju u redu čekanja
6. Administrator dodaje nova sredstva u ugovor
7. Provjerite da se preostali iznosi automatski isplaćuju prema redoslijedu u redu čekanja

## Testiranje mobilnih novčanika

### MetaMask Mobile
1. Instalirajte MetaMask Mobile aplikaciju
2. Povežite se sa Sepolia testnom mrežom
3. Skenirajte QR kod za povezivanje s aplikacijom
4. Postavite okladu i potvrdite transakciju kroz mobilnu aplikaciju

### MEW Mobile
1. Instalirajte MEW Mobile aplikaciju
2. Povežite se sa Sepolia testnom mrežom
3. Skenirajte QR kod za povezivanje s aplikacijom
4. Postavite okladu i potvrdite transakciju kroz mobilnu aplikaciju

## Poznata ograničenja testnog okruženja

1. **Brzina transakcija**: Transakcije na Sepolia testnoj mreži mogu biti sporije nego na glavnoj mreži
2. **Dostupnost API-ja**: The Odds API ima ograničen broj zahtjeva u besplatnom planu
3. **Testni USDT**: Testni USDT tokeni nemaju stvarnu vrijednost i koriste se samo za demonstraciju

## Kontakt za podršku

Ako naiđete na probleme tijekom testiranja, kontaktirajte nas na:
- **Email**: support@betting-platform.com
- **Telegram**: @betting_platform_support
