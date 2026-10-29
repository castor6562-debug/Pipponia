# 🎰 COMMODORE 64 CASINO - VIDEO POKER & BLACKJACK

## 📋 Contenuto

Questa cartella contiene i file per eseguire il gioco su un **vero Commodore 64** o sull'emulatore **VICE**.

### File disponibili:
- **casino_64tass.asm** - Codice sorgente per 64tass e ACME ✅
- **casino_ca65.asm** - Codice sorgente per CA65 (CC65) ✅
- **casino_loader.bas** - Loader BASIC per avviare il gioco
- **COMPILAZIONE.md** - Guida alla compilazione dettagliata
- **README.md** - Questo file

---

## 🚀 AVVIO RAPIDO

### Per 64tass (CONSIGLIATO):
```bash
# Installa 64tass
# Linux: sudo apt install 64tass
# macOS: brew install 64tass
# Windows: https://tass64.sourceforge.io/

# Compila
64tass -o casino.prg casino_64tass.asm

# Carica in VICE
LOAD "CASINO",8,1
RUN
```

### Per CA65 (CC65):
```bash
# Installa CC65 da https://cc65.github.io/

# Compila
ca65 casino_ca65.asm -o casino.o
ld65 -t c64 -o casino.prg casino.o c64.lib

# Carica in VICE
LOAD "CASINO",8,1
RUN
```

---

## 🖥️ COME USARE SU VICE (Emulatore)

### 1. Installa VICE
Scarica VICE da: https://sourceforge.net/projects/vice-emu/

### 2. Compila il codice
Usa uno dei comandi sopra per generare `casino.prg`

### 3. Carica il programma in VICE
```
File → Attach disk image → Seleziona casino.prg
```
Poi nel C64 digita:
```basic
LOAD "CASINO",8,1
RUN
```

### 4. Configura VICE (opzionale)
- **Settings → Sound → SID engine**: ReSID
- **Settings → Video → CRT emulation**: Attiva
- **Speed**: 100%

---

## 💾 COME USARE SU UN VERO C64

### Requisiti:
- Commodore 64 (o 128 in mode C64)
- Floppy disk drive 1541/1571/1581
- **OPPURE** SD2IEC / Pi1541
- **OPPURE** Datasette

### Procedura:
1. Scrivi `casino.prg` su floppy/SD/cassetta
2. Inserisci nel drive
3. Accendi il C64
4. Digita:
   ```basic
   LOAD "CASINO",8,1
   RUN
   ```

---

## 🎮 CONTROLLI DEL GIOCO

### Menu Principale
- **1** - Video Poker
- **2** - Blackjack
- **3** - Impostazioni
- **4** - Esci

### Video Poker
- **1-5**: Tieni/scarta carta
- **ENTER**: Cambia carte non tenute
- **ESC**: Torna al menu

### Blackjack
- **H**: Hit (pesca carta)
- **S**: Stand (stai)
- **ENTER**: Nuova mano
- **ESC**: Torna al menu

---

## 🎨 CARATTERISTICHE

### Grafica
- Schermo completo 40×25 caratteri
- Colori C64 originali (16 colori)
- Carte disegnate con caratteri PETSCII

### Audio (SID 6581)
- Effetti sonori per distribuzione carte
- Fanfara per vincite
- Suono discendente per perdite
- Suoni menu e chip

### Gameplay
- **Video Poker**: Jacks or Better
  - Paga da 1x (Jacks+) a 250x (Royal Flush)
- **Blackjack**: Regole standard
  - Blackjack paga 3:2
  - Dealer sta a 17

### Impostazioni
- Capitale iniziale: 100-10000
- Puntata minima: 1-100
- Puntata massima: 50-5000
- Difficoltà: Facile/Medio/Difficile

---

## 🐛 TROUBLESHOOTING

### Errore "illegal instruction"
- ✅ Usa `casino_64tass.asm` con 64tass o ACME
- ✅ Usa `casino_ca65.asm` con CA65
- ❌ NON usare file vecchi

### Il gioco non si carica
- Verifica che il file `.prg` sia nella directory corretta
- Controlla device number (deve essere 8)
- Prova `LOAD "$",8` per vedere i file

### Errori di sintassi nel BASIC
- Copia esattamente il codice
- Il BASIC C64 è case-sensitive

### Il suono non funziona
- Verifica volume SID in VICE
- Settings → Sound → SID engine: ReSID

---

## 📚 RISORSE

### Assembler
- [64tass](https://tass64.sourceforge.io/) - Consigliato
- [ACME](https://sourceforge.net/projects/acme-crossass/)
- [CC65](https://cc65.github.io/)

### Emulatori
- [VICE](https://sourceforge.net/projects/vice-emu/)
- [CCS64](http://www.ccs64.com/)
- [Hoxs64](http://www.hoxs64.net/)

### Documentazione
- [Commodore 64 Programmer's Reference](http://www.zimmers.net/anonftp/pub/cbm/programming/c64prg.txt)
- [VICE User Manual](https://sourceforge.net/p/vice-emu/code/HEAD/tree/trunk/vice/doc/vice_toc.html)

---

## 📝 NOTE TECNICHE

### Memory Map
```
$0801-$080D : BASIC stub
$080D-$0FFF : Codice programma
$1000-$1FFF : Stack e variabili
$2000-$3FFF : Dati e mazzo
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

---

## 📄 LICENZA

Questo progetto è fornito come esempio educativo.
Sentiti libero di modificarlo e distribuirlo.

---

**Buon divertimento!** 🎮

Per problemi di compilazione, consulta `COMPILAZIONE.md`.
