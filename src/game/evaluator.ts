import { Card, HandResult, Rank } from './types';
import { getRankIndex } from './deck';

export function evaluatePokerHand(cards: Card[]): HandResult {
  if (cards.length !== 5) return { name: 'Invalid Hand', multiplier: 0 };

  const sorted = [...cards].sort((a, b) => getRankIndex(a.rank) - getRankIndex(b.rank));
  const ranks = sorted.map(c => getRankIndex(c.rank));
  const suits = sorted.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = checkStraight(ranks);
  const isRoyal = isStraight && ranks[0] === 8 && ranks[4] === 12; // 10-A

  const counts = getCounts(sorted);
  const countValues = Object.values(counts).sort((a, b) => b - a);

  if (isRoyal && isFlush) return { name: 'Royal Flush', multiplier: 250 };
  if (isStraight && isFlush) return { name: 'Straight Flush', multiplier: 50 };
  if (countValues[0] === 4) return { name: 'Four of a Kind', multiplier: 25 };
  if (countValues[0] === 3 && countValues[1] === 2) return { name: 'Full House', multiplier: 9 };
  if (isFlush) return { name: 'Flush', multiplier: 6 };
  if (isStraight) return { name: 'Straight', multiplier: 4 };
  if (countValues[0] === 3) return { name: 'Three of a Kind', multiplier: 3 };
  if (countValues[0] === 2 && countValues[1] === 2) return { name: 'Two Pair', multiplier: 2 };
  if (countValues[0] === 2) {
    // Jacks or Better
    const pairEntry = Object.entries(counts).find((entry) => entry[1] === 2);
    if (pairEntry && getRankIndex(pairEntry[0] as Rank) >= 9) { // J=9, Q=10, K=11, A=12
      return { name: 'Jacks or Better', multiplier: 1 };
    }
  }

  return { name: 'Nothing', multiplier: 0 };
}

function checkStraight(ranks: number[]): boolean {
  for (let i = 1; i < ranks.length; i++) {
    if (ranks[i] !== ranks[i - 1] + 1) {
      // Check for A-2-3-4-5 (wheel)
      if (i === 4 && ranks[0] === 0 && ranks[1] === 1 && ranks[2] === 2 && ranks[3] === 3 && ranks[4] === 12) {
        return true;
      }
      return false;
    }
  }
  return true;
}

function getCounts(cards: Card[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const card of cards) {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  }
  return counts;
}

// Blackjack evaluation
export function calculateBlackjackValue(cards: Card[]): number {
  let value = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === 'A') {
      aces++;
      value += 11;
    } else if (card.rank === 'K' || card.rank === 'Q' || card.rank === 'J') {
      value += 10;
    } else {
      value += parseInt(card.rank);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && calculateBlackjackValue(cards) === 21;
}
