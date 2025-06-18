# Skripta za inicijalizaciju testnih podataka

# Ova skripta se pokreće unutar backend kontejnera za inicijalizaciju testnih podataka
# Uključuje kreiranje testnih korisnika, sportskih događaja i inicijalnu konfiguraciju

# Kreiranje testnih korisnika
echo "Kreiram testne korisnike..."
node << EOF
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

async function initializeUsers() {
  try {
    const client = await MongoClient.connect('mongodb://admin:password@mongodb:27017/betting_platform?authSource=admin');
    const db = client.db('betting_platform');
    
    // Provjeri postoje li već korisnici
    const existingUsers = await db.collection('users').countDocuments();
    if (existingUsers > 0) {
      console.log('Korisnici već postoje, preskačem kreiranje...');
      await client.close();
      return;
    }
    
    // Kreiraj testnog korisnika
    const testUser = {
      email: 'test@example.com',
      password: await bcrypt.hash('Test123456', 10),
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      isAdmin: false,
      walletAddress: '0x8f5B2b7E199ea39151bA6c92DD717551Bd2F6F3A',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Kreiraj admin korisnika
    const adminUser = {
      email: 'admin@example.com',
      password: await bcrypt.hash('Admin123456', 10),
      username: 'adminuser',
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      walletAddress: '0x1234567890123456789012345678901234567890',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Spremi korisnike u bazu
    await db.collection('users').insertMany([testUser, adminUser]);
    console.log('Testni korisnici uspješno kreirani!');
    
    await client.close();
  } catch (error) {
    console.error('Greška pri kreiranju testnih korisnika:', error);
  }
}

initializeUsers();
EOF

# Kreiranje testnih sportskih događaja
echo "Kreiram testne sportske događaje..."
node << EOF
const { MongoClient } = require('mongodb');

async function initializeSportEvents() {
  try {
    const client = await MongoClient.connect('mongodb://admin:password@mongodb:27017/betting_platform?authSource=admin');
    const db = client.db('betting_platform');
    
    // Provjeri postoje li već sportski događaji
    const existingEvents = await db.collection('sportevents').countDocuments();
    if (existingEvents > 0) {
      console.log('Sportski događaji već postoje, preskačem kreiranje...');
      await client.close();
      return;
    }
    
    // Kreiraj testne sportske događaje
    const sportEvents = [
      {
        sport: 'football',
        league: 'Premier League',
        homeTeam: 'Arsenal',
        awayTeam: 'Chelsea',
        startTime: new Date(Date.now() + 86400000), // sutra
        status: 'upcoming',
        outcomes: [
          { id: 'home_win', name: 'Home Win', odds: 2.1 },
          { id: 'draw', name: 'Draw', odds: 3.2 },
          { id: 'away_win', name: 'Away Win', odds: 3.5 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sport: 'basketball',
        league: 'NBA',
        homeTeam: 'LA Lakers',
        awayTeam: 'Boston Celtics',
        startTime: new Date(Date.now() + 172800000), // prekosutra
        status: 'upcoming',
        outcomes: [
          { id: 'home_win', name: 'Home Win', odds: 1.8 },
          { id: 'away_win', name: 'Away Win', odds: 2.1 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sport: 'tennis',
        league: 'ATP',
        homeTeam: 'Novak Djokovic',
        awayTeam: 'Rafael Nadal',
        startTime: new Date(Date.now() + 259200000), // za 3 dana
        status: 'upcoming',
        outcomes: [
          { id: 'home_win', name: 'Home Win', odds: 1.9 },
          { id: 'away_win', name: 'Away Win', odds: 1.9 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Spremi sportske događaje u bazu
    await db.collection('sportevents').insertMany(sportEvents);
    console.log('Testni sportski događaji uspješno kreirani!');
    
    await client.close();
  } catch (error) {
    console.error('Greška pri kreiranju testnih sportskih događaja:', error);
  }
}

initializeSportEvents();
EOF

echo "Inicijalizacija testnih podataka završena!"
