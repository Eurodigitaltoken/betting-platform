# Vodič za parcijalne isplate dobitaka

## Pregled

Ovaj dokument objašnjava kako funkcionira sustav parcijalnih isplata dobitaka na našoj kladioničkoj platformi. Sustav je dizajniran da osigura transparentnost i pravovremenu isplatu dobitaka, čak i u situacijama kada kladionica nema dovoljno sredstava za isplatu svih dobitaka odjednom.

## Kako funkcioniraju parcijalne isplate

### Što su parcijalne isplate?

Parcijalne isplate omogućuju kladionici da isplati dio dobitka odmah, a ostatak kasnije kada nova sredstva postanu dostupna. Ovo osigurava da korisnici dobiju barem dio svojih dobitaka odmah, umjesto da čekaju na punu isplatu.

### Kada se koriste parcijalne isplate?

Parcijalne isplate se aktiviraju automatski u sljedećim situacijama:

1. Kada korisnik osvoji okladu, ali kladionica trenutno nema dovoljno sredstava za isplatu cijelog dobitka
2. Kada više korisnika istovremeno osvoji velike dobitke koji premašuju trenutno dostupna sredstva

### Proces parcijalne isplate

1. **Inicijalna isplata**: Kada osvojite okladu, sustav će automatski isplatiti maksimalni mogući iznos iz trenutno dostupnih sredstava
2. **Red čekanja**: Ako nije moguće isplatiti cijeli dobitak, preostali iznos se stavlja u red čekanja za isplatu
3. **Automatske isplate**: Kako nova sredstva postaju dostupna (kroz nove uplate ili depozite), sustav automatski nastavlja s isplatom preostalih iznosa prema redoslijedu u redu čekanja
4. **Obavijesti**: Bit ćete obaviješteni o svakoj parcijalnoj isplati i statusu vašeg dobitka

## Praćenje statusa isplate

### Gdje mogu vidjeti status svoje isplate?

Status isplate možete pratiti na sljedeće načine:

1. **Stranica "Moje oklade"**: Svaka oklada s parcijalnom isplatom prikazuje indikator postotka isplate
2. **Stranica detalja oklade**: Detaljan prikaz statusa isplate, uključujući:
   - Postotak isplaćenog iznosa
   - Isplaćeni iznos
   - Preostali iznos za isplatu
   - Poziciju u redu čekanja (ako je primjenjivo)
   - Vrijeme zadnje isplate

### Što znače različiti statusi isplate?

- **Potpuno isplaćeno (100%)**: Cijeli dobitak je isplaćen
- **Djelomično isplaćeno (1-99%)**: Dio dobitka je isplaćen, a ostatak čeka na isplatu
- **U redu čekanja (0%)**: Dobitak je potvrđen, ali isplata još nije započela zbog nedostatka sredstava

## Obavijesti o isplatama

### Kako ću znati kada je izvršena isplata?

Sustav vas automatski obavještava o svim promjenama statusa isplate:

1. **Push obavijesti**: Dobivate obavijest na platformi svaki put kada se izvrši parcijalna ili potpuna isplata
2. **Email obavijesti**: Opcija primanja email obavijesti o statusu isplate (može se uključiti u postavkama)
3. **Status u stvarnom vremenu**: Status isplate se ažurira u stvarnom vremenu na korisničkom sučelju

### Primjeri obavijesti

- **Parcijalna isplata**: "Primili ste parcijalnu isplatu od 500 USDT (25% vašeg dobitka)"
- **Potpuna isplata**: "Primili ste potpunu isplatu vašeg dobitka od 2000 USDT"
- **Dodano u red čekanja**: "Vaš dobitak od 2000 USDT je dodan u red čekanja i bit će isplaćen kada sredstva postanu dostupna"

## Često postavljana pitanja

### Koliko dugo moram čekati na potpunu isplatu?

Vrijeme isplate ovisi o nekoliko faktora:

- Iznos vašeg dobitka
- Trenutno dostupna sredstva
- Vaša pozicija u redu čekanja
- Priljev novih sredstava na platformu

Sustav automatski isplaćuje dobitke prema redoslijedu "prvi došao, prvi poslužen" (FIFO), što znači da se dobitci isplaćuju redoslijedom kojim su osvojeni.

### Mogu li ubrzati isplatu?

Ne, sustav isplaćuje dobitke prema fiksnom redoslijedu kako bi osigurao pravednost prema svim korisnicima. Nije moguće preskočiti red ili ubrzati isplatu.

### Što ako trebam novac hitno?

Preporučujemo da planirate svoje oklade uzimajući u obzir mogućnost parcijalne isplate. Ako vam je potrebna brza isplata, razmotrite postavljanje manjih oklada koje imaju veću vjerojatnost trenutne isplate.

### Postoji li vremensko ograničenje za isplatu?

Ne, svi dobitci će biti isplaćeni u potpunosti, bez obzira na vrijeme potrebno za prikupljanje dovoljno sredstava. Vaš dobitak je siguran i bit će isplaćen čim sredstva postanu dostupna.

### Što ako imam više oklada s parcijalnim isplatama?

Svaka oklada se tretira zasebno i ima svoju poziciju u redu čekanja. Možete imati više oklada u različitim fazama isplate istovremeno.

## Sigurnost i transparentnost

### Kako znam da ću dobiti svoj novac?

Sustav parcijalnih isplata je implementiran kroz smart ugovor na Ethereum blockchainu, što znači:

1. Sve transakcije su transparentne i mogu se provjeriti na blockchainu
2. Jednom kada je dobitak potvrđen, isplata je zagarantirana smart ugovorom
3. Sustav automatski isplaćuje dobitke prema fiksnim pravilima koja se ne mogu mijenjati

### Mogu li provjeriti status isplate na blockchainu?

Da, sve isplate se bilježe na Ethereum blockchainu. Možete provjeriti status svoje isplate na Etherscan-u koristeći hash transakcije koji je dostupan na stranici detalja oklade.

## Kontakt podrške

Ako imate dodatna pitanja o parcijalnim isplatama, kontaktirajte našu korisničku podršku:

- Email: support@betting-platform.com
- Live chat: Dostupan 24/7 na našoj platformi
- Telegram: @betting_platform_support
