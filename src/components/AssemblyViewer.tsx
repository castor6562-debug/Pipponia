import { ASSEMBLY_POKER, ASSEMBLY_BLACKJACK_EXTRA } from '../game/assembly';
import type { GameMode } from '../game/types';
import type { ReactNode } from 'react';

interface AssemblyViewerProps {
  gameMode: GameMode;
  onClose: () => void;
}

function AssemblyViewer({ gameMode, onClose }: AssemblyViewerProps) {
  const code = gameMode === 'poker'
    ? ASSEMBLY_POKER
    : ASSEMBLY_POKER + '\n\n' + ASSEMBLY_BLACKJACK_EXTRA;

  const highlightAssembly = (line: string): ReactNode => {
    if (line.trim().startsWith(';')) {
      return <span className="asm-comment">{line}</span>;
    }
    if (line.match(/^[A-Z_@]+:/)) {
      return <span className="asm-label">{line}</span>;
    }
    const parts = line.split(/\s+/);
    if (parts.length > 0) {
      const instruction = parts[0];
      const instructions = [
        'LDA', 'LDX', 'LDY', 'STA', 'STX', 'STY', 'ADC', 'SBC',
        'AND', 'ORA', 'EOR', 'ASL', 'LSR', 'ROL', 'ROR', 'CMP', 'CPX', 'CPY',
        'BEQ', 'BNE', 'BCS', 'BCC', 'BMI', 'BPL', 'BVS', 'BVC', 'JMP', 'JSR',
        'RTS', 'RTI', 'PHA', 'PLA', 'PHP', 'PLP', 'NOP', 'SEC', 'CLC', 'SED',
        'CLD', 'SEI', 'CLI', 'TAX', 'TXA', 'TAY', 'TYA', 'TSX', 'TXS', 'INX',
        'INY', 'DEX', 'DEY', 'INC', 'DEC', '.byte', '.word', '*='
      ];
      if (instructions.includes(instruction)) {
        return (
          <span>
            <span className="asm-instruction">{instruction}</span>
            <span className="asm-register">{line.substring(instruction.length)}</span>
          </span>
        );
      }
    }
    return <span>{line}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg c64-text-yellow">
            📋 CODICE 6502 ASSEMBLY - {gameMode === 'poker' ? 'VIDEO POKER' : 'BLACKJACK'}
          </h2>
          <button onClick={onClose} className="c64-btn">
            CHIUDI [ESC]
          </button>
        </div>
        <div className="assembly-code flex-1 overflow-auto rounded border-2 border-purple-700">
          {code.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="text-gray-600 w-12 text-right pr-2 select-none">
                {(i + 1).toString().padStart(4, ' ')}
              </span>
              <span>{highlightAssembly(line)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs c64-text text-center">
          ⚡ Codice ottimizzato per MOS 6510 - 64KB RAM - SID 6581 ⚡
        </div>
      </div>
    </div>
  );
}

export default AssemblyViewer;
