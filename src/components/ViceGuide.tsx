import { useState } from 'react';

interface ViceGuideProps {
  onClose: () => void;
}

function ViceGuide({ onClose }: ViceGuideProps) {
  const [activeTab, setActiveTab] = useState<'vice' | 'real' | 'assemble'>('vice');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-purple-900 border-4 border-purple-500 rounded">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-2 border-purple-500">
          <h2 className="text-lg c64-text-yellow">
            🖥️ GUIDA VICE & COMMODORE 64
          </h2>
          <button onClick={onClose} className="c64-btn">
            CHIUDI [ESC]
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-purple-500">
          <button
            className={`flex-1 py-2 text-xs c64-btn ${activeTab === 'vice' ? 'bg-purple-600 text-white' : ''}`}
            onClick={() => setActiveTab('vice')}
          >
            VICE (Emulatore)
          </button>
          <button
            className={`flex-1 py-2 text-xs c64-btn ${activeTab === 'real' ? 'bg-purple-600 text-white' : ''}`}
            onClick={() => setActiveTab('real')}
          >
            C64 Reale
          </button>
          <button
            className={`flex-1 py-2 text-xs c64-btn ${activeTab === 'assemble' ? 'bg-purple-600 text-white' : ''}`}
            onClick={() => setActiveTab('assemble')}
          >
            Assemblare Codice
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 c64-text text-xs space-y-3">
          {activeTab === 'vice' && (
            <div className="space-y-4">
              <h3 className="c64-text-yellow text-sm">📥 1. INSTALLA VICE</h3>
              <p>Scarica VICE da: <span className="c64-text-cyan">sourceforge.net/projects/vice-emu</span></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Windows: GTK3VICE-3.x-win64.exe</li>
                <li>macOS: vice-macosx-x86_64-3.x.dmg</li>
                <li>Linux: sudo apt install vice</li>
              </ul>

              <h3 className="c64-text-yellow text-sm">🚀 2. AVVIA VICE</h3>
              <p>Apri <span className="c64-text-white">x64</span> (emulatore C64) dall'applicazione VICE.</p>

              <h3 className="c64-text-yellow text-sm">💾 3. CARICA IL PROGRAMMA</h3>
              <p className="c64-text-white">Metodo A - File .PRG:</p>
              <div className="assembly-code text-[10px]">
                File → Attach disk image → casino.prg<br/>
                Poi nel C64 digita:<br/>
                <span className="c64-text-green">LOAD "CASINO",8,1</span><br/>
                <span className="c64-text-green">RUN</span>
              </div>

              <p className="c64-text-white mt-2">Metodo B - Loader BASIC:</p>
              <div className="assembly-code text-[10px]">
                File → Smart attach → casino_loader.bas<br/>
                Poi nel C64 digita:<br/>
                <span className="c64-text-green">LOAD "CASINO_LOADER",8</span><br/>
                <span className="c64-text-green">RUN</span>
              </div>

              <h3 className="c64-text-yellow text-sm">⚙️ 4. CONFIGURA VICE</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Settings → Sound → SID engine: <span className="c64-text-white">ReSID</span></li>
                <li>Settings → Video → CRT emulation: <span className="c64-text-white">Attiva</span></li>
                <li>Speed: <span className="c64-text-white">100%</span></li>
              </ul>

              <h3 className="c64-text-yellow text-sm">🎮 5. CONTROLLI</h3>
              <div className="grid grid-cols-2 gap-2 ml-4">
                <div>
                  <p className="c64-text-white">Video Poker:</p>
                  <ul className="list-disc list-inside">
                    <li>1-5: Tieni carta</li>
                    <li>ENTER: Cambia carte</li>
                  </ul>
                </div>
                <div>
                  <p className="c64-text-white">Blackjack:</p>
                  <ul className="list-disc list-inside">
                    <li>H: Hit</li>
                    <li>S: Stand</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'real' && (
            <div className="space-y-4">
              <h3 className="c64-text-yellow text-sm">📋 REQUISITI</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Commodore 64 (o 128 in mode C64)</li>
                <li>Floppy disk drive 1541/1571/1581</li>
                <li>SD2IEC o Pi1541 (alternative moderne)</li>
                <li>Oppure: cassette datasette</li>
              </ul>

              <h3 className="c64-text-yellow text-sm">💿 METODO 1: FLOPPY DISK</h3>
              <div className="assembly-code text-[10px]">
                1. Scrivi casino.prg su floppy disk<br/>
                2. Inserisci disk nel drive<br/>
                3. Accendi C64<br/>
                4. Digita:<br/>
                <span className="c64-text-green">LOAD "CASINO",8,1</span><br/>
                <span className="c64-text-green">RUN</span>
              </div>

              <h3 className="c64-text-yellow text-sm">🗂️ METODO 2: SD2IEC / Pi1541</h3>
              <div className="assembly-code text-[10px]">
                1. Copia casino.prg su scheda SD<br/>
                2. Inserisci SD2IEC/Pi1541 nel C64<br/>
                3. Accendi<br/>
                4. Digita:<br/>
                <span className="c64-text-green">LOAD "CASINO",8,1</span><br/>
                <span className="c64-text-green">RUN</span>
              </div>

              <h3 className="c64-text-yellow text-sm">📼 METODO 3: CASSETTA</h3>
              <div className="assembly-code text-[10px]">
                1. Registra casino.prg su cassetta<br/>
                2. Inserisci cassetta nel datasette<br/>
                3. Digita:<br/>
                <span className="c64-text-green">LOAD</span><br/>
                <span className="c64-text-green">RUN</span><br/>
                4. Premi PLAY sul datasette
              </div>

              <h3 className="c64-text-yellow text-sm">🎯 METODO 4: EASYFLASH</h3>
              <div className="assembly-code text-[10px]">
                1. Converti .prg in formato .crt<br/>
                2. Scrivi su cartuccia EasyFlash<br/>
                3. Inserisci nel C64<br/>
                4. Si avvia automaticamente
              </div>
            </div>
          )}

          {activeTab === 'assemble' && (
            <div className="space-y-4">
              <h3 className="c64-text-yellow text-sm">🔧 64TASS (Consigliato)</h3>
              <div className="assembly-code text-[10px]">
                <span className="asm-comment"># Installa 64tass</span><br/>
                <span className="c64-text-green">Windows:</span> tass64.sourceforge.io<br/>
                <span className="c64-text-green">Linux:</span> sudo apt install 64tass<br/>
                <span className="c64-text-green">macOS:</span> brew install 64tass<br/>
                <br/>
                <span className="asm-comment"># Assembla</span><br/>
                <span className="c64-text-green">64tass -o casino.prg casino.asm</span>
              </div>

              <h3 className="c64-text-yellow text-sm">🔨 ACME</h3>
              <div className="assembly-code text-[10px]">
                <span className="asm-comment"># Installa ACME</span><br/>
                <span className="c64-text-green">Linux:</span> sudo apt install acme<br/>
                <span className="c64-text-green">macOS:</span> brew install acme<br/>
                <br/>
                <span className="asm-comment"># Assembla</span><br/>
                <span className="c64-text-green">acme casino.asm</span>
              </div>

              <h3 className="c64-text-yellow text-sm">⚡ CC65</h3>
              <div className="assembly-code text-[10px]">
                <span className="asm-comment"># Installa CC65</span><br/>
                <span className="c64-text-green">Sito:</span> cc65.github.io<br/>
                <br/>
                <span className="asm-comment"># Assembla</span><br/>
                <span className="c64-text-green">ca65 casino.asm -o casino.o</span><br/>
                <span className="c64-text-green">ld65 -t c64 -o casino.prg casino.o</span>
              </div>

              <h3 className="c64-text-yellow text-sm">📝 STRUTTURA FILE</h3>
              <div className="assembly-code text-[10px]">
                casino.asm ← Codice sorgente assembly<br/>
                casino.prg ← File eseguibile (dopo assemblaggio)<br/>
                casino_loader.bas ← Loader BASIC<br/>
                README.md ← Documentazione completa
              </div>

              <h3 className="c64-text-yellow text-sm">🎯 MEMORY MAP</h3>
              <div className="assembly-code text-[10px]">
                $0801-$080D: BASIC stub<br/>
                $080D-$0FFF: Codice programma<br/>
                $1000-$1FFF: Stack e variabili<br/>
                $2000-$3FFF: Dati e mazzo<br/>
                $C000-$CFFF: Routine principali<br/>
                $D000-$D3FF: VIC-II (video)<br/>
                $D400-$D7FF: SID (audio)<br/>
                $DC00-$DCFF: CIA (I/O)
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-purple-500 text-center">
          <div className="flex justify-center space-x-4">
            <a
              href="/c64/casino.asm"
              download
              className="c64-btn text-xs"
            >
              📥 SCARICA .ASM
            </a>
            <a
              href="/c64/casino_loader.bas"
              download
              className="c64-btn text-xs"
            >
              📥 SCARICA .BAS
            </a>
            <a
              href="/c64/README.md"
              download
              className="c64-btn text-xs"
            >
              📥 SCARICA README
            </a>
          </div>
          <p className="c64-text text-[10px] mt-2">
            ⚡ Tutti i file sono pronti per essere usati su VICE o C64 reale ⚡
          </p>
        </div>
      </div>
    </div>
  );
}

export default ViceGuide;
