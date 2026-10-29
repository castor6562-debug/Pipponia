export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  held: boolean;
}

export type GameMode = 'poker' | 'blackjack';
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
