# 📋 GUIDA ALLA COMPILAZIONE - COMMODORE 64 CASINO

## ❌ ERRORE RISOLTO

L'errore "illegal instruction alla riga 52" era causato dalla sintassi `*=$0801` che non è compatibile con tutti gli assembler.

## ✅ SOLUZIONE: USA IL FILE CORRETTO PER IL TUO ASSEMBLER

### 🎯 Opzione 1: 64tass (CONSIGLIATO)

**Installa 64tass:**
- Windows: https://tass64.sourceforge.io/
- Linux: `sudo apt install 64tass`
- macOS: `brew install 64tass`

**Compila:**
```bash
64tass -o casino.prg casino_64tass.asm
```

**Carica in VICE:**
```basic
LOAD "CASINO",8,1
RUN
```

---

### 🎯 Opzione 2: ACME

**Installa ACME:**
- Linux: `sudo apt install acme`
- macOS: `brew install acme`

**Compila:**
```bash
acme casino_64tass.asm
```

Il file generato sarà `a.out`, rinominalo in `casino.prg`

---

### 🎯 Opzione 3: CA65 (CC65)

**Installa CC65:**
- Sito: https://cc65.github.io/
- Linux: `sudo apt install cc65`

**Compila:**
```bash
ca65 casino_ca65.asm -o casino.o
ld65 -t c64 -o casino.prg casino.o c64.lib
```

---

## 📁 FILE DISPONIBILI

### Per 64tass / ACME:
- **casino_64tass.asm** ← USA QUESTO per 64tass o ACME

### Per CA65 (CC65):
- **casino_ca65.asm** ← USA QUESTO per CA65

### Loader BASIC (alternativo):
- **casino_loader.bas** ← Carica direttamente in BASIC

---

## 🚀 METODO PIÙ SEMPLICE (SENZA ASSEMBLER)

Se non vuoi installare un assembler, usa il loader BASIC:

1. Apri VICE
2. Digita il codice BASIC manualmente:

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

3. Salva con: `SAVE "CASINO",8`
4. Carica con: `LOAD "CASINO",8` poi `RUN`

**Nota:** Questo metodo richiede che il codice macchina sia già in memoria all'indirizzo $C000 (49152).

---

## 🎮 COME USARE IL GIOCO

### Video Poker:
- **1-5**: Tieni/scarta carta
- **ENTER**: Cambia carte
- **ESC**: Menu

### Blackjack:
- **H**: Hit (pesca)
- **S**: Stand (stai)
- **ENTER**: Nuova mano
- **ESC**: Menu

---

## 🐛 TROUBLESHOOTING

### Errore "illegal instruction"
- ✅ Usa `casino_64tass.asm` con 64tass
- ✅ Usa `casino_ca65.asm` con CA65
- ❌ NON usare `casino.asm` (versione vecchia)

### Errore "file not found"
- Verifica che il file `.prg` sia nella directory corretta
- In VICE: File → Smart attach disk/tape

### Il gioco non parte
- Verifica che il BASIC stub sia corretto
- Prova: `SYS 2061` (indirizzo di partenza)

---

## 📚 RISORSE

- **64tass**: https://tass64.sourceforge.io/
- **ACME**: https://sourceforge.net/projects/acme-crossass/
- **CC65**: https://cc65.github.io/
- **VICE**: https://sourceforge.net/projects/vice-emu/

---

## ✅ RIEPILOGO VELOCE

**Per 64tass (consigliato):**
```bash
64tass -o casino.prg casino_64tass.asm
```

**Per CA65:**
```bash
ca65 casino_ca65.asm -o casino.o
ld65 -t c64 -o casino.prg casino.o c64.lib
```

**In VICE:**
```basic
LOAD "CASINO",8,1
RUN
```

---

**Il gioco ora dovrebbe compilare senza errori!** 🎰
