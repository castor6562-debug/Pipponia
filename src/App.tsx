import React, { useState, useCallback, useEffect } from 'react';
import Card from './components/Card';
import AssemblyViewer from './components/AssemblyViewer';
import { Card as CardType, GameSettings, GamePhase, Difficulty, GameMode, HandResult } from './game/types';
import { createDeck, dealCards } from './game/deck';
import { evaluatePokerHand, calculateBlackjackValue, isBlackjack } from './game/evaluator';
import { playDealSound, playWinSound, playLoseSound, playChipSound, playMenuSound, playBlackjackSound } from './game/sound';

function App() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [settings, setSettings] = useState<GameSettings>({
    initialCapital: 1000,
    minBet: 10,
    maxBet: 500,
    difficulty: 'medium',
    gameMode: 'poker',
  });
  const [capital, setCapital] = useState(settings.initialCapital);
  const [currentBet, setCurrentBet] = useState(settings.minBet);
  const [deck, setDeck] = useState<CardType[]>([]);
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [dealerHand, setDealerHand] = useState<CardType[]>([]);
  const [handResult, setHandResult] = useState<HandResult | null>(null);
  const [message, setMessage] = useState('');
  const [showAssembly, setShowAssembly] = useState(false);
  const [pokerPhase, setPokerPhase] = useState<'bet' | 'hold' | 'result'>('bet');
  const [bjPhase, setBjPhase] = useState<'bet' | 'play' | 'dealer' | 'result'>('bet');
  const [winAnimation, setWinAnimation] = useState(false);
  const [dealerHidden, setDealerHidden] = useState(true);

  // Initialize game
  const startNewGame = useCallback((mode: GameMode) => {
    setSettings(prev => ({ ...prev, gameMode: mode }));
    setCapital(settings.initialCapital);
    setCurrentBet(settings.minBet);
    setPhase('betting');
    setPokerPhase('bet');
    setBjPhase('bet');
    setMessage('');
    setHandResult(null);
    playMenuSound();
  }, [settings.initialCapital, settings.minBet]);

  // Start poker round
  const startPokerRound = useCallback(() => {
    if (currentBet > capital) {
      setMessage('CAPITALE INSUFFICIENTE!');
      return;
    }
    
    const newDeck = createDeck();
    const { cards, remaining } = dealCards(newDeck, 5);
    
    setDeck(remaining);
    setPlayerHand(cards);
    setCapital(prev => prev - currentBet);
    setPokerPhase('hold');
    setMessage('Seleziona le carte da tenere (clicca sulle carte)');
    setHandResult(null);
    playDealSound();
  }, [currentBet, capital]);

  // Toggle card hold
  const toggleHold = useCallback((index: number) => {
    setPlayerHand(prev => prev.map((card, i) => 
      i === index ? { ...card, held: !card.held } : card
    ));
    playChipSound();
  }, []);

  // Draw replacement cards
  const drawCards = useCallback(() => {
    const heldCards = playerHand.filter(c => c.held);
    const numToDraw = 5 - heldCards.length;
    
    if (numToDraw === 0) {
      evaluateFinalHand();
      return;
    }
    
    const { cards: newCards } = dealCards(deck, numToDraw);
    const finalHand = [...heldCards, ...newCards];
    
    setPlayerHand(finalHand);
    setPokerPhase('result');
    playDealSound();
    
    // Evaluate after a short delay
    setTimeout(() => {
      evaluateFinalHandWithHand(finalHand);
    }, 500);
  }, [playerHand, deck]);

  const evaluateFinalHand = useCallback(() => {
    evaluateFinalHandWithHand(playerHand);
  }, [playerHand]);

  const evaluateFinalHandWithHand = (hand: CardType[]) => {
    const result = evaluatePokerHand(hand);
    setHandResult(result);
    
    if (result.multiplier > 0) {
      const winnings = currentBet * result.multiplier;
      setCapital(prev => prev + winnings);
      setMessage(`🎉 ${result.name}! VINCI ${winnings} crediti!`);
      setWinAnimation(true);
      playWinSound();
      setTimeout(() => setWinAnimation(false), 1000);
    } else {
      setMessage(`😔 ${result.name} - Nessuna vincita`);
      playLoseSound();
    }
    
    setPokerPhase('result');
  };

  // Blackjack functions
  const startBlackjackRound = useCallback(() => {
    if (currentBet > capital) {
      setMessage('CAPITALE INSUFFICIENTE!');
      return;
    }
    
    const newDeck = createDeck();
    const { cards: pCards, remaining: deck1 } = dealCards(newDeck, 2);
    const { cards: dCards, remaining: deck2 } = dealCards(deck1, 2);
    
    setDeck(deck2);
    setPlayerHand(pCards);
    setDealerHand(dCards);
    setDealerHidden(true);
    setCapital(prev => prev - currentBet);
    setBjPhase('play');
    setMessage('HIT o STAND?');
    setHandResult(null);
    playDealSound();
    
    // Check for blackjack
    if (isBlackjack(pCards)) {
      setTimeout(() => {
        setDealerHidden(false);
        const winnings = Math.floor(currentBet * 2.5);
        setCapital(prev => prev + winnings);
        setMessage(`🃏 BLACKJACK! VINCI ${winnings} crediti!`);
        setHandResult({ name: 'Blackjack!', multiplier: 2.5 });
        setBjPhase('result');
        setWinAnimation(true);
        playWinSound();
        setTimeout(() => setWinAnimation(false), 1000);
      }, 800);
    }
  }, [currentBet, capital]);

  const bjHit = useCallback(() => {
    const { cards, remaining } = dealCards(deck, 1);
    const newHand = [...playerHand, ...cards];
    setDeck(remaining);
    setPlayerHand(newHand);
    playBlackjackSound();
    
    const value = calculateBlackjackValue(newHand);
    if (value > 21) {
      // Bust
      setTimeout(() => {
        setDealerHidden(false);
        setMessage('💥 SBANCO! Hai superato 21!');
        setHandResult({ name: 'Bust', multiplier: 0 });
        setBjPhase('result');
        playLoseSound();
      }, 300);
    } else if (value === 21) {
      bjStand();
    }
  }, [deck, playerHand]);

  const bjStand = useCallback(() => {
    setBjPhase('dealer');
    setDealerHidden(false);
    
    // Dealer plays
    setTimeout(() => {
      let currentDealerHand = [...dealerHand];
      let currentDeck = [...deck];
      
      const dealerPlay = () => {
        const dealerValue = calculateBlackjackValue(currentDealerHand);
        
        const shouldHit = settings.difficulty === 'easy' 
          ? dealerValue < 16 
          : dealerValue < 17;
        
        if (shouldHit && currentDeck.length > 0) {
          const { cards, remaining } = dealCards(currentDeck, 1);
          currentDealerHand = [...currentDealerHand, ...cards];
          currentDeck = remaining;
          setDealerHand(currentDealerHand);
          setDeck(currentDeck);
          playDealSound();
          
          setTimeout(dealerPlay, 600);
        } else {
          // Determine winner
          const playerValue = calculateBlackjackValue(playerHand);
          const dealerValue = calculateBlackjackValue(currentDealerHand);
          
          if (dealerValue > 21) {
            const winnings = currentBet * 2;
            setCapital(prev => prev + winnings);
            setMessage(`🎉 BANCO SBANCATO! VINCI ${winnings} crediti!`);
            setHandResult({ name: 'Dealer Bust', multiplier: 2 });
            setWinAnimation(true);
            playWinSound();
          } else if (playerValue > dealerValue) {
            const winnings = currentBet * 2;
            setCapital(prev => prev + winnings);
            setMessage(`🎉 HAI VINTO! ${playerValue} vs ${dealerValue}`);
            setHandResult({ name: 'Win', multiplier: 2 });
            setWinAnimation(true);
            playWinSound();
          } else if (playerValue === dealerValue) {
            setCapital(prev => prev + currentBet);
            setMessage(`🤝 PAREGGIO! ${playerValue} vs ${dealerValue}`);
            setHandResult({ name: 'Push', multiplier: 1 });
          } else {
            setMessage(`😔 HAI PERSO! ${playerValue} vs ${dealerValue}`);
            setHandResult({ name: 'Loss', multiplier: 0 });
            playLoseSound();
          }
          
          setTimeout(() => setWinAnimation(false), 1000);
          setBjPhase('result');
        }
      };
      
      dealerPlay();
    }, 500);
  }, [dealerHand, deck, playerHand, currentBet, settings.difficulty]);

  // Adjust bet
  const adjustBet = (amount: number) => {
    const newBet = currentBet + amount;
    if (newBet >= settings.minBet && newBet <= settings.maxBet && newBet <= capital) {
      setCurrentBet(newBet);
      playChipSound();
    }
  };

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAssembly(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Menu screen
  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="text-center">
        <h1 className="text-xl c64-text-yellow mb-2">
          ╔══════════════════════╗
        </h1>
        <h1 className="text-xl c64-text-yellow mb-2">
          ║  COMMODORE 64 CASINO  ║
        </h1>
        <h1 className="text-xl c64-text-yellow mb-2">
          ╚══════════════════════╝
        </h1>
      </div>
      
      <div className="text-center c64-text text-xs mb-4">
        <p>🎰 POKER & BLACKJACK 🎰</p>
        <p className="mt-2">Codice Macchina 6502 - SID Sound</p>
      </div>

      <div className="flex flex-col space-y-4 w-64">
        <button 
          className="c64-btn text-sm py-3"
          onClick={() => startNewGame('poker')}
        >
          1 - VIDEO POKER
        </button>
        <button 
          className="c64-btn text-sm py-3"
          onClick={() => startNewGame('blackjack')}
        >
          2 - BLACKJACK
        </button>
        <button 
          className="c64-btn text-sm py-3"
          onClick={() => { setPhase('settings'); playMenuSound(); }}
        >
          3 - IMPOSTAZIONI
        </button>
        <button 
          className="c64-btn text-sm py-3"
          onClick={() => { setShowAssembly(true); playMenuSound(); }}
        >
          4 - CODICE 6502
        </button>
      </div>

      <div className="mt-8 text-center c64-text text-[10px]">
        <p>READY.</p>
        <p className="blink">█</p>
      </div>
    </div>
  );

  // Settings screen
  const renderSettings = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-4">
      <h2 className="text-lg c64-text-yellow">⚙ IMPOSTAZIONI ⚙</h2>
      
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <label className="c64-text text-xs block">CAPITALE INIZIALE:</label>
          <div className="flex items-center space-x-2">
            <button className="c64-btn" onClick={() => setSettings(s => ({...s, initialCapital: Math.max(100, s.initialCapital - 100)}))}>-</button>
            <span className="c64-text-white text-sm w-20 text-center">{settings.initialCapital}</span>
            <button className="c64-btn" onClick={() => setSettings(s => ({...s, initialCapital: Math.min(10000, s.initialCapital + 100)}))}>+</button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="c64-text text-xs block">PUNTATA MINIMA:</label>
          <div className="flex items-center space-x-2">
            <button className="c64-btn" onClick={() => setSettings(s => ({...s, minBet: Math.max(1, s.minBet - 5)}))}>-</button>
            <span className="c64-text-white text-sm w-20 text-center">{settings.minBet}</span>
            <button className="c64-btn" onClick={() => setSettings(s => ({...s, minBet: Math.min(s.maxBet, s.minBet + 5)}))}>+</button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="c64-text text-xs block">PUNTATA MASSIMA:</label>
          <div className="flex items-center space-x-2">
            <button className="c64-btn" onClick={() => setSettings(s => ({...s, maxBet: Math.max(s.minBet, s.maxBet - 50)}))}>-</button>
            <span className="c64-text-white text-sm w-20 text-center">{settings.maxBet}</span>
            <button className="c64-btn" onClick={() => setSettings(s => ({...s, maxBet: Math.min(5000, s.maxBet + 50)}))}>+</button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="c64-text text-xs block">DIFFICOLTÀ COMPUTER:</label>
          <div className="flex space-x-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
              <button 
                key={d}
                className={`c64-btn ${settings.difficulty === d ? 'bg-purple-600 text-white' : ''}`}
                onClick={() => setSettings(s => ({...s, difficulty: d}))}
              >
                {d === 'easy' ? 'FACILE' : d === 'medium' ? 'MEDIO' : 'DIFFICILE'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex space-x-4 mt-6">
        <button className="c64-btn" onClick={() => { setPhase('menu'); playMenuSound(); }}>
          ← INDIETRO
        </button>
        <button className="c64-btn" onClick={() => { setPhase('menu'); playMenuSound(); }}>
          SALVA ✓
        </button>
      </div>
    </div>
  );

  // Betting screen
  const renderBetting = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <h2 className="text-lg c64-text-yellow">
        {settings.gameMode === 'poker' ? '🃏 VIDEO POKER' : '🂡 BLACKJACK'}
      </h2>
      
      <div className="c64-text-white text-center">
        <p className="text-xs">CAPITALE: <span className="c64-text-green">{capital}</span></p>
        <p className="text-xs mt-2">PUNTATA: <span className="c64-text-yellow">{currentBet}</span></p>
      </div>

      <div className="flex space-x-2">
        <button className="c64-btn" onClick={() => adjustBet(-settings.minBet)}>
          -{settings.minBet}
        </button>
        <button className="c64-btn" onClick={() => adjustBet(-5)}>
          -5
        </button>
        <button className="c64-btn" onClick={() => adjustBet(5)}>
          +5
        </button>
        <button className="c64-btn" onClick={() => adjustBet(settings.minBet)}>
          +{settings.minBet}
        </button>
      </div>

      <div className="flex space-x-4 mt-4">
        <button 
          className="c64-btn py-3 px-6"
          onClick={() => {
            if (settings.gameMode === 'poker') {
              startPokerRound();
            } else {
              startBlackjackRound();
            }
          }}
          disabled={currentBet > capital}
        >
          GIOCA! ▶
        </button>
        <button className="c64-btn py-3" onClick={() => setPhase('menu')}>
          ← MENU
        </button>
      </div>

      {capital <= 0 && (
        <div className="c64-text-red text-xs text-center mt-4">
          <p>⚠ CAPITALE ESAURITO! ⚠</p>
          <button className="c64-btn mt-2" onClick={() => { setCapital(settings.initialCapital); }}>
            RICOMINCIA
          </button>
        </div>
      )}
    </div>
  );

  // Poker game screen
  const renderPokerGame = () => (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-4 ${winAnimation ? 'win-flash' : ''}`}>
      <div className="flex justify-between w-full max-w-2xl">
        <span className="c64-text text-xs">CAPITALE: <span className="c64-text-green">{capital}</span></span>
        <span className="c64-text text-xs">PUNTATA: <span className="c64-text-yellow">{currentBet}</span></span>
      </div>

      {/* Pay table */}
      <div className="w-full max-w-2xl bg-black bg-opacity-30 p-2 rounded border border-purple-700">
        <div className="grid grid-cols-3 gap-1 text-[8px] c64-text">
          <span>Royal Flush: x250</span>
          <span>Straight Flush: x50</span>
          <span>Four of a Kind: x25</span>
          <span>Full House: x9</span>
          <span>Flush: x6</span>
          <span>Straight: x4</span>
          <span>Three of a Kind: x3</span>
          <span>Two Pair: x2</span>
          <span>Jacks+: x1</span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex space-x-3 my-4">
        {playerHand.map((card, i) => (
          <Card 
            key={i} 
            card={card} 
            index={i}
            onClick={pokerPhase === 'hold' ? () => toggleHold(i) : undefined}
          />
        ))}
      </div>

      {/* Message */}
      <div className="c64-text-white text-xs text-center h-8">
        {message}
      </div>

      {/* Result */}
      {handResult && (
        <div className={`text-center ${handResult.multiplier > 0 ? 'c64-text-yellow' : 'c64-text-red'}`}>
          <p className="text-sm">{handResult.name}</p>
          {handResult.multiplier > 0 && (
            <p className="text-xs mt-1">+{currentBet * handResult.multiplier} crediti!</p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex space-x-3 mt-4">
        {pokerPhase === 'hold' && (
          <>
            <button className="c64-btn" onClick={drawCards}>
              CAMBIA CARTE ↻
            </button>
            <button className="c64-btn" onClick={() => {
              setPlayerHand(prev => prev.map(c => ({ ...c, held: true })));
            }}>
              TIENI TUTTE
            </button>
          </>
        )}
        {pokerPhase === 'result' && (
          <>
            <button className="c64-btn" onClick={startPokerRound} disabled={currentBet > capital}>
              NUOVA MANO ▶
            </button>
            <button className="c64-btn" onClick={() => setPhase('betting')}>
              CAMBIA PUNTATA
            </button>
          </>
        )}
        <button className="c64-btn" onClick={() => setPhase('menu')}>
          ← MENU
        </button>
      </div>
    </div>
  );

  // Blackjack game screen
  const renderBlackjackGame = () => (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-4 ${winAnimation ? 'win-flash' : ''}`}>
      <div className="flex justify-between w-full max-w-2xl">
        <span className="c64-text text-xs">CAPITALE: <span className="c64-text-green">{capital}</span></span>
        <span className="c64-text text-xs">PUNTATA: <span className="c64-text-yellow">{currentBet}</span></span>
      </div>

      {/* Dealer hand */}
      <div className="text-center">
        <p className="c64-text text-xs mb-2">
          BANCO {dealerHidden ? '' : `(${calculateBlackjackValue(dealerHand)})`}
        </p>
        <div className="flex space-x-3 justify-center">
          {dealerHand.map((card, i) => (
            <Card 
              key={`d-${i}`} 
              card={card} 
              faceDown={dealerHidden && i === 1}
              index={i}
            />
          ))}
        </div>
      </div>

      <div className="c64-text-yellow text-xs">VS</div>

      {/* Player hand */}
      <div className="text-center">
        <p className="c64-text text-xs mb-2">
          TU ({calculateBlackjackValue(playerHand)})
        </p>
        <div className="flex space-x-3 justify-center">
          {playerHand.map((card, i) => (
            <Card key={`p-${i}`} card={card} index={i} />
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="c64-text-white text-xs text-center h-8">
        {message}
      </div>

      {/* Result */}
      {handResult && (
        <div className={`text-center ${handResult.multiplier > 1 ? 'c64-text-yellow' : handResult.multiplier === 1 ? 'c64-text-cyan' : 'c64-text-red'}`}>
          <p className="text-sm">{handResult.name}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex space-x-3 mt-4">
        {bjPhase === 'play' && (
          <>
            <button className="c64-btn" onClick={bjHit}>
              HIT ↻
            </button>
            <button className="c64-btn" onClick={bjStand}>
              STAND ✋
            </button>
          </>
        )}
        {bjPhase === 'result' && (
          <>
            <button className="c64-btn" onClick={startBlackjackRound} disabled={currentBet > capital}>
              NUOVA MANO ▶
            </button>
            <button className="c64-btn" onClick={() => setPhase('betting')}>
              CAMBIA PUNTATA
            </button>
          </>
        )}
        <button className="c64-btn" onClick={() => setPhase('menu')}>
          ← MENU
        </button>
      </div>
    </div>
  );

  // Main render
  const renderGame = () => {
    if (settings.gameMode === 'poker' && (pokerPhase !== 'bet')) {
      return renderPokerGame();
    }
    if (settings.gameMode === 'blackjack' && (bjPhase !== 'bet')) {
      return renderBlackjackGame();
    }
    return renderBetting();
  };

  return (
    <div className="c64-screen">
      {/* CRT Effects */}
      <div className="scanlines"></div>
      <div className="crt-effect"></div>
      
      {/* Header */}
      <div className="c64-border-top">
        <span>**** COMMODORE 64 BASIC V2 ****</span>
      </div>
      
      {/* Main content */}
      <div className="p-4 max-w-4xl mx-auto">
        {phase === 'menu' && renderMenu()}
        {phase === 'settings' && renderSettings()}
        {(phase === 'betting' || phase === 'playing' || phase === 'result') && renderGame()}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-purple-900 bg-opacity-80 p-2 text-center">
        <span className="c64-text text-[8px]">
          64K RAM SYSTEM  |  SID 6581  |  {settings.gameMode === 'poker' ? 'VIDEO POKER' : 'BLACKJACK'}  |  
          DIFFICOLTÀ: {settings.difficulty.toUpperCase()}
        </span>
      </div>

      {/* Assembly viewer */}
      {showAssembly && (
        <AssemblyViewer 
          gameMode={settings.gameMode} 
          onClose={() => setShowAssembly(false)} 
        />
      )}
    </div>
  );
}

export default App;
