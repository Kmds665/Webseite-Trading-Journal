import React, { useState, useEffect } from 'react';

const TradingJournal = () => {
  // State Management
  const [darkMode, setDarkMode] = useState(true);
  const [activePage, setActivePage] = useState('home');
  const [trades, setTrades] = useState([]);
  const [accountSize, setAccountSize] = useState(10000);
  const [showModal, setShowModal] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile) : {
      name: 'Trader',
      email: '',
      accountSize: 10000,
      startDate: new Date().toISOString().split('T')[0]
    };
  });
  const [newTrade, setNewTrade] = useState({
    id: Date.now(),
    pair: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    direction: 'long',
    risk: '',
    result: '',
    resultType: 'win', // 'win', 'loss', 'be'
    riskReward: '',
    emotion: 'neutral',
    notes: '',
    screenshots: []
  });

  // Load trades from localStorage
  useEffect(() => {
    const savedTrades = localStorage.getItem('trades');
    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    }
  }, []);

  // Save to localStorage when trades or profile changes
  useEffect(() => {
    localStorage.setItem('trades', JSON.stringify(trades));
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [trades, userProfile]);

  // Calculate stats
  const calculateStats = () => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalProfit: 0
      };
    }

    const wins = trades.filter(trade => parseFloat(trade.result) > 0);
    const totalProfit = trades.reduce((sum, trade) => sum + parseFloat(trade.result || 0), 0);

    return {
      totalTrades: trades.length,
      winRate: trades.length ? ((wins.length / trades.length) * 100).toFixed(2) : 0,
      totalProfit: totalProfit.toFixed(2)
    };
  };

  const [stats, setStats] = useState(calculateStats());
  const [statsPeriod, setStatsPeriod] = useState('all'); // 'all', 'day', 'week', 'month', 'year'

  // Update stats when trades change or period changes
  useEffect(() => {
    setStats(calculateStats(statsPeriod === 'all' ? null : statsPeriod));
  }, [trades, statsPeriod]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setNewTrade({
        ...newTrade,
        screenshots: files
      });
    } else {
      setNewTrade({
        ...newTrade,
        [name]: value
      });
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Konvertiere Screenshots zu Data URLs, falls vorhanden
    const processScreenshots = async () => {
      let screenshotUrls = [];
      
      if (newTrade.screenshots && newTrade.screenshots.length > 0) {
        for (let i = 0; i < newTrade.screenshots.length; i++) {
          const file = newTrade.screenshots[i];
          const reader = new FileReader();
          
          // Konvertiere jedes Bild in eine Data URL
          const dataUrl = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
          
          screenshotUrls.push(dataUrl);
        }
      }
      
      // Ergebnis-Typ automatisch setzen, falls nicht explizit gewählt
      let resultType = newTrade.resultType;
      if (resultType === 'auto') {
        const resultValue = parseFloat(newTrade.result);
        if (resultValue > 0) resultType = 'win';
        else if (resultValue < 0) resultType = 'loss';
        else resultType = 'be';
      }
      
      const tradeToAdd = {
        ...newTrade,
        id: Date.now(),
        resultType,
        screenshotUrls
      };
      
      setTrades([tradeToAdd, ...trades]);
      setShowModal(false);
      setNewTrade({
        id: Date.now(),
        pair: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        direction: 'long',
        risk: '',
        result: '',
        resultType: 'win',
        riskReward: '',
        emotion: 'neutral',
        notes: '',
        screenshots: []
      });
    };
    
    processScreenshots();
  };

  // Delete a trade
  const deleteTrade = (id) => {
    setTrades(trades.filter(trade => trade.id !== id));
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className={darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}>
      <div className="flex min-h-screen relative">
        {/* Hamburger Button */}
        <button 
          className="absolute top-4 left-4 z-40 p-2 rounded hover:bg-gray-700"
          onClick={() => setSidebarVisible(!sidebarVisible)}
        >
          <div className="w-6 h-0.5 bg-white mb-1.5"></div>
          <div className="w-6 h-0.5 bg-white mb-1.5"></div>
          <div className="w-6 h-0.5 bg-white"></div>
        </button>

        {/* Sidebar */}
        <div 
          className={`w-64 bg-gray-800 p-4 absolute top-0 bottom-0 z-30 transition-transform duration-300 ease-in-out ${
            sidebarVisible ? 'translate-x-0' : '-translate-x-64'
          }`}
        >
          <div className="h-12"></div> {/* Spacer für den Hamburger-Button */}
          <h1 className="text-xl font-bold mb-8">Trading Journal</h1>
          <nav>
            <ul className="space-y-2">
              <li>
                <button 
                  className={`w-full text-left px-4 py-2 rounded ${activePage === 'home' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                  onClick={() => {
                    setActivePage('home');
                    setSidebarVisible(false);
                  }}
                >
                  Startseite
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-2 rounded ${activePage === 'journal' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                  onClick={() => {
                    setActivePage('journal');
                    setSidebarVisible(false);
                  }}
                >
                  Journal
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-2 rounded ${activePage === 'profile' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                  onClick={() => {
                    setActivePage('profile');
                    setSidebarVisible(false);
                  }}
                >
                  Profil
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-2 rounded ${activePage === 'statistics' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                  onClick={() => {
                    setActivePage('statistics');
                    setSidebarVisible(false);
                  }}
                >
                  Statistiken
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-2 rounded ${activePage === 'settings' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                  onClick={() => {
                    setActivePage('settings');
                    setSidebarVisible(false);
                  }}
                >
                  Einstellungen
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 pl-16">
          {/* Header */}
          <header className="bg-gray-800 p-4 shadow">
            <div className="container mx-auto">
              <h1 className="text-2xl font-bold">
                {activePage === 'home' && 'Trading Journal - Startseite'}
                {activePage === 'journal' && 'Trading Journal'}
                {activePage === 'profile' && 'Mein Profil'}
                {activePage === 'statistics' && 'Statistiken'}
                {activePage === 'settings' && 'Einstellungen'}
              </h1>
            </div>
          </header>

          {/* Content Area */}
          <main className="p-4">
            {/* Home Page */}
            {activePage === 'home' && (
              <div className="bg-gray-800 p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-2">Willkommen, {userProfile.name}!</h2>
                <div className="mb-6 text-gray-400">
                  {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <p className="mb-6">
                  Hier kannst du deine Trades dokumentieren, analysieren und deine Performance verbessern.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700 p-4 rounded">
                    <h3 className="font-medium mb-2">Schnellzugriff</h3>
                    <div className="space-y-2">
                      <button 
                        onClick={() => setActivePage('journal')}
                        className="w-full text-left px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded flex items-center"
                      >
                        <span className="mr-2">📓</span> Journal öffnen
                      </button>
                      <button 
                        onClick={() => {
                          setActivePage('journal');
                          setShowModal(true);
                        }}
                        className="w-full text-left px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded flex items-center"
                      >
                        <span className="mr-2">✏️</span> Neuen Trade hinzufügen
                      </button>
                      <button 
                        onClick={() => setActivePage('statistics')}
                        className="w-full text-left px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded flex items-center"
                      >
                        <span className="mr-2">📊</span> Statistiken anzeigen
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded">
                    <h3 className="font-medium mb-2">Aktuelle Performance</h3>
                    {trades.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Trades gesamt:</span>
                          <span className="font-bold">{trades.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gewinner:</span>
                          <span className="font-bold text-green-500">
                            {trades.filter(t => parseFloat(t.result) > 0).length}
                          </span>
                        </div>
                        <div>
                          <div className="mb-2">Zeitraum:</div>
                          <div className="grid grid-cols-2 gap-1 mb-2">
                            <button 
                              onClick={() => setStatsPeriod('all')} 
                              className={`p-1 text-xs rounded ${statsPeriod === 'all' ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                              Alle Zeit
                            </button>
                            <button 
                              onClick={() => setStatsPeriod('day')} 
                              className={`p-1 text-xs rounded ${statsPeriod === 'day' ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                              Heute
                            </button>
                            <button 
                              onClick={() => setStatsPeriod('month')} 
                              className={`p-1 text-xs rounded ${statsPeriod === 'month' ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                              Monat
                            </button>
                            <button 
                              onClick={() => setStatsPeriod('year')} 
                              className={`p-1 text-xs rounded ${statsPeriod === 'year' ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                              Jahr
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Gewinn/Verlust:</span>
                          <span className={`font-bold ${parseFloat(stats.totalProfit) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${stats.totalProfit}
                          </span>
                        </div>
                        <div className="mt-1">
                          {trades.slice(0, 3).map(trade => (
                            <div key={trade.id} className="text-sm py-1 border-b border-gray-600 flex justify-between">
                              <span>{trade.pair}</span>
                              <span className={parseFloat(trade.result) > 0 ? 'text-green-500' : 'text-red-500'}>
                                ${parseFloat(trade.result).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        Noch keine Trades vorhanden. Füge deinen ersten Trade hinzu.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Journal Page */}
            {activePage === 'journal' && (
              <div>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 p-4 rounded shadow">
                    <h3 className="text-sm opacity-70">Trades</h3>
                    <p className="text-2xl font-bold">{stats.totalTrades}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded shadow">
                    <h3 className="text-sm opacity-70">Gewinnrate</h3>
                    <p className="text-2xl font-bold">{stats.winRate}%</p>
                  </div>
                  <div className={`p-4 rounded shadow ${parseFloat(stats.totalProfit) >= 0 ? 'bg-green-800' : 'bg-red-800'}`}>
                    <h3 className="text-sm opacity-70">Gewinn/Verlust</h3>
                    <p className="text-2xl font-bold">${stats.totalProfit}</p>
                  </div>
                </div>

                {/* Trades Table */}
                <div className="bg-gray-800 rounded shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="text-left p-4">Paar</th>
                        <th className="text-left p-4">Datum</th>
                        <th className="text-left p-4">PnL</th>
                        <th className="text-left p-4">Richtung</th>
                        <th className="text-left p-4">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((trade) => (
                        <tr key={trade.id} className="border-t border-gray-700">
                          <td className="p-4">{trade.pair}</td>
                          <td className="p-4">{formatDate(trade.date)}</td>
                          <td className={`p-4 ${parseFloat(trade.result) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${parseFloat(trade.result).toFixed(2)}
                          </td>
                          <td className={`p-4 ${trade.direction === 'long' ? 'text-green-500' : 'text-red-500'}`}>
                            {trade.direction === 'long' ? 'Long' : 'Short'}
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => deleteTrade(trade.id)}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                            >
                              Löschen
                            </button>
                          </td>
                        </tr>
                      ))}
                      {trades.length === 0 && (
                        <tr>
                          <td colSpan="5" className="p-4 text-center">
                            Keine Trades vorhanden. Füge deinen ersten Trade hinzu.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Add Trade Button */}
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Trade hinzufügen
                </button>
              </div>
            )}

            {/* Profile Page */}
            {activePage === 'profile' && (
              <div className="bg-gray-800 p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-6">Mein Profil</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1">Name</label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">E-Mail</label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                      placeholder="deine@email.de"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Account Größe ($)</label>
                    <input
                      type="number"
                      value={userProfile.accountSize}
                      onChange={(e) => {
                        const newSize = parseFloat(e.target.value);
                        setUserProfile({...userProfile, accountSize: newSize});
                        setAccountSize(newSize);
                      }}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Startdatum</label>
                    <input
                      type="date"
                      value={userProfile.startDate}
                      onChange={(e) => setUserProfile({...userProfile, startDate: e.target.value})}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                    />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded">
                    Speichern
                  </button>
                </div>
              </div>
            )}

            {/* Statistics Page */}
            {activePage === 'statistics' && (
              <div className="bg-gray-800 p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Statistiken</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded">
                      <h3 className="font-bold mb-2">Übersicht</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Gesamttrades:</span>
                          <span>{stats.totalTrades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gewinnrate:</span>
                          <span>{stats.winRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gewinn/Verlust:</span>
                          <span>${stats.totalProfit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded">
                      <h3 className="font-bold mb-2">Performance</h3>
                      <div className="h-40 flex items-center justify-center bg-gray-800 rounded">
                        <span>📈 Chart wird hier angezeigt</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Page */}
            {activePage === 'settings' && (
              <div className="bg-gray-800 p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Einstellungen</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Darstellung</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setDarkMode(true)}
                        className={`px-4 py-2 rounded ${darkMode ? 'bg-blue-600' : 'bg-gray-700'}`}
                      >
                        Dunkel
                      </button>
                      <button
                        onClick={() => setDarkMode(false)}
                        className={`px-4 py-2 rounded ${!darkMode ? 'bg-blue-600' : 'bg-gray-700'}`}
                      >
                        Hell
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Benutzerdaten</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1">Name</label>
                        <input
                          type="text"
                          value={userProfile.name}
                          onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Account Größe ($)</label>
                        <input
                          type="number"
                          value={userProfile.accountSize}
                          onChange={(e) => {
                            const newSize = parseFloat(e.target.value);
                            setUserProfile({...userProfile, accountSize: newSize});
                            setAccountSize(newSize);
                          }}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Datenverwaltung</h3>
                    <button 
                      onClick={() => {
                        if (window.confirm('Möchtest du wirklich alle Trades löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
                          setTrades([]);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded"
                    >
                      Alle Trades löschen
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add Trade Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Neuen Trade hinzufügen</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Paar/Symbol</label>
                  <input
                    type="text"
                    name="pair"
                    value={newTrade.pair}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Datum</label>
                    <input
                      type="date"
                      name="date"
                      value={newTrade.date}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Richtung</label>
                    <select
                      name="direction"
                      value={newTrade.direction}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    >
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Risiko ($)</label>
                    <input
                      type="number"
                      name="risk"
                      value={newTrade.risk}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Ergebnis ($)</label>
                    <input
                      type="number"
                      name="result"
                      value={newTrade.result}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1">Emotion</label>
                  <select
                    name="emotion"
                    value={newTrade.emotion}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="angst">Angst</option>
                    <option value="gier">Gier</option>
                    <option value="ungeduld">Ungeduld</option>
                    <option value="zuversicht">Zuversicht</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Notizen</label>
                  <textarea
                    name="notes"
                    value={newTrade.notes}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                    rows="3"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-700 rounded"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 rounded"
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingJournal;
