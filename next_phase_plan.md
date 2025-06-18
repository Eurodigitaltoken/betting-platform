# Plan za sljedeću fazu razvoja online kladionice

## 1. Višejezična podrška (2 tjedna)

### 1.1 Postavljanje i18n infrastrukture
- Instalacija i konfiguracija i18next biblioteke za React frontend
- Postavljanje strukture za prijevode na backend strani
- Kreiranje osnovnih prijevodnih datoteka za engleski, francuski i španjolski

### 1.2 Implementacija jezičnih datoteka
- Kreiranje prijevoda za korisničko sučelje
- Implementacija prijevoda za sportske događaje i tipove oklada
- Lokalizacija datuma, vremena i valuta

### 1.3 Implementacija jezičnog prekidača
- Razvoj komponente za promjenu jezika
- Pohrana korisničkih jezičnih preferencija
- Testiranje višejezičnosti na svim komponentama

## 2. Frontend razvoj (4 tjedna)

### 2.1 Početna stranica
- Dizajn i implementacija navigacije
- Razvoj komponente za prikaz popularnih događaja
- Implementacija filtera za sportove i datume

### 2.2 Prikaz sportskih događaja
- Razvoj komponenti za prikaz događaja po sportovima
- Implementacija prikaza kvota u realnom vremenu
- Razvoj komponente za prikaz događaja uživo

### 2.3 Stranica za klađenje
- Dizajn i implementacija forme za klađenje
- Razvoj komponente za izračun potencijalnog dobitka
- Implementacija prikaza manipulativnih troškova (2%)
- Razvoj komponente za potvrdu oklade

### 2.4 Korisnički račun
- Implementacija registracije i prijave korisnika
- Razvoj stranice za prikaz stanja računa
- Implementacija povijesti klađenja
- Razvoj komponente za upravljanje USDT transakcijama

## 3. Backend razvoj (4 tjedna)

### 3.1 API za sportske podatke
- Implementacija servisa za komunikaciju s The Odds API
- Razvoj endpointa za dohvat sportova
- Implementacija endpointa za dohvat događaja po sportu
- Razvoj endpointa za dohvat kvota za događaj

### 3.2 Real-time ažuriranje
- Implementacija WebSocket servera
- Razvoj servisa za periodičko ažuriranje kvota
- Implementacija mehanizma za slanje ažuriranja klijentima

### 3.3 Sustav za obradu oklada
- Razvoj servisa za kreiranje oklada
- Implementacija validacije oklada
- Razvoj servisa za izračun dobitaka
- Implementacija servisa za praćenje rezultata i automatsko rješavanje oklada

### 3.4 Autentifikacija i korisnici
- Implementacija JWT autentifikacije
- Razvoj servisa za upravljanje korisničkim računima
- Implementacija kontrole pristupa
- Razvoj servisa za praćenje korisničkih aktivnosti

## 4. Blockchain integracija (3 tjedna)

### 4.1 Implementacija Web3 servisa
- Razvoj servisa za komunikaciju s Ethereum mrežom
- Implementacija funkcija za interakciju sa smart ugovorom
- Razvoj servisa za praćenje transakcija

### 4.2 USDT transakcije
- Implementacija servisa za uplatu USDT
- Razvoj servisa za isplatu dobitaka
- Implementacija praćenja stanja računa

### 4.3 Sigurnost i optimizacija
- Implementacija sigurnosnih provjera za transakcije
- Optimizacija gas troškova
- Razvoj mehanizma za rukovanje greškama u transakcijama

## 5. Testiranje i optimizacija (2 tjedna)

### 5.1 Testiranje korisničkog sučelja
- Testiranje responzivnosti na različitim uređajima
- Testiranje korisničkog iskustva
- Testiranje višejezičnosti

### 5.2 Testiranje backend funkcionalnosti
- Testiranje API endpointa
- Testiranje real-time ažuriranja
- Testiranje obrade oklada

### 5.3 Testiranje blockchain integracije
- Testiranje USDT transakcija na testnoj mreži
- Testiranje smart ugovora
- Testiranje sigurnosti transakcija

### 5.4 Optimizacija performansi
- Optimizacija frontend komponenti
- Optimizacija API poziva
- Implementacija cachinga za poboljšanje performansi

## Vremenski okvir

Ukupno trajanje sljedeće faze: 15 tjedana

- Višejezična podrška: tjedni 1-2
- Frontend razvoj: tjedni 3-6
- Backend razvoj: tjedni 7-10
- Blockchain integracija: tjedni 11-13
- Testiranje i optimizacija: tjedni 14-15

## Prioriteti i ovisnosti

1. Višejezična podrška treba biti implementirana prije razvoja frontend komponenti
2. Backend API za sportske podatke mora biti implementiran prije razvoja frontend komponenti za prikaz događaja
3. Sustav za autentifikaciju mora biti implementiran prije razvoja korisničkog računa
4. Blockchain integracija može se razvijati paralelno s frontend i backend razvojem
5. Testiranje i optimizacija trebaju se provoditi kontinuirano, s finalnom fazom na kraju razvoja
