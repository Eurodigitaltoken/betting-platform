import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock, 
  Trophy, 
  Plus, 
  Trash2, 
  Calculator,
  ChevronLeft,
  ChevronRight,
  Search,
  Star,
  User,
  Home,
  AlertTriangle
} from 'lucide-react'
import './App.css'

function App() {
  const [events, setEvents] = useState([])
  const [liveEvents, setLiveEvents] = useState([])
  const [betSlip, setBetSlip] = useState([])
  const [betAmount, setBetAmount] = useState('')
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [userBets, setUserBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSport, setSelectedSport] = useState('all')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [currentDate, setCurrentDate] = useState(new Date())

  const [activeTab, setActiveTab] = useState("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [favoriteEvents, setFavoriteEvents] = useState([])
  const [showDateDropdown, setShowDateDropdown] = useState(false)

  const sports = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'football', name: 'Football', icon: '⚽' },
    { id: 'basketball', name: 'Basketball', icon: '🏀' },
    { id: 'tennis', name: 'Tennis', icon: '🎾' },
    { id: 'hockey', name: 'NHL', icon: '🏒' }
  ]

  // Real-time data fetching function
  const fetchSportsData = async () => {
    try {
      // Simulate API call to SofaScore or similar service
      const footballEvents = [
        // Premier League (England)
        {
          id: 1,
          homeTeam: "Manchester United",
          awayTeam: "Liverpool", 
          league: "Premier League",
          sport: "football",
          startTime: "2024-07-21T15:00:00Z",
          status: "upcoming",
          odds: { home: 2.1, draw: 3.2, away: 3.8 },
          country: "England"
        },
        {
          id: 9,
          homeTeam: "Arsenal",
          awayTeam: "Chelsea",
          league: "Premier League",
          sport: "football",
          startTime: "2024-07-21T17:30:00Z",
          status: "upcoming",
          odds: { home: 2.3, draw: 3.1, away: 3.0 },
          country: "England"
        },
        // La Liga (Spain)
        {
          id: 6,
          homeTeam: "Real Madrid",
          awayTeam: "Barcelona",
          league: "La Liga",
          sport: "football",
          startTime: "2024-07-21T21:00:00Z",
          status: "upcoming",
          odds: { home: 1.8, draw: 3.5, away: 4.2 },
          country: "Spain"
        },
        {
          id: 10,
          homeTeam: "Atletico Madrid",
          awayTeam: "Sevilla",
          league: "La Liga",
          sport: "football",
          startTime: "2024-07-21T19:00:00Z",
          status: "upcoming",
          odds: { home: 2.0, draw: 3.3, away: 3.5 },
          country: "Spain"
        },
        // Bundesliga (Germany)
        {
          id: 7,
          homeTeam: "Bayern Munich",
          awayTeam: "Borussia Dortmund",
          league: "Bundesliga",
          sport: "football",
          startTime: "2024-07-21T18:30:00Z",
          status: "upcoming",
          odds: { home: 1.6, draw: 4.0, away: 5.5 },
          country: "Germany"
        },
        {
          id: 11,
          homeTeam: "RB Leipzig",
          awayTeam: "Bayer Leverkusen",
          league: "Bundesliga",
          sport: "football",
          startTime: "2024-07-21T15:30:00Z",
          status: "upcoming",
          odds: { home: 2.2, draw: 3.4, away: 3.1 },
          country: "Germany"
        },
        // Ligue 1 (France)
        {
          id: 8,
          homeTeam: "PSG",
          awayTeam: "Marseille",
          league: "Ligue 1",
          sport: "football",
          startTime: "2024-07-21T20:00:00Z",
          status: "upcoming",
          odds: { home: 1.4, draw: 4.5, away: 7.0 },
          country: "France"
        },
        {
          id: 12,
          homeTeam: "Lyon",
          awayTeam: "Monaco",
          league: "Ligue 1",
          sport: "football",
          startTime: "2024-07-21T17:00:00Z",
          status: "upcoming",
          odds: { home: 2.5, draw: 3.2, away: 2.8 },
          country: "France"
        },
        // Serie A (Italy)
        {
          id: 13,
          homeTeam: "Juventus",
          awayTeam: "AC Milan",
          league: "Serie A",
          sport: "football",
          startTime: "2024-07-21T20:45:00Z",
          status: "upcoming",
          odds: { home: 2.1, draw: 3.3, away: 3.4 },
          country: "Italy"
        },
        {
          id: 14,
          homeTeam: "Inter Milan",
          awayTeam: "AS Roma",
          league: "Serie A",
          sport: "football",
          startTime: "2024-07-21T18:00:00Z",
          status: "upcoming",
          odds: { home: 1.9, draw: 3.5, away: 4.0 },
          country: "Italy"
        }
      ]

      const basketballEvents = [
        // NBA
        {
          id: 2,
          homeTeam: "Lakers",
          awayTeam: "Warriors",
          league: "NBA", 
          sport: "basketball",
          startTime: "2024-07-21T20:00:00Z",
          status: "upcoming",
          odds: { home: 1.9, away: 1.95 },
          country: "USA"
        },
        {
          id: 15,
          homeTeam: "Boston Celtics",
          awayTeam: "Miami Heat",
          league: "NBA",
          sport: "basketball",
          startTime: "2024-07-21T19:30:00Z",
          status: "upcoming",
          odds: { home: 1.8, away: 2.1 },
          country: "USA"
        },
        // EuroLeague
        {
          id: 16,
          homeTeam: "Real Madrid",
          awayTeam: "Barcelona",
          league: "EuroLeague",
          sport: "basketball",
          startTime: "2024-07-21T20:30:00Z",
          status: "upcoming",
          odds: { home: 1.7, away: 2.2 },
          country: "Europe"
        },
        {
          id: 17,
          homeTeam: "Fenerbahce",
          awayTeam: "Panathinaikos",
          league: "EuroLeague",
          sport: "basketball",
          startTime: "2024-07-21T18:45:00Z",
          status: "upcoming",
          odds: { home: 2.0, away: 1.85 },
          country: "Europe"
        }
      ]

      const tennisEvents = [
        {
          id: 3,
          homeTeam: "Djokovic",
          awayTeam: "Federer",
          league: "Wimbledon",
          sport: "tennis", 
          startTime: "2024-07-21T14:00:00Z",
          status: "upcoming",
          odds: { home: 1.6, away: 2.4 },
          country: "England"
        }
      ]

      const hockeyEvents = [
        // NHL
        {
          id: 18,
          homeTeam: "Toronto Maple Leafs",
          awayTeam: "Montreal Canadiens",
          league: "NHL",
          sport: "hockey",
          startTime: "2024-07-21T19:00:00Z",
          status: "upcoming",
          odds: { home: 1.8, away: 2.1 },
          country: "Canada"
        },
        {
          id: 19,
          homeTeam: "Boston Bruins",
          awayTeam: "New York Rangers",
          league: "NHL",
          sport: "hockey",
          startTime: "2024-07-21T20:00:00Z",
          status: "upcoming",
          odds: { home: 1.9, away: 1.95 },
          country: "USA"
        },
        {
          id: 20,
          homeTeam: "Tampa Bay Lightning",
          awayTeam: "Florida Panthers",
          league: "NHL",
          sport: "hockey",
          startTime: "2024-07-21T19:30:00Z",
          status: "upcoming",
          odds: { home: 2.1, away: 1.8 },
          country: "USA"
        }
      ]

      const liveFootballEvents = [
        {
          id: 4,
          homeTeam: "Flamengo",
          awayTeam: "Fluminense",
          league: "Brasileirão Betano",
          sport: "football",
          startTime: "2024-07-21T12:00:00Z",
          status: "live",
          score: { home: 1, away: 0 },
          minute: "67'",
          odds: { home: 1.8, draw: 3.5, away: 4.2 },
          country: "Brazil"
        },
        {
          id: 5,
          homeTeam: "OFK Beograd",
          awayTeam: "Spartak",
          league: "Mozzart Bet Superliga",
          sport: "football", 
          startTime: "2024-07-21T18:00:00Z",
          status: "upcoming",
          score: null,
          minute: "20:00",
          odds: { home: 2.3, draw: 3.1, away: 2.8 },
          country: "Serbia"
        }
      ]

      setEvents([...footballEvents, ...basketballEvents, ...tennisEvents, ...hockeyEvents])
      setLiveEvents(liveFootballEvents)
      
    } catch (error) {
      console.error('Error fetching sports data:', error)
    }
  }

  // Mock data za demonstraciju
  useEffect(() => {
    // Initial data fetch
    fetchSportsData()
    
    // Set up interval for real-time updates every 60 seconds
    const interval = setInterval(fetchSportsData, 60000)
    
    // Mock user bets data
    if (isWalletConnected) {
      setUserBets([
        {
          id: 'bet_001',
          eventId: 1,
          eventName: 'Manchester United vs Liverpool',
          selection: 'Manchester United',
          odds: 2.1,
          amount: 50,
          potentialWin: 105,
          status: 'active',
          type: 'single'
        },
        {
          id: 'bet_002', 
          eventIds: [2, 3],
          eventNames: ['Lakers vs Warriors', 'Djokovic vs Federer'],
          selections: ['Lakers', 'Djokovic'],
          combinedOdds: 3.04,
          amount: 25,
          potentialWin: 76,
          status: 'won',
          type: 'accumulator'
        }
      ])
    }

    setLoading(false)
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [isWalletConnected])

  const addToBetSlip = (event, selection, odds) => {
    const existingBet = betSlip.find(bet => bet.eventId === event.id)
    if (existingBet) {
      setBetSlip(betSlip.map(bet => 
        bet.eventId === event.id 
          ? { ...bet, selection, odds }
          : bet
      ))
    } else {
      setBetSlip([...betSlip, {
        eventId: event.id,
        eventName: `${event.homeTeam} vs ${event.awayTeam}`,
        selection,
        odds,
        sport: event.sport
      }])
    }
  }

  const removeFromBetSlip = (eventId) => {
    setBetSlip(betSlip.filter(bet => bet.eventId !== eventId))
  }

  const calculateTotalOdds = () => {
    if (betSlip.length === 0) return 0
    return betSlip.reduce((total, bet) => total * bet.odds, 1)
  }

  const calculatePotentialWin = () => {
    const amount = parseFloat(betAmount) || 0
    const totalOdds = calculateTotalOdds()
    return amount * totalOdds
  }

  const connectWallet = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        
        if (accounts.length > 0) {
          setIsWalletConnected(true)
          
          // Check if we're on Polygon network
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          if (chainId !== '0x89') { // Polygon Mainnet
            try {
              // Try to switch to Polygon
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x89' }],
              })
            } catch (switchError) {
              // If Polygon is not added, add it
              if (switchError.code === 4902) {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x89',
                    chainName: 'Polygon Mainnet',
                    nativeCurrency: {
                      name: 'MATIC',
                      symbol: 'MATIC',
                      decimals: 18
                    },
                    rpcUrls: ['https://polygon-rpc.com/'],
                    blockExplorerUrls: ['https://polygonscan.com/']
                  }]
                })
              }
            }
          }
          
          alert(`Wallet connected successfully!\nAddress: ${accounts[0]}\nNetwork: Polygon`)
        }
      } else {
        // If MetaMask is not installed, suggest alternatives
        const useAlternative = window.confirm(
          'MetaMask is not installed. Would you like to use an alternative wallet?\n\n' +
          'Click OK to continue with MEW (MyEtherWallet) or Cancel to install MetaMask.'
        )
        
        if (useAlternative) {
          // Simulate MEW connection
          setIsWalletConnected(true)
          alert('Connected with MEW wallet!\nPlease ensure you are using Polygon network.')
        } else {
          window.open('https://metamask.io/download/', '_blank')
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet. Please try again.')
    }
  }

  const placeBet = () => {
    if (betSlip.length === 0 || !betAmount) return
    
    // Show Polygon blockchain warning before placing bet
    const confirmed = window.confirm(
      `VAŽNO: Uplate se vrše ISKLJUČIVO preko Polygon blockchain-a!\n\n` +
      `Uplate preko drugih blockchain mreža rezultirat će nepovratnim gubitkom sredstava!\n\n` +
      `Oklada detalji:\n` +
      `Događaji: ${betSlip.length}\n` +
      `Ukupni koeficijent: ${calculateTotalOdds().toFixed(2)}\n` +
      `Iznos: ${betAmount} USDT\n` +
      `Mogući dobitak: ${calculatePotentialWin().toFixed(2)} USDT\n\n` +
      `Želite li nastaviti s uplatom?`
    )
    
    if (confirmed) {
      alert(`Oklada uspješno postavljena!\nDogađaji: ${betSlip.length}\nUkupni koeficijent: ${calculateTotalOdds().toFixed(2)}\nIznos: ${betAmount} USDT\nMogući dobitak: ${calculatePotentialWin().toFixed(2)} USDT`)
      
      setBetSlip([])
      setBetAmount('')
    }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
  }

  const generateCalendarDates = () => {
    const dates = []
    const today = new Date()
    
    // Generate 14 days (7 past + today + 6 future)
    for (let i = -7; i <= 6; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    
    return dates
  }

  const selectDate = (date) => {
    setCurrentDate(date)
    setShowDateDropdown(false)
  }

  const changeDate = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction)
    setCurrentDate(newDate)
  }

  const toggleFavorite = (eventId) => {
    setFavoriteEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const getFilteredEvents = () => {
    let allEvents = []
    
    if (selectedFilter === 'all') {
      allEvents = [...events, ...liveEvents]
    } else if (selectedFilter === 'live') {
      allEvents = liveEvents
    } else if (selectedFilter === 'upcoming') {
      allEvents = events
    } else if (selectedFilter === 'finished') {
      allEvents = [] // Mock finished events
    }

    if (selectedSport !== 'all') {
      allEvents = allEvents.filter(event => event.sport === selectedSport)
    }

    // Apply search filter
    if (searchQuery) {
      allEvents = allEvents.filter(event => 
        event.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.league.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return allEvents
  }

  const getFavoriteEvents = () => {
    const allEvents = [...events, ...liveEvents]
    return allEvents.filter(event => favoriteEvents.includes(event.id))
  }

  const EventItem = ({ event }) => (
    <Card className="mb-2 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <img 
                src={`https://flagcdn.com/w20/${event.country.toLowerCase() === 'england' ? 'gb' : 
                      event.country.toLowerCase() === 'usa' ? 'us' : 
                      event.country.toLowerCase()}.png`} 
                alt={event.country} 
                className="w-4 h-3"
                onError={(e) => e.target.style.display = 'none'}
              />
              <span className="text-sm text-muted-foreground">{event.league}</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{event.homeTeam}</span>
                {event.status === 'live' && event.score && (
                  <span className="font-bold">{event.score.home}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{event.awayTeam}</span>
                {event.status === 'live' && event.score && (
                  <span className="font-bold">{event.score.away}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 ml-4">
            <div className="flex items-center gap-2">
              {event.status === 'live' ? (
                <Badge variant="destructive" className="text-xs">LIVE</Badge>
              ) : (
                <span className="text-sm text-muted-foreground">{event.minute || new Date(event.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
              )}
              <Button variant="ghost" size="sm" onClick={() => toggleFavorite(event.id)}>
                <Star className={`h-4 w-4 ${favoriteEvents.includes(event.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </Button>
            </div>
            
            {event.odds && (
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="px-2 py-1 text-xs hover:bg-blue-50 active:bg-blue-100"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToBetSlip(event, event.homeTeam, event.odds.home);
                  }}
                >
                  {event.odds.home}
                </Button>
                {event.odds.draw && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="px-2 py-1 text-xs hover:bg-blue-50 active:bg-blue-100"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToBetSlip(event, 'Draw', event.odds.draw);
                    }}
                  >
                    {event.odds.draw}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="px-2 py-1 text-xs hover:bg-blue-50 active:bg-blue-100"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToBetSlip(event, event.awayTeam, event.odds.away);
                  }}
                >
                  {event.odds.away}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading betting platform...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Header */}
      <div className="bg-blue-700 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-700" />
            </div>
            <span className="font-bold text-lg">BetScore</span>
          </div>
          <Button 
            onClick={connectWallet}
            disabled={isWalletConnected}
            variant="secondary"
            size="sm"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {isWalletConnected ? 'Connected' : 'Connect'}
          </Button>
        </div>



        {/* Sports Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sports.map(sport => (
            <Button
              key={sport.id}
              variant={selectedSport === sport.id ? "secondary" : "ghost"}
              size="sm"
              className="flex-shrink-0 text-white hover:text-blue-700"
              onClick={() => setSelectedSport(sport.id)}
            >
              <span className="mr-1">{sport.icon}</span>
              {sport.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* Date Selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <div 
              className="flex items-center gap-2 bg-white rounded-lg p-2 cursor-pointer"
              onClick={() => setShowDateDropdown(!showDateDropdown)}
            >
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); changeDate(-1); }}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{formatDate(currentDate)}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); changeDate(1); }}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Dropdown Calendar */}
            {showDateDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-20 min-w-[280px]">
                <div className="grid grid-cols-7 gap-2">
                  {generateCalendarDates().map((date, index) => {
                    const isToday = date.toDateString() === new Date().toDateString()
                    const isSelected = date.toDateString() === currentDate.toDateString()
                    
                    return (
                      <button
                        key={index}
                        onClick={() => selectDate(date)}
                        className={`
                          w-8 h-8 rounded-md text-sm font-medium transition-colors
                          ${isSelected 
                            ? 'bg-blue-600 text-white' 
                            : isToday 
                              ? 'bg-blue-100 text-blue-600 border border-blue-300' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }
                        `}
                      >
                        {date.getDate()}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">Odds</span>
            <div className="w-10 h-6 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'all', name: 'All', count: events.length + liveEvents.length },
            { id: 'live', name: 'Live', count: liveEvents.length },
            { id: 'finished', name: 'Finished', count: 0 },
            { id: 'upcoming', name: 'Upcoming', count: events.length }
          ].map(filter => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "secondary" : "ghost"}
              size="sm"
              className={selectedFilter === filter.id ? "bg-white text-blue-700" : "text-white"}
              onClick={() => setSelectedFilter(filter.id)}
            >
              {filter.name} {filter.id === 'live' && filter.count > 0 && `(${filter.count})`}
            </Button>
          ))}
        </div>

        {/* Events List */}
      {activeTab === "home" && (
        <div className="space-y-2 mb-20">
          <h3 className="text-white text-sm mb-2">
            {selectedSport === 'football' ? 'Football' : 'Sports'} today - livescore and schedule for Premier League, Champions League
          </h3>
          
          {getFilteredEvents().map(event => (
            <EventItem key={event.id} event={event} />
          ))}
        </div>
      )}

      {activeTab === "search" && (
        <div className="p-4 mb-20">
          <h2 className="text-white text-xl font-bold mb-4">Search Events</h2>
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search teams, leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          {searchQuery ? (
            <div className="space-y-2">
              {getFilteredEvents().map(event => (
                <EventItem key={event.id} event={event} />
              ))}
              {getFilteredEvents().length === 0 && (
                <p className="text-white text-center">No events found matching your search.</p>
              )}
            </div>
          ) : (
            <p className="text-white text-center">Enter search terms to find events.</p>
          )}
        </div>
      )}

      {activeTab === "favourites" && (
        <div className="p-4 mb-20">
          <h2 className="text-white text-xl font-bold mb-4">Favourite Events</h2>
          {getFavoriteEvents().length === 0 ? (
            <p className="text-white text-center">No favourite events yet. Tap the star icon on events to add them to favourites.</p>
          ) : (
            <div className="space-y-2">
              {getFavoriteEvents().map(event => (
                <EventItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "mybets" && (
        <div className="p-4 mb-20">
          <h2 className="text-white text-xl font-bold mb-4">My Bets</h2>
          {userBets.length === 0 ? (
            <p className="text-white">No bets placed yet.</p>
          ) : (
            <div className="space-y-4">
              {userBets.map(bet => (
                <Card key={bet.id} className="bg-white/10 text-white border-none">
                  <CardHeader>
                    <CardTitle className="text-lg">{bet.type === 'single' ? bet.eventName : 'Accumulator Bet'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Amount: {bet.amount} USDT</p>
                    <p>Odds: {bet.type === 'single' ? bet.odds : bet.combinedOdds}</p>
                    <p>Potential Win: {bet.potentialWin} USDT</p>
                    <p>Status: <Badge variant={bet.status === 'won' ? 'success' : bet.status === 'lost' ? 'destructive' : 'secondary'}>{bet.status}</Badge></p>
                    {bet.type === 'accumulator' && (
                      <div className="mt-2">
                        <p className="font-medium">Selections:</p>
                        <ul className="list-disc list-inside">
                          {bet.eventNames.map((name, index) => (
                            <li key={index}>{name} - {bet.selections[index]}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "profile" && (
        <div className="p-4 mb-20">
          <h2 className="text-white text-xl font-bold mb-4">Profile</h2>
          <Card className="bg-white/10 text-white border-none">
            <CardContent className="p-4">
              <p className="mb-2">Wallet Status: {isWalletConnected ? 'Connected' : 'Not Connected'}</p>
              <p className="mb-2">Total Bets: {userBets.length}</p>
              <p className="mb-2">Favourite Events: {favoriteEvents.length}</p>
              {isWalletConnected && (
                <div className="mt-4">
                  <Button variant="outline" className="text-white border-white">
                    Disconnect Wallet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      </div>

      {/* Bet Slip */}
      {betSlip.length > 0 && (
        <div className="fixed bottom-16 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Bet Slip ({betSlip.length})</span>
            <span className="text-sm text-muted-foreground">Total: {calculateTotalOdds().toFixed(2)}</span>
          </div>
          
          <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
            {betSlip.map(bet => (
              <div key={bet.eventId} className="flex items-center justify-between text-sm">
                <span>{bet.selection}</span>
                <div className="flex items-center gap-2">
                  <span>{bet.odds}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeFromBetSlip(bet.eventId)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Amount (USDT)"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={placeBet}
              disabled={!isWalletConnected || !betAmount}
              className="bg-blue-600"
            >
              Bet {calculatePotentialWin().toFixed(2)} USDT
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around py-2">
          <Button variant="ghost" className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : ''}`} onClick={() => setActiveTab('home')}>
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className={`flex flex-col items-center gap-1 ${activeTab === 'search' ? 'text-blue-600' : ''}`} onClick={() => setActiveTab('search')}>
            <Search className="h-5 w-5" />
            <span className="text-xs">Search</span>
          </Button>
          <Button variant="ghost" className={`flex flex-col items-center gap-1 ${activeTab === 'favourites' ? 'text-blue-600' : ''}`} onClick={() => setActiveTab('favourites')}>
            <Star className="h-5 w-5" />
            <span className="text-xs">Favourites</span>
          </Button>
          <Button variant="ghost" className={`flex flex-col items-center gap-1 ${activeTab === 'mybets' ? 'text-blue-600' : ''}`} onClick={() => setActiveTab('mybets')}>
            <Wallet className="h-5 w-5" />
            <span className="text-xs">My Bets</span>
          </Button>
          <Button variant="ghost" className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-blue-600' : ''}`} onClick={() => setActiveTab('profile')}>
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App

