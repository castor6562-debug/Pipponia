export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  held: boolean;
}

export type GameMode = 'poker' | 'blackjack';
export type GamePhase = 'menu' | 'settings' | 'betting' | 'playing' | 'dealerTurn' | 'result' | 'assembly';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameSettings {
  initialCapital: number;
  minBet: number;
  maxBet: number;
  difficulty: Difficulty;
  gameMode: GameMode;
}

export interface HandResult {
  name: string;
  multiplier: number;
}

export const HAND_RANKINGS: Record<string, number> = {
  'Royal Flush': 250,
  'Straight Flush': 50,
  'Four of a Kind': 25,
  'Full House': 9,
  'Flush': 6,
  'Straight': 4,
  'Three of a Kind': 3,
  'Two Pair': 2,
  'Jacks or Better': 1,
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export const SUIT_COLORS: Record<Suit, string> = {
  hearts: 'card-red',
  diamonds: 'card-red',
  clubs: 'card-black',
  spades: 'card-black',
};
