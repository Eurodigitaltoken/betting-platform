# Dokumentacija za integraciju MyEtherWallet (MEW)

## Pregled

Ova dokumentacija opisuje integraciju MyEtherWallet (MEW) u online kladionicu s USDT na Ethereum blockchainu. Integracija omogućuje korisnicima da koriste MyEtherWallet kao alternativu MetaMask novčaniku za interakciju s aplikacijom.

## Funkcionalnosti

Integracija MyEtherWallet omogućuje sljedeće funkcionalnosti:

1. **Povezivanje MEW novčanika** - Korisnici mogu povezati svoj MEW novčanik s aplikacijom
2. **Prebacivanje između novčanika** - Korisnici mogu odabrati između MetaMask i MEW novčanika
3. **Transakcije s USDT** - Uplata i isplata USDT tokena putem MEW novčanika
4. **Klađenje** - Postavljanje oklada i primanje dobitaka putem MEW novčanika

## Implementacija

### Web3 integracija

Implementacija koristi `useWeb3Integration` hook koji podržava oba novčanika:

```javascript
// Inicijalizacija Web3 s MetaMask
const initMetaMask = async () => {
  if (window.ethereum) {
    // MetaMask implementacija
  }
};

// Inicijalizacija Web3 s MyEtherWallet (MEW)
const initMEW = async () => {
  if (window.ethereum && window.ethereum.isMEW) {
    // MEW implementacija (moderna)
  } else if (window.web3 && window.web3.currentProvider && window.web3.currentProvider.isMEW) {
    // MEW implementacija (legacy)
  }
};
```

### Komponenta za odabir novčanika

Implementirana je nova komponenta `WalletConnector` koja omogućuje korisnicima odabir između MetaMask i MEW novčanika:

```javascript
const WalletConnector = () => {
  // Implementacija komponente za odabir novčanika
};
```

### Backend integracija

Backend API-ji su ažurirani da podržavaju oba tipa novčanika:

```javascript
// Primjer API poziva s informacijom o tipu novčanika
const response = await fetch('/api/wallet/deposit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: parseFloat(depositAmount),
    txHash: tx.transactionHash,
    walletType: walletType // 'metamask' ili 'mew'
  }),
});
```

## Korisničko iskustvo

### Povezivanje novčanika

1. Korisnik klikne na "Connect Wallet" gumb
2. Prikazuje se izbornik s opcijama "MetaMask" i "MyEtherWallet"
3. Korisnik odabire željeni novčanik
4. Aplikacija inicira povezivanje s odabranim novčanikom
5. Nakon uspješnog povezivanja, prikazuje se adresa novčanika i ikona odabranog novčanika

### Transakcije

Proces transakcija (uplata, isplata, klađenje) je identičan za oba novčanika, s razlikom u pozadinskoj implementaciji:

1. Korisnik inicira transakciju (npr. uplata USDT)
2. Aplikacija koristi odgovarajući provider (MetaMask ili MEW) za potpisivanje transakcije
3. Korisnik potvrđuje transakciju u sučelju novčanika
4. Aplikacija obrađuje rezultat transakcije i ažurira korisničko sučelje

## Testiranje

Implementirani su opsežni testovi za obje integracije novčanika:

```javascript
describe('MetaMask Integration', function () {
  // Testovi za MetaMask integraciju
});

describe('MyEtherWallet Integration', function () {
  // Testovi za MEW integraciju
});

describe('Wallet Switching', function () {
  // Testovi za prebacivanje između novčanika
});
```

## Preduvjeti za korisnike

Za korištenje MEW novčanika, korisnici moraju:

1. Instalirati MEW wallet ekstenziju za preglednik (Chrome, Firefox)
2. Kreirati ili importirati Ethereum račun u MEW novčanik
3. Imati dovoljno ETH za gas troškove
4. Imati USDT tokene za klađenje

## Sigurnosne napomene

1. Aplikacija nikada ne pohranjuje privatne ključeve korisnika
2. Sve transakcije se potpisuju direktno u sučelju novčanika (MetaMask ili MEW)
3. Korisnici trebaju provjeriti detalje transakcije prije potpisivanja
4. Preporučuje se korištenje hardverskih novčanika s MEW-om za dodatnu sigurnost

## Poznati problemi i ograničenja

1. Starije verzije MEW ekstenzije možda neće biti kompatibilne
2. MEW mobilna aplikacija trenutno nije podržana
3. Neki preglednici možda neće podržavati MEW ekstenziju

## Zaključak

Integracija MyEtherWallet (MEW) proširuje dostupnost aplikacije većem broju korisnika, omogućujući im izbor između dva popularna Ethereum novčanika. Implementacija je dizajnirana da bude robusna i jednostavna za korištenje, s konzistentnim korisničkim iskustvom bez obzira na odabrani novčanik.
