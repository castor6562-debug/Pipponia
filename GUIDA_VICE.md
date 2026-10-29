# 🎮 GUIDA RAPIDA - COME USARE IL GIOCO SU COMMODORE 64 O VICE

## ✅ COSA È STATO CREATO

Il progetto include ora **tutto il necessario** per usare il gioco su un Commodore 64 reale o sull'emulatore VICE:

### File disponibili nella cartella `public/c64/`:
1. **casino.asm** - Codice sorgente assembly 6502 completo e assemblabile
2. **casino_loader.bas** - Loader BASIC per avviare il gioco
3. **README.md** - Documentazione dettagliata completa

### Funzionalità nell'app web:
- **Menu opzione 5** - "GUIDA VICE / C64" con istruzioni interattive
- **Pulsanti download** - Per scaricare tutti i file C64 direttamente dall'app

---

## 🖥️ COME USARE SU VICE (EMULATORE) - METODO VELOCE

### 1. Scarica VICE
- **Sito**: https://sourceforge.net/projects/vice-emu/
- **Windows**: Scarica `GTK3VICE-3.x-win64.exe`
- **macOS**: Scarica `vice-macosx-x86_64-3.x.dmg`
- **Linux**: `sudo apt install vice`

### 2. Avvia l'emulatore
Apri **x64** dall'applicazione VICE installata

### 3. Scarica i file dal gioco web
Nell'app web, vai su **"5 - GUIDA VICE / C64"** e clicca i pulsanti:
- 📥 SCARICA .ASM
- 📥 SCARICA .BAS
- 📥 SCARICA README

### 4. Carica il gioco in VICE

**Metodo più semplice - Loader BASIC:**
```
1. In VICE: File → Smart attach disk/tape
2. Seleziona casino_loader.bas
3. Nel C64 digita:
   LOAD "CASINO_LOADER",8
   RUN
```

**Metodo alternativo - Assembla prima:**
```
1. Assembla casino.asm con 64tass:
   64tass -o casino.prg casino.asm

2. In VICE: File → Attach disk image
3. Seleziona casino.prg
4. Nel C64 digita:
   LOAD "CASINO",8,1
   RUN
```

---

## 🎯 COME USARE SU UN VERO COMMODORE 64

### Requisiti:
- Commodore 64 (o 128 in modalità C64)
- Floppy disk drive 1541/1571/1581
- **OPPURE** SD2IEC / Pi1541 (soluzione moderna)
- **OPPURE** Datasette per cassette

### Procedura:

**Con Floppy Disk:**
```
1. Scrivi casino.prg su floppy disk
2. Inserisci il disk nel drive
3. Accendi il C64
4. Digita:
   LOAD "CASINO",8,1
   RUN
```

**Con SD2IEC / Pi1541:**
```
1. Copia casino.prg su scheda SD
2. Inserisci SD2IEC/Pi1541 nel C64
3. Accendi
4. Digita:
   LOAD "CASINO",8,1
   RUN
```

**Con Cassetta:**
```
1. Registra casino.prg su cassetta
2. Inserisci cassetta nel datasette
3. Digita:
   LOAD
   RUN
4. Premi PLAY sul datasette
```

---

## 🔧 COME ASSEMBLARE IL CODICE SORGENTE

Se vuoi modificare il codice assembly e ricompilarlo:

### Opzione 1: 64tass (Consigliato)
```bash
# Installa
# Windows: https://tass64.sourceforge.io/
# Linux: sudo apt install 64tass
# macOS: brew install 64tass

# Assembla
64tass -o casino.prg casino.asm
```

### Opzione 2: ACME
```bash
# Installa
# Linux: sudo apt install acme
# macOS: brew install acme

# Assembla
acme casino.asm
```

### Opzione 3: CC65
```bash
# Installa da https://cc65.github.io/

# Assembla
ca65 casino.asm -o casino.o
ld65 -t c64 -o casino.prg casino.o
```

---

## 🎮 CONTROLLI DEL GIOCO

### Menu Principale
- **1** - Video Poker
- **2** - Blackjack
- **3** - Impostazioni
- **4** - Codice 6502 (visualizza assembly)
- **5** - Guida VICE / C64

### Video Poker
- **1-5** - Tieni/scarta carta corrispondente
- **ENTER** - Cambia carte non tenute
- **ESC** - Torna al menu

### Blackjack
- **H** - Hit (pesca carta)
- **S** - Stand (stai)
- **ENTER** - Nuova mano
- **ESC** - Torna al menu

---

## 🎨 CARATTERISTICHE DEL GIOCO C64

### Grafica
- ✅ Schermo completo 40×25 caratteri
- ✅ Colori C64 originali (16 colori)
- ✅ Carte disegnate con caratteri PETSCII
- ✅ Effetti visivi per vincite/perdite

### Audio (SID 6581)
- ✅ Effetti sonori autentici
- ✅ Suono distribuzione carte
- ✅ Fanfara vincite
- ✅ Suono perdite
- ✅ Suoni menu e chip

### Gameplay
- ✅ Video Poker (Jacks or Better)
  - Paga da 1x a 250x
  - Hold/discard meccanica
- ✅ Blackjack
  - Regole standard
  - Blackjack paga 3:2
  - Dealer sta a 17

### Impostazioni
- ✅ Capitale iniziale: 100-10000
- ✅ Puntata minima: 1-100
- ✅ Puntata massima: 50-5000
- ✅ Difficoltà: Facile/Medio/Difficile

---

## 📋 FILE DISPONIBILI PER IL DOWNLOAD

Dall'app web (menu opzione 5), puoi scaricare:

1. **casino.asm** (circa 15KB)
   - Codice sorgente assembly 6502 completo
   - Commentato e documentato
   - Pronto per essere assemblato

2. **casino_loader.bas** (circa 1KB)
   - Loader BASIC semplice
   - Carica il codice macchina in memoria
   - Avvia il gioco con SYS

3. **README.md** (circa 8KB)
   - Documentazione completa
   - Istruzioni dettagliate
   - Troubleshooting
   - Note tecniche

---

## 🐛 TROUBLESHOOTING

### Il gioco non si carica in VICE
- Verifica che il file sia nella directory corretta
- Controlla device number (deve essere 8)
- Prova `LOAD "$",8` per vedere i file

### Errori di sintassi nel BASIC
- Copia esattamente il codice
- Controlla spazi e maiuscole/minuscole
- Il BASIC C64 è case-sensitive

### Il suono non funziona
- Verifica volume SID in VICE
- Settings → Sound → SID engine: ReSID
- Su C64 reale, verifica chip SID

### Il gioco è troppo lento/veloce
- VICE: Settings → Speed → 100%
- C64 reale: velocità automatica

---

## 📚 RISORSE UTILI

### Documentazione
- [Commodore 64 Programmer's Reference](http://www.zimmers.net/anonftp/pub/cbm/programming/c64prg.txt)
- [VICE User Manual](https://sourceforge.net/p/vice-emu/code/HEAD/tree/trunk/vice/doc/vice_toc.html)
- [6502 Assembly Tutorial](https://www.masswerk.at/6502/assembler.html)

### Assembler
- [64tass](https://tass64.sourceforge.io/)
- [ACME](https://sourceforge.net/projects/acme-crossass/)
- [CC65](https://cc65.github.io/)

### Emulatori
- [VICE](https://sourceforge.net/projects/vice-emu/)
- [CCS64](http://www.ccs64.com/)
- [Hoxs64](http://www.hoxs64.net/)

---

## 🎯 RIEPILOGO VELOCE

### Per VICE (emulatore):
```
1. Scarica VICE
2. Scarica i file dall'app web (opzione 5)
3. Assembla casino.asm → casino.prg
4. In VICE: LOAD "CASINO",8,1 → RUN
```

### Per C64 reale:
```
1. Scrivi casino.prg su floppy/SD
2. Inserisci nel drive
3. LOAD "CASINO",8,1
4. RUN
```

---

## 🚀 PROSSIMI PASSI

1. ✅ Scarica i file dall'app web (menu opzione 5)
2. ✅ Installa VICE o prepara il C64 reale
3. ✅ Assembla casino.asm (se necessario)
4. ✅ Carica e avvia il gioco
5. ✅ Divertiti! 🎮

---

**Buon divertimento con il tuo Commodore 64 Casino!** 🎰

Per domande o problemi, consulta il README.md completo nella cartella c64/.
