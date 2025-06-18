# Vizualni dizajn i UI/UX specifikacija - Online kladionica s USDT na Ethereum blockchainu

## Pregled dizajna

Vizualni dizajn online kladionice temelji se na modernim principima UI/UX dizajna s fokusom na jednostavnost korištenja, preglednost i profesionalni izgled. Dizajn je optimiziran za sve uređaje (desktop, tablet, mobilni) i pruža konzistentno korisničko iskustvo na svim platformama.

## Branding elementi

### Logo i identitet

Logo kladionice kombinira elemente sporta i kriptovaluta, stvarajući prepoznatljiv identitet koji odražava moderni pristup sportskom klađenju. Logo se sastoji od:

1. **Simbola** - Stilizirana kocka s elementima Ethereum simbola
2. **Tipografije** - Čist, moderan font koji odražava pouzdanost i profesionalnost
3. **Boja** - Primarna plava (#1E3A8A) koja simbolizira povjerenje i sigurnost

### Paleta boja

Paleta boja dizajnirana je za optimalan kontrast, čitljivost i prepoznatljivost brenda:

1. **Primarne boje**:
   - Tamno plava (#1E3A8A) - Glavna boja brenda, koristi se za navigaciju i ključne elemente
   - Svijetlo plava (#3B82F6) - Koristi se za akcente i interaktivne elemente

2. **Sekundarne boje**:
   - Zelena (#10B981) - Pozitivni indikatori, dobitci, uspješne transakcije
   - Crvena (#EF4444) - Negativni indikatori, gubitci, greške
   - Žuta (#F59E0B) - Upozorenja, posebne ponude

3. **Neutralne boje**:
   - Tamno siva (#1F2937) - Pozadina, tekst visokog kontrasta
   - Srednje siva (#6B7280) - Sekundarni tekst, obrubi
   - Svijetlo siva (#F3F4F6) - Pozadina sekcija, separatori
   - Bijela (#FFFFFF) - Pozadina kartica, tekst na tamnoj podlozi

### Tipografija

1. **Glavni font**: Inter
   - Čist, moderan sans-serif font s odličnom čitljivošću na svim veličinama ekrana
   - Težine: Regular (400), Medium (500), Semi-Bold (600), Bold (700)

2. **Veličine fonta**:
   - Naslovi: 24px - 32px
   - Podnaslovi: 18px - 22px
   - Glavni tekst: 16px
   - Sekundarni tekst: 14px
   - Mali tekst: 12px

## UI komponente

### Navigacija

1. **Glavna navigacija**:
   - Fiksirana na vrhu ekrana
   - Sadrži logo, glavne kategorije sportova, pretragu, prijavu/registraciju i odabir jezika
   - Na mobilnim uređajima prelazi u hamburger meni

2. **Bočna navigacija** (desktop):
   - Prikazuje detaljnu listu sportova i liga
   - Omogućuje brzo filtriranje događaja
   - Sadrži brze linkove na popularne događaje

3. **Donja navigacija** (mobilni):
   - Sadrži ključne akcije: Početna, Sportovi, Listić, Račun
   - Uvijek dostupna na dnu ekrana

### Kartice događaja

1. **Standardna kartica događaja**:
   - Jasno prikazuje timove/sudionike, vrijeme događaja i osnovne kvote
   - Koristi ikone za označavanje sporta i statusa događaja (uživo, nadolazeći)
   - Omogućuje brzo dodavanje na listić klikom na kvotu

2. **Kartica događaja uživo**:
   - Sadrži sve elemente standardne kartice
   - Dodatno prikazuje trenutni rezultat i vrijeme
   - Animirani indikatori za ključne trenutke (gol, timeout, itd.)
   - Kvote se vizualno ističu kada se mijenjaju

### Listić za klađenje

1. **Prikaz listića**:
   - Uvijek dostupan na desnoj strani (desktop) ili kao modalni prozor (mobilni)
   - Jasno prikazuje odabrane događaje, kvote i potencijalni dobitak
   - Transparentno prikazuje manipulativne troškove (2%)

2. **Unos iznosa**:
   - Numerički unos s validacijom (max. 9999 USDT)
   - Automatski izračun potencijalnog dobitka
   - Jasno upozorenje ako je iznos previsok

3. **Potvrda oklade**:
   - Pregled svih detalja prije potvrde
   - Jasan prikaz potrebnog USDT iznosa i naknade
   - Poveznica s Ethereum novčanikom

### Korisnički račun

1. **Profil korisnika**:
   - Pregled osobnih podataka
   - Mogućnost promjene lozinke i postavki
   - Odabir jezika i valute prikaza

2. **Novčanik**:
   - Prikaz stanja USDT tokena
   - Jednostavno sučelje za uplatu i isplatu
   - Povijest transakcija s jasnim statusima

3. **Povijest klađenja**:
   - Pregled aktivnih i završenih oklada
   - Filtriranje po statusu, sportu i datumu
   - Detalji svake oklade s ishodom

### Modalni prozori

1. **Prijava/Registracija**:
   - Čisto i jednostavno sučelje
   - Opcije za prijavu putem društvenih mreža
   - Validacija unosa u realnom vremenu

2. **Povezivanje novčanika**:
   - Korak-po-korak vodič za povezivanje MetaMask novčanika
   - Prikaz statusa povezivanja
   - Sigurnosne napomene i savjeti

3. **Potvrda transakcija**:
   - Detalji transakcije
   - Opcije za potvrdu ili odustajanje
   - Prikaz statusa transakcije

## Responzivni dizajn

### Desktop (>1200px)

- Trostupčani layout:
  - Lijevo: Bočna navigacija sa sportovima i ligama
  - Sredina: Glavni sadržaj (događaji, detalji događaja)
  - Desno: Listić za klađenje i brze akcije

### Tablet (768px - 1199px)

- Dvostupčani layout:
  - Lijevo: Glavni sadržaj
  - Desno: Listić za klađenje (može se sakriti)
- Bočna navigacija postaje padajući izbornik

### Mobilni (<767px)

- Jednostupčani layout:
  - Fokus na glavni sadržaj
  - Listić za klađenje dostupan kroz modalni prozor
  - Donja navigacija za brzi pristup ključnim funkcijama
- Optimizirani prikaz kartica događaja za manje ekrane

## Animacije i interakcije

1. **Prijelazi stranica**:
   - Glatki prijelazi između stranica
   - Animacije učitavanja sadržaja

2. **Interaktivni elementi**:
   - Suptilne animacije na hover i klik
   - Vizualna povratna informacija za sve akcije

3. **Real-time ažuriranja**:
   - Animirane promjene kvota
   - Pulsiranje za nove događaje uživo
   - Indikatori za uspješne transakcije

## Ikone i grafički elementi

1. **Ikone sportova**:
   - Jednostavne, prepoznatljive ikone za svaki sport
   - Konzistentan stil i veličina

2. **Statusne ikone**:
   - Jasni indikatori za različite statuse (uživo, završeno, otkazano)
   - Konzistentna upotreba boja za različite statuse

3. **Ilustracije**:
   - Moderne ilustracije za prazna stanja i onboarding
   - Konzistentan stil koji odražava brend

## Primjeri ekrana

### Početna stranica

- Glavni fokus na nadolazećim događajima i događajima uživo
- Brzi pristup popularnim sportovima i ligama
- Istaknute posebne ponude i promocije
- Prikaz trenutno najpopularnijih oklada

### Stranica događaja

- Detaljan prikaz sudionika i statistika
- Sve dostupne opcije klađenja
- Vizualizacija trenutnog stanja (za događaje uživo)
- Povezane informacije i prognoze

### Korisnički račun

- Pregledan dashboard s ključnim informacijama
- Jasno odvojene sekcije za različite funkcionalnosti
- Intuitivna navigacija između sekcija
- Vizualizacija podataka (grafovi za povijest klađenja, stanje računa)

## Implementacija

### Tehnologije

1. **Frontend framework**:
   - React s TypeScript
   - TailwindCSS za stiliziranje
   - Framer Motion za animacije

2. **UI biblioteke**:
   - Headless UI za pristupačne komponente
   - React Icons za ikone
   - Chart.js za vizualizaciju podataka

### Pristupačnost

- Visok kontrast između teksta i pozadine
- Dovoljno velike dodirne površine za mobilne uređaje
- Semantički HTML za čitače ekrana
- Podrška za navigaciju tipkovnicom

### Performanse

- Optimizirane slike i ikone
- Lazy loading za sadržaj izvan vidljivog područja
- Minimalne animacije za uređaje s ograničenim resursima
- Optimiziran prvi render stranice

## Zaključak

Finalni vizualni dizajn online kladionice kombinira moderan izgled, intuitivno korisničko iskustvo i optimalne performanse na svim uređajima. Dizajn je fokusiran na jednostavnost korištenja, preglednost informacija i brz pristup ključnim funkcionalnostima, stvarajući ugodno korisničko iskustvo koje potiče ponovnu upotrebu aplikacije.
