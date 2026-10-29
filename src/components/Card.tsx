import { SUIT_SYMBOLS, SUIT_COLORS } from '../game/types';
import type { Card as CardType } from '../game/types';

interface CardProps {
  card: CardType;
  faceDown?: boolean;
  onClick?: () => void;
  index?: number;
}

function Card({ card, faceDown = false, onClick, index = 0 }: CardProps) {
  if (faceDown) {
    return (
      <div
        className="card card-back deal-animation"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <span className="text-lg font-bold text-white">C64</span>
      </div>
    );
  }

  return (
    <div
      className={`card ${SUIT_COLORS[card.suit]} ${card.held ? 'card-held' : ''} deal-animation cursor-pointer`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={onClick}
    >
      <div className="absolute top-1 left-1 text-xs font-bold">
        {card.rank}
      </div>
      <div className="text-2xl">
        {SUIT_SYMBOLS[card.suit]}
      </div>
      <div className="absolute bottom-1 right-1 text-xs font-bold rotate-180">
        {card.rank}
      </div>
      {card.held && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black text-[8px] px-1 rounded font-bold">
          HOLD
        </div>
      )}
    </div>
  );
}

export default Card;
