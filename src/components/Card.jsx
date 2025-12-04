import React from 'react';
import { Shield, Sword } from 'lucide-react';
import { CARD_TYPES } from '../constants/gameData';

const Card = ({ card, index, inHand = false, onClick }) => {
  if (!card) return null;
  
  let border = "border-zinc-600";
  let bg = "bg-zinc-800";
  if (card.type === CARD_TYPES.ATTACK) { border = "border-red-500/50"; bg = "bg-zinc-900"; }
  if (card.type === CARD_TYPES.SKILL) { border = "border-blue-500/50"; bg = "bg-zinc-900"; }

  return (
    <div 
      onClick={() => inHand && onClick && onClick(card, index)}
      className={`
        relative w-28 h-40 sm:w-32 sm:h-48 rounded-lg border-2 ${border} ${bg} p-2 flex flex-col justify-between select-none shadow-lg
        ${inHand ? 'cursor-pointer hover:-translate-y-6 hover:shadow-cyan-500/20 transition-all duration-200 z-10 hover:z-20 hover:scale-105' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] sm:text-xs font-bold text-zinc-300 leading-none">{card.name}</span>
        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
          {card.cost}
        </div>
      </div>
      
      <div className="text-center my-1 flex-1 flex items-center justify-center">
        {card.type === CARD_TYPES.ATTACK && <Sword className="w-8 h-8 text-red-700 opacity-80" />}
        {card.type === CARD_TYPES.SKILL && <Shield className="w-8 h-8 text-blue-700 opacity-80" />}
      </div>

      <div className="text-[9px] sm:text-[10px] text-zinc-400 leading-tight">
        {card.desc}
      </div>

      {card.ammoCost > 0 && (
        <div className="absolute -top-2 -right-2 bg-yellow-600/90 text-black text-[10px] px-1.5 py-0.5 rounded font-bold border border-yellow-400 shadow-sm backdrop-blur-sm">
          -{card.ammoCost} 弹
        </div>
      )}
    </div>
  );
};

export default Card;