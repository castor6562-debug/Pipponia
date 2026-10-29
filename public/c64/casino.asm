; ============================================================
; COMMODORE 64 CASINO - VIDEO POKER & BLACKJACK
; Assembly 6502 - Assemblabile con 64tass o ACME
; ============================================================
; Uso: 64tass -o casino.prg casino.asm
;      acme casino.asm
; ============================================================

; Costanti di sistema
SCREEN      = $0400     ; Schermo
COLOR_RAM   = $D800     ; Colori
BORDER      = $D020     ; Colore bordo
BACKGROUND  = $D021     ; Colore sfondo
SID_FREQ_LO = $D400     ; SID Voice 1 Freq Low
SID_FREQ_HI = $D401     ; SID Voice 1 Freq High
SID_CTRL    = $D404     ; SID Control
SID_AD      = $D405     ; SID Attack/Decay
SID_SR      = $D406     ; SID Sustain/Release
SID_VOLUME  = $D418     ; SID Volume
KEY_REG     = $DC00     ; Tastiera

; Colori C64
COL_BLACK   = 0
COL_WHITE   = 1
COL_RED     = 2
COL_CYAN    = 3
COL_PURPLE  = 4
COL_GREEN   = 5
COL_BLUE    = 6
COL_YELLOW  = 7

; Variabili zero page
TEMP        = $FB
TEMP2       = $FC
CARD_COUNT  = $FD
DECK_PTR    = $FE
HAND_PTR    = $0200     ; Mano del giocatore (5 byte)
DEALER_PTR  = $0210     ; Mano del dealer
DECK        = $0300     ; Mazzo (52 byte)
SCORE_HI    = $0220     ; Punteggio alto
SCORE_LO    = $0221     ; Punteggio basso
CAPITAL_HI  = $0222     ; Capitale alto
CAPITAL_LO  = $0223     ; Capitale basso
BET_AMOUNT  = $0224     ; Puntata
DIFFICULTY  = $0225     ; 0=facile, 1=medio, 2=difficile
GAME_MODE   = $0226     ; 0=poker, 1=blackjack
RAND_SEED   = $0227     ; Seed random

; ============================================================
; INIZIO PROGRAMMA
; ============================================================
*=$0801
        ; BASIC stub per auto-esecuzione
        .word (+), 2003
        .byte $9E, "2061"  ; SYS 2061
        .byte 0
+       .word 0

*=$080D
START:
        ; Inizializza schermo
        LDA #COL_BLUE
        STA BORDER
        STA BACKGROUND
        
        ; Clear screen
        LDA #$20         ; Spazio
        LDX #$00
@clear: STA SCREEN,X
        STA SCREEN+$100,X
        STA SCREEN+$200,X
        STA SCREEN+$300,X
        DEX
        BNE @clear
        
        ; Colora schermo
        LDA #COL_CYAN
        LDX #$00
@color: STA COLOR_RAM,X
        STA COLOR_RAM+$100,X
        STA COLOR_RAM+$200,X
        STA COLOR_RAM+$300,X
        DEX
        BNE @color
        
        ; Inizializza SID
        LDA #$00
        STA SID_CTRL
        LDA #$09
        STA SID_AD
        LDA #$99
        STA SID_SR
        LDA #$0F
        STA SID_VOLUME
        
        ; Inizializza variabili
        LDA #$E8         ; 1000
        STA CAPITAL_LO
        LDA #$03
        STA CAPITAL_HI
        LDA #$0A         ; Puntata 10
        STA BET_AMOUNT
        LDA #$01         ; Difficoltà media
        STA DIFFICULTY
        
        JMP MENU

; ============================================================
; MENU PRINCIPALE
; ============================================================
MENU:
        JSR CLEAR_SCREEN
        JSR DRAW_TITLE
        
        ; Mostra opzioni
        LDX #$00
@menu_loop:
        LDA MENU_TEXT,X
        BEQ @wait_key
        JSR PLOT_CHAR
        INX
        BNE @menu_loop
        
@wait_key:
        ; Attiendi tasto
        LDA KEY_REG
        CMP #$FF
        BEQ @wait_key
        
        ; Controlla quale tasto
        CMP #$31         ; '1'
        BEQ @start_poker
        CMP #$32         ; '2'
        BEQ @start_blackjack
        CMP #$33         ; '3'
        BEQ @settings
        CMP #$34         ; '4'
        BEQ @exit
        
        JMP @wait_key
        
@start_poker:
        LDA #$00
        STA GAME_MODE
        JSR PLAY_MENU_SND
        JMP POKER_INIT
        
@start_blackjack:
        LDA #$01
        STA GAME_MODE
        JSR PLAY_MENU_SND
        JMP BJ_INIT
        
@settings:
        JSR PLAY_MENU_SND
        JMP SETTINGS
        
@exit:
        RTS

; ============================================================
; VIDEO POKER - INIZIALIZZAZIONE
; ============================================================
POKER_INIT:
        JSR CLEAR_SCREEN
        JSR DRAW_POKER_HEADER
        
        ; Inizializza mazzo
        JSR INIT_DECK
        
        ; Distribuisci 5 carte
        JSR DEAL_POKER_HAND
        
        ; Mostra mano
        JSR DRAW_POKER_HAND
        
        ; Attendi input per tenere/cambiare
        JMP POKER_HOLD_PHASE

; ============================================================
; VIDEO POKER - FASE HOLD
; ============================================================
POKER_HOLD_PHASE:
        ; Mostra istruzioni
        LDX #$00
@hold_text:
        LDA HOLD_MSG,X
        BEQ @hold_wait
        JSR PLOT_CHAR
        INX
        BNE @hold_text
        
@hold_wait:
        ; Attendi tasto 1-5 per tenere, ENTER per cambiare
        LDA KEY_REG
        CMP #$FF
        BEQ @hold_wait
        
        ; Controlla tasti 1-5
        CMP #$31
        BCC @check_enter
        CMP #$36
        BCS @check_enter
        
        ; Tieni carta (1-5)
        SEC
        SBC #$31         ; Converti in 0-4
        TAX
        LDA HAND_PTR,X
        EOR #$80         ; Toggle hold flag
        STA HAND_PTR,X
        JSR PLAY_CHIP_SND
        JMP POKER_HOLD_PHASE
        
@check_enter:
        CMP #$0D         ; ENTER
        BNE @hold_wait
        
        ; Cambia carte non tenute
        JSR DRAW_POKER_CARDS
        
        ; Valuta mano
        JSR EVALUATE_POKER
        
        ; Mostra risultato
        JSR SHOW_POKER_RESULT
        
        ; Attendi per nuova mano
        JMP POKER_NEW_HAND

; ============================================================
; VIDEO POKER - NUOVA MANO
; ============================================================
POKER_NEW_HAND:
        ; Attendi tasto
        LDA KEY_REG
        CMP #$FF
        BEQ POKER_NEW_HAND
        
        CMP #$0D         ; ENTER = nuova mano
        BEQ POKER_INIT
        
        CMP #$1B         ; ESC = menu
        BEQ MENU
        
        JMP POKER_NEW_HAND

; ============================================================
; BLACKJACK - INIZIALIZZAZIONE
; ============================================================
BJ_INIT:
        JSR CLEAR_SCREEN
        JSR DRAW_BJ_HEADER
        
        ; Inizializza mazzo
        JSR INIT_DECK
        
        ; Distribuisci 2 carte a giocatore e dealer
        JSR DEAL_BJ_INITIAL
        
        ; Mostra mani
        JSR DRAW_BJ_HANDS
        
        ; Controlla blackjack
        JSR CHECK_BJ_PLAYER
        BEQ @player_bj
        
        JMP BJ_PLAYER_TURN
        
@player_bj:
        ; Blackjack!
        JSR PLAY_WIN_SND
        ; Paga 3:2
        LDA BET_AMOUNT
        CLC
        ADC CAPITAL_LO
        STA CAPITAL_LO
        LDA #$00
        ADC CAPITAL_HI
        STA CAPITAL_HI
        
        LDA BET_AMOUNT
        LSR              ; /2
        CLC
        ADC CAPITAL_LO
        STA CAPITAL_LO
        LDA #$00
        ADC CAPITAL_HI
        STA CAPITAL_HI
        
        JMP BJ_SHOW_RESULT

; ============================================================
; BLACKJACK - TURNO GIOCATORE
; ============================================================
BJ_PLAYER_TURN:
        ; Mostra HIT/STAND
        LDX #$00
@bj_prompt:
        LDA BJ_PROMPT,X
        BEQ @bj_wait
        JSR PLOT_CHAR
        INX
        BNE @bj_prompt
        
@bj_wait:
        LDA KEY_REG
        CMP #$FF
        BEQ @bj_wait
        
        CMP #$48         ; 'H' = Hit
        BEQ @bj_hit
        CMP #$53         ; 'S' = Stand
        BEQ @bj_stand
        
        JMP @bj_wait
        
@bj_hit:
        ; Pesca una carta
        JSR DEAL_BJ_HIT
        
        ; Controlla sbanco
        JSR CALC_BJ_PLAYER_VALUE
        CMP #$16         ; > 21?
        BCS @bj_bust
        
        ; Mostra mano aggiornata
        JSR DRAW_BJ_HANDS
        JMP BJ_PLAYER_TURN
        
@bj_bust:
        ; Sbanco!
        JSR PLAY_LOSE_SND
        JSR DRAW_BJ_HANDS
        JMP BJ_SHOW_RESULT
        
@bj_stand:
        ; Turno del dealer
        JSR DRAW_BJ_HANDS
        JMP BJ_DEALER_TURN

; ============================================================
; BLACKJACK - TURNO DEALER
; ============================================================
BJ_DEALER_TURN:
        ; Dealer pesca fino a 17
        JSR CALC_BJ_DEALER_VALUE
        
        ; Controlla difficoltà
        LDA DIFFICULTY
        CMP #$00
        BEQ @easy_dealer
        CMP #$01
        BEQ @medium_dealer
        
@hard_dealer:
        ; Difficile: sta a 17
        CMP #$11         ; 17
        BCS @dealer_done
        JMP @dealer_hit
        
@medium_dealer:
        ; Medio: sta a 17
        CMP #$11
        BCS @dealer_done
        JMP @dealer_hit
        
@easy_dealer:
        ; Facile: sta a 16
        CMP #$10
        BCS @dealer_done
        JMP @dealer_hit
        
@dealer_hit:
        JSR DEAL_BJ_DEALER_HIT
        JSR DRAW_BJ_HANDS
        
        ; Delay
        LDX #$FF
@delay1:
        LDY #$FF
@delay2:
        DEY
        BNE @delay2
        DEX
        BNE @delay1
        
        JMP BJ_DEALER_TURN
        
@dealer_done:
        ; Confronta mani
        JSR CALC_BJ_PLAYER_VALUE
        STA TEMP
        JSR CALC_BJ_DEALER_VALUE
        
        CMP TEMP         ; Dealer vs Player
        BCC @player_wins
        BEQ @push
        JMP @dealer_wins
        
@player_wins:
        ; Giocatore vince
        JSR PLAY_WIN_SND
        LDA BET_AMOUNT
        ASL              ; x2
        CLC
        ADC CAPITAL_LO
        STA CAPITAL_LO
        LDA #$00
        ADC CAPITAL_HI
        STA CAPITAL_HI
        JMP BJ_SHOW_RESULT
        
@push:
        ; Pareggio
        LDA BET_AMOUNT
        CLC
        ADC CAPITAL_LO
        STA CAPITAL_LO
        LDA #$00
        ADC CAPITAL_HI
        STA CAPITAL_HI
        JMP BJ_SHOW_RESULT
        
@dealer_wins:
        ; Dealer vince
        JSR PLAY_LOSE_SND
        JMP BJ_SHOW_RESULT

; ============================================================
; BLACKJACK - MOSTRA RISULTATO
; ============================================================
BJ_SHOW_RESULT:
        ; Mostra risultato
        JSR DRAW_BJ_RESULT
        
        ; Attendi tasto
@bj_new_wait:
        LDA KEY_REG
        CMP #$FF
        BEQ @bj_new_wait
        
        CMP #$0D         ; ENTER = nuova mano
        BEQ BJ_INIT
        
        CMP #$1B         ; ESC = menu
        BEQ MENU
        
        JMP @bj_new_wait

; ============================================================
; IMPOSTAZIONI
; ============================================================
SETTINGS:
        JSR CLEAR_SCREEN
        JSR DRAW_SETTINGS
        
        ; Modifica impostazioni con tasti
@settings_loop:
        LDA KEY_REG
        CMP #$FF
        BEQ @settings_loop
        
        CMP #$31         ; '1' = capitale
        BEQ @set_capital
        CMP #$32         ; '2' = puntata min
        BEQ @set_min_bet
        CMP #$33         ; '3' = puntata max
        BEQ @set_max_bet
        CMP #$34         ; '4' = difficoltà
        BEQ @set_diff
        CMP #$1B         ; ESC = menu
        BEQ MENU
        
        JMP @settings_loop
        
@set_capital:
        ; Aumenta capitale di 100
        LDA CAPITAL_LO
        CLC
        ADC #$64         ; +100
        STA CAPITAL_LO
        LDA CAPITAL_HI
        ADC #$00
        STA CAPITAL_HI
        JSR PLAY_CHIP_SND
        JMP SETTINGS
        
@set_min_bet:
        LDA BET_AMOUNT
        CMP #$05
        BEQ @settings_loop
        SEC
        SBC #$05
        STA BET_AMOUNT
        JSR PLAY_CHIP_SND
        JMP SETTINGS
        
@set_max_bet:
        LDA BET_AMOUNT
        CLC
        ADC #$05
        STA BET_AMOUNT
        JSR PLAY_CHIP_SND
        JMP SETTINGS
        
@set_diff:
        LDA DIFFICULTY
        CLC
        ADC #$01
        CMP #$03
        BNE @set_diff_ok
        LDA #$00
@set_diff_ok:
        STA DIFFICULTY
        JSR PLAY_CHIP_SND
        JMP SETTINGS

; ============================================================
; INIZIALIZZA MAZZO
; ============================================================
INIT_DECK:
        ; Crea 52 carte
        LDX #$00
@deck_loop:
        TXA
        STA DECK,X
        INX
        CPX #$34         ; 52
        BNE @deck_loop
        
        ; Mescola (Fisher-Yates)
        LDX #$33
@shuffle:
        TXA
        JSR RANDOM
        TAY
        
        ; Swap
        LDA DECK,X
        PHA
        LDA DECK,Y
        STA DECK,X
        PLA
        STA DECK,Y
        
        DEX
        BNE @shuffle
        
        RTS

; ============================================================
; GENERATORE RANDOM
; ============================================================
RANDOM:
        STA TEMP
        LDA RAND_SEED
        LSR
        BCC @no_xor
        EOR #$B4
@no_xor:
        STA RAND_SEED
        AND TEMP
        STA TEMP
        LDA RAND_SEED
        AND #$7F
        RTS

; ============================================================
; DISTRIBUISCI MANO POKER
; ============================================================
DEAL_POKER_HAND:
        LDX #$00
@deal_loop:
        LDA DECK,X
        STA HAND_PTR,X
        INX
        CPX #$05
        BNE @deal_loop
        
        ; Rimuovi carte dal mazzo
        LDX #$05
@shift:
        LDA DECK+5,X
        STA DECK,X
        INX
        CPX #$2F
        BNE @shift
        
        JSR PLAY_DEAL_SND
        RTS

; ============================================================
; VALUTA MANO POKER
; ============================================================
EVALUATE_POKER:
        ; Controlla colore
        JSR CHECK_FLUSH
        BCS @is_flush
        CLC
@is_flush:
        
        ; Controlla scala
        JSR CHECK_STRAIGHT
        BCS @is_straight
        CLC
@is_straight:
        
        ; Conta coppie/tris/poker
        JSR COUNT_RANKS
        
        ; Determina mano
        ; ... (logica di valutazione)
        
        RTS

; ============================================================
; CALCOLA VALORE BLACKJACK
; ============================================================
CALC_BJ_PLAYER_VALUE:
        LDA #$00
        STA TEMP         ; Totale
        STA TEMP2        ; Contatore assi
        LDX #$00
        
@calc_loop:
        CPX CARD_COUNT
        BEQ @calc_done
        
        LDA HAND_PTR,X
        AND #$0C         ; Rank
        LSR
        LSR
        
        CMP #$0B         ; Asso?
        BEQ @is_ace
        CMP #$0A         ; Figura?
        BCS @is_ten
        
        ; Carta numerica
        CLC
        ADC TEMP
        STA TEMP
        JMP @next_card
        
@is_ace:
        INC TEMP2
        LDA #$0B         ; +11
        CLC
        ADC TEMP
        STA TEMP
        JMP @next_card
        
@is_ten:
        LDA #$0A         ; +10
        CLC
        ADC TEMP
        STA TEMP
        
@next_card:
        INX
        JMP @calc_loop
        
@calc_done:
        ; Converti assi se > 21
        LDA TEMP
        CMP #$16
        BCC @calc_return
        
        LDA TEMP2
        BEQ @calc_return
        
        SEC
        SBC #$0A
        STA TEMP2
        LDA TEMP
        SEC
        SBC #$0A
        STA TEMP
        
        JMP @calc_done
        
@calc_return:
        LDA TEMP
        RTS

CALC_BJ_DEALER_VALUE:
        ; Simile a CALC_BJ_PLAYER_VALUE ma per DEALER_PTR
        LDA #$00
        STA TEMP
        STA TEMP2
        LDX #$00
        
@calc_d_loop:
        CPX CARD_COUNT
        BEQ @calc_d_done
        
        LDA DEALER_PTR,X
        AND #$0C
        LSR
        LSR
        
        CMP #$0B
        BEQ @d_is_ace
        CMP #$0A
        BCS @d_is_ten
        
        CLC
        ADC TEMP
        STA TEMP
        JMP @d_next
        
@d_is_ace:
        INC TEMP2
        LDA #$0B
        CLC
        ADC TEMP
        STA TEMP
        JMP @d_next
        
@d_is_ten:
        LDA #$0A
        CLC
        ADC TEMP
        STA TEMP
        
@d_next:
        INX
        JMP @calc_d_loop
        
@calc_d_done:
        LDA TEMP
        CMP #$16
        BCC @calc_d_return
        
        LDA TEMP2
        BEQ @calc_d_return
        
        SEC
        SBC #$0A
        STA TEMP2
        LDA TEMP
        SEC
        SBC #$0A
        STA TEMP
        
        JMP @calc_d_done
        
@calc_d_return:
        LDA TEMP
        RTS

; ============================================================
; EFFETTI SONORI SID
; ============================================================
PLAY_DEAL_SND:
        LDA #$81
        STA SID_CTRL
        LDA #$44
        STA SID_FREQ_LO
        LDA #$01
        STA SID_FREQ_HI
        
        LDX #$10
@d1:    LDY #$FF
@d2:    DEY
        BNE @d2
        DEX
        BNE @d1
        
        LDA #$00
        STA SID_CTRL
        RTS

PLAY_WIN_SND:
        LDX #$00
@win_loop:
        LDA WIN_FREQ_LO,X
        STA SID_FREQ_LO
        LDA WIN_FREQ_HI,X
        STA SID_FREQ_HI
        LDA #$81
        STA SID_CTRL
        
        JSR SHORT_DELAY
        
        INX
        CPX #$04
        BNE @win_loop
        
        LDA #$00
        STA SID_CTRL
        RTS

PLAY_LOSE_SND:
        LDA #$91
        STA SID_CTRL
        LDA #$88
        STA SID_FREQ_LO
        LDA #$01
        STA SID_FREQ_HI
        
        LDX #$20
@descend:
        LDA SID_FREQ_LO
        SEC
        SBC #$04
        STA SID_FREQ_LO
        LDA SID_FREQ_HI
        SBC #$00
        STA SID_FREQ_HI
        
        JSR SHORT_DELAY
        DEX
        BNE @descend
        
        LDA #$00
        STA SID_CTRL
        RTS

PLAY_MENU_SND:
        LDA #$81
        STA SID_CTRL
        LDA #$69
        STA SID_FREQ_LO
        LDA #$02
        STA SID_FREQ_HI
        
        JSR SHORT_DELAY
        
        LDA #$00
        STA SID_CTRL
        RTS

PLAY_CHIP_SND:
        LDA #$81
        STA SID_CTRL
        LDA #$22
        STA SID_FREQ_LO
        LDA #$01
        STA SID_FREQ_HI
        
        JSR SHORT_DELAY
        
        LDA #$00
        STA SID_CTRL
        RTS

SHORT_DELAY:
        LDX #$08
@sd1:   LDY #$FF
@sd2:   DEY
        BNE @sd2
        DEX
        BNE @sd1
        RTS

WIN_FREQ_LO:
        .byte $11,$69,$98,$11
WIN_FREQ_HI:
        .byte $01,$02,$02,$04

; ============================================================
; ROUTINE SCHERMO
; ============================================================
CLEAR_SCREEN:
        LDA #$20
        LDX #$00
@cls:   STA SCREEN,X
        STA SCREEN+$100,X
        STA SCREEN+$200,X
        STA SCREEN+$300,X
        DEX
        BNE @cls
        RTS

PLOT_CHAR:
        ; Plot carattere in posizione corrente
        ; (implementazione semplificata)
        RTS

DRAW_TITLE:
        ; Disegna titolo
        RTS

DRAW_POKER_HEADER:
        RTS

DRAW_BJ_HEADER:
        RTS

DRAW_SETTINGS:
        RTS

DRAW_POKER_HAND:
        RTS

DRAW_POKER_CARDS:
        RTS

SHOW_POKER_RESULT:
        RTS

DRAW_BJ_HANDS:
        RTS

DRAW_BJ_RESULT:
        RTS

DEAL_BJ_INITIAL:
        RTS

DEAL_BJ_HIT:
        RTS

DEAL_BJ_DEALER_HIT:
        RTS

CHECK_BJ_PLAYER:
        RTS

CHECK_FLUSH:
        RTS

CHECK_STRAIGHT:
        RTS

COUNT_RANKS:
        RTS

; ============================================================
; DATI TESTO
; ============================================================
MENU_TEXT:
        .byte "1-VIDEO POKER",13
        .byte "2-BLACKJACK",13
        .byte "3-IMPOSTAZIONI",13
        .byte "4-ESCI",13,0

HOLD_MSG:
        .byte "PREMI 1-5 PER TENERE, ENTER PER CAMBIARE",0

BJ_PROMPT:
        .byte "H=HIT S=STAND",0

; ============================================================
; FINE PROGRAMMA
; ============================================================
        .byte 0
