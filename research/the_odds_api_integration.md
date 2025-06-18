# Integracija The Odds API u online kladionicu

## Pregled integracije

Nakon detaljne analize i usporedbe dostupnih API-ja za sportske podatke, odabran je **The Odds API** kao optimalni izvor podataka za našu online kladionicu. Ovaj dokument opisuje plan integracije The Odds API-ja u arhitekturu aplikacije.

## Ključne karakteristike The Odds API-ja

- **Pokrivenost sportova**: Podržava svih 5 traženih sportova (nogomet, košarka, tenis, NFL, hokej na ledu)
- **Ažuriranje u realnom vremenu**: Podržava ažuriranje kvota i rezultata
- **Pouzdanost**: Podaci iz više kladionica (bookmakers)
- **Jednostavnost integracije**: Dobra dokumentacija i primjeri koda
- **Cjenovni model**: Transparentni planovi od besplatnog do $249/mjesečno

## Plan integracije

### 1. Postavljanje API pristupa

- Registracija za The Odds API
- Dobivanje API ključa
- Postavljanje osnovne konfiguracije za API pozive
- Implementacija rate limiting mehanizma za optimizaciju broja API poziva

### 2. Modeliranje podataka

#### 2.1 Mapiranje sportova

The Odds API koristi specifične ključeve za sportove koje trebamo mapirati u našu aplikaciju:

- Nogomet: `soccer_*` (različite lige)
- Košarka: `basketball_nba`, `basketball_euroleague`
- Tenis: Potrebno dodatno istražiti točan ključ
- NFL: `americanfootball_nfl`
- Hokej na ledu: `icehockey_nhl`

#### 2.2 Struktura podataka za događaje

```typescript
interface SportEvent {
  id: string;
  sportKey: string;
  sportName: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  isLive: boolean;
  scores?: {
    homeScore: number;
    awayScore: number;
  };
  odds: Odds[];
}

interface Odds {
  bookmakerKey: string;
  bookmakerName: string;
  lastUpdate: Date;
  markets: Market[];
}

interface Market {
  key: string;
  name: string;
  outcomes: Outcome[];
}

interface Outcome {
  name: string;
  price: number;
}
```

### 3. Implementacija API servisa

#### 3.1 Osnovni API servis

```typescript
class TheOddsApiService {
  private apiKey: string;
  private baseUrl: string = 'https://api.the-odds-api.com/v4';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async getSports(): Promise<Sport[]> {
    // Implementacija dohvata dostupnih sportova
  }
  
  async getEvents(sportKey: string): Promise<SportEvent[]> {
    // Implementacija dohvata događaja za određeni sport
  }
  
  async getOdds(eventId: string): Promise<Odds[]> {
    // Implementacija dohvata kvota za određeni događaj
  }
  
  async getScores(sportKey: string): Promise<Score[]> {
    // Implementacija dohvata rezultata
  }
}
```

#### 3.2 Caching mehanizam

Za optimizaciju broja API poziva i poboljšanje performansi, implementirat ćemo Redis caching:

```typescript
class CacheService {
  private redisClient: Redis;
  
  constructor() {
    this.redisClient = new Redis();
  }
  
  async cacheData(key: string, data: any, ttl: number): Promise<void> {
    // Implementacija cachiranja podataka
  }
  
  async getCachedData(key: string): Promise<any> {
    // Implementacija dohvata cachiranih podataka
  }
  
  async invalidateCache(pattern: string): Promise<void> {
    // Implementacija invalidacije cachea
  }
}
```

### 4. Implementacija real-time ažuriranja

Za real-time ažuriranje kvota i rezultata, koristit ćemo kombinaciju periodičkih API poziva i WebSocket servisa:

```typescript
class OddsUpdateService {
  private apiService: TheOddsApiService;
  private socketServer: SocketIO.Server;
  private updateInterval: number = 60000; // 1 minuta
  
  constructor(apiService: TheOddsApiService, socketServer: SocketIO.Server) {
    this.apiService = apiService;
    this.socketServer = socketServer;
  }
  
  startUpdating(): void {
    setInterval(async () => {
      // Dohvat i ažuriranje kvota
      // Slanje ažuriranja klijentima putem WebSocketa
    }, this.updateInterval);
  }
  
  async updateOddsForEvent(eventId: string): Promise<void> {
    // Implementacija ažuriranja kvota za specifični događaj
  }
  
  async updateScoresForSport(sportKey: string): Promise<void> {
    // Implementacija ažuriranja rezultata za specifični sport
  }
}
```

### 5. Integracija s frontend komponentama

#### 5.1 Komponenta za prikaz događaja

```tsx
const EventsList: React.FC<{ sportKey: string }> = ({ sportKey }) => {
  const [events, setEvents] = useState<SportEvent[]>([]);
  
  useEffect(() => {
    // Dohvat događaja za odabrani sport
    // Postavljanje WebSocket listenera za ažuriranja
  }, [sportKey]);
  
  return (
    <div className="events-list">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};
```

#### 5.2 Komponenta za prikaz kvota

```tsx
const OddsDisplay: React.FC<{ eventId: string }> = ({ eventId }) => {
  const [odds, setOdds] = useState<Odds[]>([]);
  
  useEffect(() => {
    // Dohvat kvota za odabrani događaj
    // Postavljanje WebSocket listenera za ažuriranja
  }, [eventId]);
  
  return (
    <div className="odds-display">
      {odds.map(odd => (
        <OddsCard key={odd.bookmakerKey} odd={odd} />
      ))}
    </div>
  );
};
```

### 6. Optimizacija API poziva

Za optimizaciju broja API poziva i troškova, implementirat ćemo sljedeće strategije:

1. **Caching**: Cachiranje podataka u Redis-u s odgovarajućim TTL (Time To Live)
2. **Batch Processing**: Grupiranje API poziva gdje je moguće
3. **Prioritizacija**: Češće ažuriranje popularnih događaja i događaja uživo
4. **Rate Limiting**: Implementacija mehanizma za ograničavanje broja API poziva

### 7. Praćenje i monitoring

Za praćenje korištenja API-ja i osiguravanje pouzdanosti, implementirat ćemo:

1. **Logging**: Bilježenje svih API poziva i odgovora
2. **Error Handling**: Robusno rukovanje greškama i retries
3. **Monitoring**: Praćenje broja API poziva i kvota
4. **Alerting**: Obavještavanje o problemima i prekoračenjima kvota

## Zaključak

Integracija The Odds API-ja u našu online kladionicu omogućit će nam pouzdano i ažurno dohvaćanje sportskih podataka i kvota. Plan integracije uključuje modeliranje podataka, implementaciju API servisa, caching mehanizam, real-time ažuriranje i optimizaciju API poziva.

Sljedeći korak je implementacija osnovne infrastrukture i postavljanje razvojnog okruženja, nakon čega ćemo započeti s implementacijom API servisa prema ovom planu.
