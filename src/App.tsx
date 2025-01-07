import React, { useState, useEffect } from 'react';
import { Spade, Heart, Diamond, Club } from 'lucide-react';

type Card = {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  numericValue: number;
};

type GameState = 'betting' | 'playing' | 'dealerTurn' | 'gameOver';

function App() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [money, setMoney] = useState(1000);
  const [bet, setBet] = useState(0);
  const [message, setMessage] = useState('Place your bet!');

  const createDeck = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const newDeck: Card[] = [];

    for (const suit of suits) {
      for (const value of values) {
        let numericValue = parseInt(value);
        if (value === 'A') numericValue = 11;
        if (['J', 'Q', 'K'].includes(value)) numericValue = 10;
        newDeck.push({
          suit: suit as Card['suit'],
          value,
          numericValue
        });
      }
    }

    return shuffle(newDeck);
  };

  const shuffle = (array: Card[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const dealCards = () => {
    if (bet <= 0 || bet > money) {
      setMessage('Please place a valid bet!');
      return;
    }

    const newDeck = createDeck();
    const playerCards = [newDeck[0], newDeck[1]];
    const dealerCards = [newDeck[2], newDeck[3]];
    
    setDeck(newDeck.slice(4));
    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setGameState('playing');
    setMoney(money - bet);
  };

  const calculateHandValue = (hand: Card[]) => {
    let value = 0;
    let aces = 0;

    for (const card of hand) {
      if (card.value === 'A') {
        aces += 1;
      } else {
        value += card.numericValue;
      }
    }

    for (let i = 0; i < aces; i++) {
      if (value + 11 <= 21) {
        value += 11;
      } else {
        value += 1;
      }
    }

    return value;
  };

  const hit = () => {
    if (gameState !== 'playing') return;

    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck(deck.slice(1));

    if (calculateHandValue(newHand) > 21) {
      setGameState('gameOver');
      setMessage('Bust! You lose!');
    }
  };

  const stand = () => {
    setGameState('dealerTurn');
  };

  useEffect(() => {
    if (gameState === 'dealerTurn') {
      const dealerPlay = () => {
        let currentHand = [...dealerHand];
        let currentDeck = [...deck];

        while (calculateHandValue(currentHand) < 17) {
          currentHand.push(currentDeck[0]);
          currentDeck = currentDeck.slice(1);
        }

        setDealerHand(currentHand);
        setDeck(currentDeck);

        const dealerValue = calculateHandValue(currentHand);
        const playerValue = calculateHandValue(playerHand);

        if (dealerValue > 21) {
          setMessage('Dealer busts! You win!');
          setMoney(money + bet * 2);
        } else if (dealerValue > playerValue) {
          setMessage('Dealer wins!');
        } else if (dealerValue < playerValue) {
          setMessage('You win!');
          setMoney(money + bet * 2);
        } else {
          setMessage('Push!');
          setMoney(money + bet);
        }

        setGameState('gameOver');
      };

      dealerPlay();
    }
  }, [gameState]);

  const renderCard = (card: Card) => {
    const getSuitIcon = () => {
      switch (card.suit) {
        case 'hearts': return <Heart className="text-red-500" />;
        case 'diamonds': return <Diamond className="text-red-500" />;
        case 'clubs': return <Club />;
        case 'spades': return <Spade />;
      }
    };

    return (
      <div className="w-24 h-36 bg-white rounded-lg shadow-md border-2 border-gray-200 flex flex-col items-center justify-between p-2 m-1">
        <div className="text-xl font-bold">{card.value}</div>
        {getSuitIcon()}
        <div className="text-xl font-bold rotate-180">{card.value}</div>
      </div>
    );
  };

  const newGame = () => {
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setDeck([]);
    setBet(0);
    setMessage('Place your bet!');
  };

  return (
    <div className="min-h-screen bg-green-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-white text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Blackjack</h1>
          <p className="text-xl">Money: ${money}</p>
          {gameState === 'betting' && (
            <div className="mt-4">
              <input
                type="number"
                value={bet}
                onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 p-2 text-black rounded mr-4"
                placeholder="Bet"
              />
              <button
                onClick={dealCards}
                className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-400"
              >
                Deal
              </button>
            </div>
          )}
        </div>

        {(playerHand.length > 0 || dealerHand.length > 0) && (
          <div className="bg-green-700 rounded-lg p-8 shadow-xl">
            <div className="mb-8">
              <h2 className="text-white text-xl mb-4">Dealer's Hand ({calculateHandValue(dealerHand)})</h2>
              <div className="flex flex-wrap">
                {dealerHand.map((card, index) => (
                  <div key={index}>{renderCard(card)}</div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl mb-4">Your Hand ({calculateHandValue(playerHand)})</h2>
              <div className="flex flex-wrap">
                {playerHand.map((card, index) => (
                  <div key={index}>{renderCard(card)}</div>
                ))}
              </div>
            </div>

            {gameState === 'playing' && (
              <div className="mt-8 flex gap-4">
                <button
                  onClick={hit}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-400"
                >
                  Hit
                </button>
                <button
                  onClick={stand}
                  className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-400"
                >
                  Stand
                </button>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-white text-xl mb-4">{message}</p>
          {gameState === 'gameOver' && (
            <button
              onClick={newGame}
              className="bg-yellow-500 text-black px-6 py-2 rounded hover:bg-yellow-400"
            >
              New Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;