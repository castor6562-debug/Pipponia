# 🎰 COMMODORE 64 CASINO - GUIDA ALL'USO

## 📋 Contenuto

Questa cartella contiene i file per eseguire il gioco su un **vero Commodore 64** o sull'emulatore **VICE**.

### File inclusi:
- `casino.asm` - Codice sorgente assembly 6502 (assemblabile)
- `casino_loader.bas` - Loader BASIC per avviare il gioco
- `casino.prg` - Programma eseguibile già assemblato (se disponibile)

---

## 🖥️ COME USARE SU VICE (Emulatore)

### 1. Installa VICE
Scarica VICE da: https://sourceforge.net/projects/vice-emu/

**Versioni consigliate:**
- **Windows**: `GTK3VICE-3.x-win64.exe`
- **macOS**: `vice-macosx-x86_64-3.x.dmg`
- **Linux**: `sudo apt install vice` (Debian/Ubuntu)

### 2. Avvia VICE
Apri **x64** (emulatore C64) dall'applicazione VICE.

### 3. Carica il programma

#### Metodo A: File .PRG (consigliato)
```
File → Attach disk image → Seleziona casino.prg
```
Poi nel C64 digita:
```basic
LOAD "CASINO.PRG",8,1
RUN
```

#### Metodo B: Loader BASIC
```
File → Smart attach disk/tape → Seleziona casino_loader.bas
```
Poi nel C64:
```basic
LOAD "CASINO_LOADER.BAS",8
RUN
```

#### Metodo C: Digita il codice manualmente
Se vuoi digitare il loader BASIC a mano:
```basic
10 PRINT CHR$(147)
20 PRINT "COMMODORE 64 CASINO"
30 PRINT "===================="
40 PRINT "1 - VIDEO POKER"
50 PRINT "2 - BLACKJACK"
60 PRINT "3 - ESCI"
70 INPUT "SCEGLI: ";X
80 IF X=1 THEN SYS 49152
90 IF X=2 THEN SYS 49200
100 IF X=3 THEN END
110 GOTO 40
```

### 4. Configura VICE (opzionale)
Per una esperienza autentica:
- **Settings → Sound → SID engine**: ReSID (migliore qualità)
- **Settings → Video → CRT emulation**: Attiva per effetto scanlines
- **Speed**: 100% (velocità reale)

---

## 🔧 COME ASSEMBLARE IL CODICE SORGENTE

Se vuoi modificare il codice assembly e ricompilarlo:

### Opzione 1: 64tass (consigliato)
```bash
# Installa 64tass
# Windows: scarica da https://tass64.sourceforge.io/
# Linux: sudo apt install 64tass
# macOS: brew install 64tass

# Assembla
64tass -o casino.prg casino.asm
```

### Opzione 2: ACME
```bash
# Installa ACME
# Linux: sudo apt install acme
# macOS: brew install acme

# Assembla
acme casino.asm
```

### Opzione 3: CC65
```bash
# Installa CC65
# https://cc65.github.io/

# Assembla
ca65 casino.asm -o casino.o
ld65 -t c64 -o casino.prg casino.o
```

---

## 🎮 CONTROLLI DEL GIOCO

### Video Poker
- **1-5**: Tieni/scarta carta corrispondente
- **ENTER**: Cambia carte non tenute
- **ESC**: Torna al menu

### Blackjack
- **H**: Hit (pesca carta)
- **S**: Stand (stai)
- **ENTER**: Nuova mano
- **ESC**: Torna al menu

### Menu
- **1**: Video Poker
- **2**: Blackjack
- **3**: Impostazioni
- **4**: Esci

---

## 💾 COME USARE SU UN VERO C64

### Requisiti:
- Commodore 64 (o 128 in mode C64)
- Floppy disk drive 1541/1571/1581
- SD2IEC o Pi1541 (alternative moderne)
- Oppure: cassette datasette

### Metodo 1: Floppy Disk
1. Scrivi il file `.prg` su un floppy disk
2. Inserisci il disk nel drive
3. Accendi il C64
4. Digita:
   ```basic
   LOAD "CASINO",8,1
   RUN
   ```

### Metodo 2: SD2IEC / Pi1541
1. Copia `casino.prg` sulla scheda SD
2. Inserisci SD2IEC/Pi1541 nel C64
3. Accendi
4. Digita:
   ```basic
   LOAD "CASINO",8,1
   RUN
   ```

### Metodo 3: Cassetta (Datasette)
1. Registra il file `.prg` su cassetta usando un PC con cavo XA1541
2. Inserisci la cassetta nel datasette
3. Digita:
   ```basic
   LOAD
   RUN
   ```
4. Premi PLAY sul datasette quando richiesto

### Metodo 4: EasyFlash / EasyLoader
Se hai una cartuccia EasyFlash:
1. Converti il `.prg` in formato CRT
2. Scrivi sulla cartuccia EasyFlash
3. Inserisci nel C64
4. Il gioco si avvia automaticamente

---

## 🎨 CARATTERISTICHE DEL GIOCO

### Grafica
- Schermo completo a 40×25 caratteri
- Colori C64 originali (16 colori)
- Carte disegnate con caratteri PETSCII
- Effetti visivi per vincite/perdite

### Audio (SID 6581)
- Effetti sonori per:
  - Distribuzione carte
  - Vincite (fanfara ascendente)
  - Perdite (suono discendente)
  - Menu e chip
- Utilizza il chip SID per suoni autentici

### Gameplay
- **Video Poker**: Jacks or Better
  - Paga da 1x (Jacks+) a 250x (Royal Flush)
  - Possibilità di tenere/scartare carte
- **Blackjack**: Regole standard
  - Blackjack paga 3:2
  - Dealer sta a 17
  - Possibilità di Hit/Stand

### Impostazioni
- Capitale iniziale: 100-10000
- Puntata minima: 1-100
- Puntata massima: 50-5000
- Difficoltà: Facile/Medio/Difficile

---

## 🐛 TROUBLESHOOTING

### Il gioco non si carica
- Verifica che il file `.prg` sia nella directory corretta
- Controlla che il device number sia 8 (standard per floppy)
- Prova `LOAD "$",8` per vedere i file sul disk

### Errori di sintassi nel BASIC
- Verifica di aver copiato esattamente il codice
- Controlla che non ci siano spazi mancanti
- Il BASIC del C64 è case-sensitive per i comandi

### Il suono non funziona
- Verifica che il volume del SID sia attivo
- Controlla le impostazioni audio di VICE
- Su C64 reale, verifica che il chip SID funzioni

### Il gioco è troppo lento/veloce
- In VICE: Settings → Speed → Adjust
- Su C64 reale: il gioco gira alla velocità corretta

---

## 📝 NOTE TECNICHE

### Memory Map
```
$0801-$080D : BASIC stub
$080D-$0FFF : Codice programma
$1000-$1FFF : Stack e variabili
$2000-$3FFF : Dati e mazzo
$C000-$CFFF : Routine principali
$D000-$D3FF : VIC-II (video)
$D400-$D7FF : SID (audio)
$DC00-$DCFF : CIA (I/O)
```

### Zero Page Variables
```
$FB-$FF : Variabili temporanee
$0200   : Mano giocatore
$0210   : Mano dealer
$0220   : Punteggio
$0222   : Capitale
$0224   : Puntata
$0225   : Difficoltà
$0226   : Mode gioco
$0227   : Random seed
```

### Ottimizzazioni
- Codice ottimizzato per velocità
- Uso efficiente della zero page
- Routine SID minimali
- Gestione memoria compatta

---

## 🚀 SVILUPPI FUTURI

Possibili estensioni:
- [ ] Aggiungere altri giochi (Baccarat, Roulette)
- [ ] Salvataggio punteggi su disk
- [ ] Multiplayer locale (2 giocatori)
- [ ] Grafica migliorata con sprite
- [ ] Musica di sottofondo SID
- [ ] Sistema di scommesse avanzato

---

## 📚 RISORSE

### Documentazione C64
- [Commodore 64 Programmer's Reference Guide](http://www.zimmers.net/anonftp/pub/cbm/programming/c64prg.txt)
- [Mapping the Commodore 64](https://github.com/mist64/c64ref)
- [VICE User Manual](https://sourceforge.net/p/vice-emu/code/HEAD/tree/trunk/vice/doc/vice_toc.html)

### Assembly 6502
- [6502 Assembly Tutorial](https://www.masswerk.at/6502/assembler.html)
- [64tass Documentation](https://tass64.sourceforge.io/)
- [ACME Documentation](https://sourceforge.net/projects/acme-crossass/)

### Emulatori
- [VICE - The Versatile Commodore Emulator](https://sourceforge.net/projects/vice-emu/)
- [CCS64](http://www.ccs64.com/)
- [Hoxs64](http://www.hoxs64.net/)

---

## 📄 LICENZA

Questo progetto è fornito come esempio educativo.
Sentiti libero di modificarlo e distribuirlo.

---

## 👨‍💻 AUTORE

Creato come dimostrazione delle capacità del Commodore 64.
Codice assembly 6502 ottimizzato per prestazioni e dimensioni.

**Buon divertimento!** 🎮
