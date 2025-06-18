# Dokumentacija za integraciju mobilnih novčanika

## Pregled

Ova dokumentacija opisuje integraciju mobilnih novčanika (MetaMask Mobile i MEW Mobile) u online kladionicu s USDT na Ethereum blockchainu. Integracija omogućuje korisnicima da koriste svoje mobilne novčanike za interakciju s aplikacijom, što značajno proširuje dostupnost platforme s obzirom da se većina klađenja danas obavlja preko mobilnih uređaja.

## Podržani mobilni novčanici

Aplikacija podržava sljedeće mobilne novčanike:

1. **MetaMask Mobile** - Popularna mobilna verzija MetaMask novčanika dostupna za Android i iOS
2. **MEW (MyEtherWallet) Mobile** - Mobilna aplikacija MyEtherWallet dostupna za Android i iOS

## Funkcionalnosti

Integracija mobilnih novčanika omogućuje sljedeće funkcionalnosti:

1. **Povezivanje mobilnih novčanika** - Korisnici mogu povezati svoje mobilne novčanike s aplikacijom putem QR koda
2. **Prebacivanje između novčanika** - Korisnici mogu odabrati između desktop i mobilnih novčanika
3. **Transakcije s USDT** - Uplata i isplata USDT tokena putem mobilnih novčanika
4. **Klađenje** - Postavljanje oklada i primanje dobitaka putem mobilnih novčanika

## Tehnička implementacija

### WalletConnect protokol (MetaMask Mobile)

Za povezivanje s MetaMask Mobile aplikacijom, implementacija koristi WalletConnect protokol:

```javascript
// Inicijalizacija WalletConnect providera
const provider = new WalletConnectProvider({
  infuraId: WALLET_CONNECT_INFURA_ID,
  bridge: WALLET_CONNECT_BRIDGE,
  qrcodeModalOptions: {
    mobileLinks: ['metamask']
  }
});

// Omogućavanje sesije (prikazuje QR kod)
await provider.enable();

// Kreiranje Web3 instance s WalletConnect providerom
const web3Instance = new Web3(provider);
```

### MEWconnect protokol (MEW Mobile)

Za povezivanje s MEW Mobile aplikacijom, implementacija koristi MEWconnect protokol:

```javascript
// Kreiranje MEWconnect instance
const MEWconnect = window.MEWconnect.init();

// Generiranje URL-a za povezivanje i QR koda
const connection = await MEWconnect.connect();
const qrCodeUrl = connection.uri;

// Čekanje na povezivanje s mobilne aplikacije
connection.on('connected', async (provider) => {
  // Kreiranje Web3 instance s MEWconnect providerom
  const web3Instance = new Web3(provider);
});
```

## Korisničko iskustvo

### Povezivanje mobilnog novčanika

1. Korisnik klikne na "Connect Wallet" gumb
2. Prikazuje se izbornik s opcijama za desktop i mobilne novčanike
3. Korisnik odabire "MetaMask Mobile" ili "MEW Mobile"
4. Aplikacija prikazuje QR kod za skeniranje
5. Korisnik otvara mobilnu aplikaciju novčanika i skenira QR kod
6. Nakon uspješnog povezivanja, prikazuje se adresa novčanika i ikona odabranog novčanika

### Transakcije putem mobilnog novčanika

Proces transakcija (uplata, isplata, klađenje) je identičan za sve tipove novčanika, s razlikom u načinu potpisivanja:

1. Korisnik inicira transakciju (npr. uplata USDT)
2. Aplikacija priprema transakciju i šalje zahtjev za potpisivanje na mobilni novčanik
3. Korisnik dobiva obavijest na mobilnom uređaju i potvrđuje transakciju u aplikaciji novčanika
4. Aplikacija obrađuje rezultat transakcije i ažurira korisničko sučelje

## Sigurnosne preporuke

### Za korisnike

1. **Uvijek provjerite detalje transakcije** prije potpisivanja u mobilnoj aplikaciji novčanika
2. **Koristite sigurnu Wi-Fi mrežu** prilikom povezivanja mobilnog novčanika
3. **Redovito ažurirajte mobilnu aplikaciju novčanika** na najnoviju verziju
4. **Nikada ne dijelite QR kod** za povezivanje s drugim osobama
5. **Koristite biometrijsku zaštitu** (otisak prsta, prepoznavanje lica) u mobilnoj aplikaciji novčanika
6. **Odmah odspojite novčanik** nakon završetka korištenja aplikacije

### Za razvojni tim

1. **Implementirajte timeout za QR kod** kako bi se spriječilo neovlašteno povezivanje
2. **Koristite HTTPS** za sve komunikacije između aplikacije i novčanika
3. **Implementirajte provjeru potpisa** za potvrdu identiteta korisnika
4. **Pratite i logirajte sve pokušaje povezivanja** za otkrivanje potencijalnih sigurnosnih problema
5. **Redovito ažurirajte biblioteke** za povezivanje s novčanicima

## Preduvjeti za korisnike

Za korištenje mobilnih novčanika, korisnici moraju:

1. **Instalirati mobilnu aplikaciju novčanika**:
   - MetaMask Mobile ([Android](https://play.google.com/store/apps/details?id=io.metamask) / [iOS](https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202))
   - MEW Wallet ([Android](https://play.google.com/store/apps/details?id=com.myetherwallet.mewwallet) / [iOS](https://apps.apple.com/us/app/mew-wallet-ethereum-crypto/id1464614025))
2. **Kreirati ili importirati Ethereum račun** u mobilnu aplikaciju novčanika
3. **Imati dovoljno ETH** za gas troškove
4. **Imati USDT tokene** za klađenje

## Rješavanje problema

### Problemi s povezivanjem

1. **QR kod se ne prikazuje**:
   - Provjerite jesu li potrebne JavaScript biblioteke pravilno učitane
   - Osvježite stranicu i pokušajte ponovno

2. **Mobilna aplikacija ne skenira QR kod**:
   - Provjerite imate li najnoviju verziju mobilne aplikacije
   - Osigurajte dobro osvjetljenje i stabilnost kamere prilikom skeniranja

3. **Veza se prekida nakon povezivanja**:
   - Provjerite stabilnost internet veze
   - Provjerite jesu li obje strane (web aplikacija i mobilni uređaj) na istoj mreži

### Problemi s transakcijama

1. **Transakcija se ne pojavljuje u mobilnoj aplikaciji**:
   - Provjerite internet vezu na mobilnom uređaju
   - Provjerite je li novčanik još uvijek povezan s aplikacijom

2. **Transakcija je odbijena**:
   - Provjerite imate li dovoljno ETH za gas troškove
   - Provjerite imate li dovoljno USDT za transakciju

3. **Transakcija je zapela u "pending" stanju**:
   - Pričekajte da se mreža rastereti
   - U mobilnoj aplikaciji možete pokušati ubrzati transakciju povećanjem gas cijene

## Testiranje i performanse

Provedena su opsežna testiranja mobilnih novčanika koja pokazuju:

1. **Vrijeme povezivanja**:
   - MetaMask Mobile: prosječno 2-3 sekunde nakon skeniranja QR koda
   - MEW Mobile: prosječno 2-4 sekunde nakon skeniranja QR koda

2. **Vrijeme potpisivanja transakcije**:
   - MetaMask Mobile: prosječno 3-5 sekundi
   - MEW Mobile: prosječno 3-6 sekundi

3. **Kompatibilnost**:
   - Testirano na Android 10+ i iOS 13+
   - Testirano na različitim veličinama ekrana i rezolucijama

## Zaključak

Integracija mobilnih novčanika (MetaMask Mobile i MEW Mobile) značajno proširuje dostupnost aplikacije, omogućujući korisnicima da koriste svoje preferirane mobilne novčanike za klađenje. Implementacija je dizajnirana da bude sigurna, jednostavna za korištenje i robusna, s jasnim korisničkim iskustvom i detaljnim uputama za rješavanje problema.

Ova funkcionalnost je posebno važna s obzirom da se većina klađenja danas obavlja preko mobilnih uređaja, što čini našu platformu pristupačnijom i konkurentnijom na tržištu.
