# Detaljni projektni plan - Online kladionica s USDT na Ethereum blockchainu

## 1. Pregled projekta

### 1.1 Cilj projekta
Razviti potpuno funkcionalnu online kladionicu koja koristi USDT na Ethereum blockchainu za uplate i isplate, s fokusom na jednostavnost korištenja i preglednost za pozitivno korisničko iskustvo.

### 1.2 Ključne funkcionalnosti
- Prikaz sportskih događaja za 5 sportova (nogomet, košarka, tenis, NFL, hokej na ledu)
- Klađenje na sportske događaje s kvotama u realnom vremenu
- Plaćanje putem USDT na Ethereum blockchainu
- Višejezična podrška (engleski, francuski, španjolski)
- Manipulativni troškovi od 2% na svaku uplatu (jasno prikazani)
- Ograničenje maksimalne pojedinačne uplate na 9999 USDT
- Admin panel za upravljanje događajima i praćenje transakcija

### 1.3 Vremenski okvir
Ukupno trajanje projekta: 5 mjeseci (od svibnja do listopada 2025.)

## 2. Faze projekta

### 2.1 Faza 1: Istraživanje i planiranje (2 tjedna)
- Istraživanje alternativnih izvora podataka za sportske kvote i rezultate
- Usporedba dostupnih API-ja i odabir optimalnog rješenja
- Definiranje detaljne arhitekture aplikacije
- Postavljanje razvojnog okruženja

### 2.2 Faza 2: Razvoj osnovne infrastrukture (3 tjedna)
- Postavljanje frontend i backend okruženja
- Konfiguracija testne Ethereum mreže
- Implementacija baze podataka
- Postavljanje sustava za višejezičnu podršku

### 2.3 Faza 3: Razvoj frontend komponenti (6 tjedana)
- Razvoj početne stranice s prikazom sportskih događaja
- Implementacija filtriranja po sportovima i datumima
- Razvoj stranice za klađenje s prikazom kvota
- Implementacija korisničkih računa i autentifikacije
- Razvoj sučelja za upravljanje USDT transakcijama

### 2.4 Faza 4: Razvoj backend funkcionalnosti (6 tjedana)
- Integracija s odabranim API-jem za sportske podatke
- Implementacija sustava za ažuriranje kvota u realnom vremenu
- Razvoj sustava za obradu tiketa i izračun dobitaka
- Implementacija manipulativnih troškova i ograničenja uplata
- Razvoj admin panela

### 2.5 Faza 5: Blockchain integracija (4 tjedna)
- Implementacija USDT transakcija na Ethereum testnoj mreži
- Razvoj sustava za praćenje uplata i isplata
- Implementacija sigurnosnih mehanizama za transakcije
- Testiranje blockchain funkcionalnosti

### 2.6 Faza 6: Testiranje i optimizacija (3 tjedna)
- Testiranje korisničkog sučelja i korisničkog iskustva
- Testiranje backend funkcionalnosti
- Testiranje blockchain integracije
- Optimizacija performansi aplikacije
- Sigurnosno testiranje

### 2.7 Faza 7: Finalizacija i lansiranje (2 tjedna)
- Implementacija finalnog vizualnog dizajna i brendiranja
- Priprema dokumentacije
- Završno testiranje
- Priprema za produkciju

## 3. Istraživanje izvora podataka za sportske kvote i rezultate

### 3.1 Odabrani izvor podataka - The Odds API

Nakon detaljne analize i usporedbe dostupnih API-ja za sportske podatke, odabran je **The Odds API** kao optimalni izvor podataka za našu online kladionicu.

**Ključne prednosti The Odds API-ja**:
- Pokriva sve tražene sportove (nogomet, košarka, tenis, NFL, hokej na ledu)
- Jednostavno API sučelje s dobrom dokumentacijom
- Transparentni cjenovni model s više planova (od besplatnog do $249/mjesečno)
- Podržava ažuriranje kvota i rezultata u realnom vremenu
- Podaci iz više kladionica (bookmakers)

**Plan korištenja**:
- Početak s besplatnim planom za razvoj i testiranje
- Prelazak na plaćeni plan prema potrebama produkcijske aplikacije
- Implementacija optimizacije API poziva kroz caching i batch processing

Detaljan plan integracije The Odds API-ja u arhitekturu aplikacije dostupan je u dokumentu `/research/the_odds_api_integration.md`.

### 3.2 Kriteriji za odabir
- Pokrivenost svih 5 traženih sportova
- Pouzdanost i točnost podataka
- Brzina ažuriranja kvota i rezultata
- Jednostavnost integracije
- Troškovi korištenja
- Dostupnost podataka u realnom vremenu

## 4. Tehnička arhitektura

### 4.1 Frontend
- **Framework**: React s TypeScript
- **Server-side rendering**: Next.js
- **Stilizacija**: TailwindCSS
- **Real-time komunikacija**: WebSocket
- **Višejezična podrška**: i18next ili react-intl

### 4.2 Backend
- **Framework**: Node.js s Express.js
- **Real-time komunikacija**: Socket.io
- **API integracija**: REST API za dohvat sportskih podataka
- **Autentifikacija**: JWT (JSON Web Token)

### 4.3 Blockchain integracija
- **Mreža**: Ethereum testna mreža (Goerli ili Sepolia)
- **Token**: USDT (ERC-20)
- **Biblioteke**: Web3.js ili Ethers.js
- **Wallet integracija**: MetaMask ili WalletConnect

### 4.4 Baza podataka
- **Primarna baza**: PostgreSQL
- **Cache**: Redis za privremenu pohranu kvota i rezultata

### 4.5 Sigurnost
- HTTPS enkripcija
- JWT autentifikacija
- Sigurnosne provjere za blockchain transakcije
- Zaštita od SQL injekcija i XSS napada

## 5. Ključne funkcionalnosti po modulima

### 5.1 Modul za sportske događaje
- Dohvat i prikaz događaja za 5 sportova
- Filtriranje po sportovima i datumima
- Prikaz događaja uživo
- Ažuriranje kvota u realnom vremenu

### 5.2 Modul za klađenje
- Odabir događaja i tipa oklade
- Izračun potencijalnog dobitka
- Prikaz manipulativnih troškova (2%)
- Provjera ograničenja maksimalne uplate (9999 USDT)
- Potvrda i praćenje tiketa

### 5.3 Korisnički modul
- Registracija i prijava korisnika
- Upravljanje korisničkim računom
- Prikaz stanja računa u USDT
- Povijest klađenja i transakcija

### 5.4 Blockchain modul
- Povezivanje s Ethereum novčanikom
- Upravljanje USDT transakcijama
- Provjera stanja i potvrda transakcija
- Sigurnosni mehanizmi za transakcije

### 5.5 Admin modul
- Upravljanje sportskim događajima
- Praćenje aktivnih tiketa
- Nadzor korisničkih računa
- Praćenje USDT transakcija

### 5.6 Višejezični modul
- Podrška za engleski, francuski i španjolski jezik
- Dinamičko učitavanje prijevoda
- Lokalizacija datuma, vremena i valuta

## 6. Rizici i izazovi

### 6.1 Tehnički rizici
- Kašnjenja u ažuriranju podataka o sportskim događajima
- Problemi s blockchain transakcijama (gas fees, kašnjenja)
- Izazovi u implementaciji real-time funkcionalnosti

### 6.2 Poslovni rizici
- Regulatorna pitanja vezana uz online klađenje
- Sigurnost korisničkih sredstava
- Konkurencija na tržištu

### 6.3 Strategije ublažavanja rizika
- Redundantni izvori podataka
- Temeljito testiranje blockchain funkcionalnosti
- Implementacija sigurnosnih mehanizama
- Praćenje regulatornih zahtjeva

## 7. Resursi i tim

### 7.1 Potrebni resursi
- Frontend developeri
- Backend developeri
- Blockchain stručnjaci
- UI/UX dizajneri
- QA testeri

### 7.2 Infrastruktura
- Razvojni serveri
- Testna Ethereum mreža
- Produkcijski serveri
- Sustavi za monitoring

## 8. Zaključak

Ovaj projektni plan pruža okvir za razvoj online kladionice s USDT na Ethereum blockchainu. Plan je strukturiran u 7 faza s jasno definiranim ciljevima i isporukama. Ukupno trajanje projekta je 5 mjeseci, s fokusom na razvoj korisničkog iskustva, pouzdanost podataka i sigurnost blockchain transakcija.

Sljedeći korak je detaljno istraživanje i odabir optimalnog izvora podataka za sportske kvote i rezultate, nakon čega će se pristupiti razvoju osnovne infrastrukture aplikacije.
