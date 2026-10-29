; ============================================================
; COMMODORE 64 CASINO - Versione per 64tass
; ============================================================
; Uso: 64tass -o casino.prg casino_64tass.asm
; ============================================================

; Costanti di sistema
SCREEN      = $0400
COLOR_RAM   = $D800
BORDER      = $D020
BACKGROUND  = $D021
SID_FREQ_LO = $D400
SID_FREQ_HI = $D401
SID_CTRL    = $D404
SID_AD      = $D405
SID_SR      = $D406
SID_VOLUME  = $D418
KEY_REG     = $DC00

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
HAND_PTR    = $0200
DEALER_PTR  = $0210
DECK        = $0300
CAPITAL_HI  = $0222
CAPITAL_LO  = $0223
BET_AMOUNT  = $0224
DIFFICULTY  = $0225
GAME_MODE   = $0226
RAND_SEED   = $0227

; ============================================================
; BASIC STUB E INIZIO PROGRAMMA
; ============================================================
*=$0801
        .word (+), 2003
        .byte $9E, "2061"
        .byte 0
+       .word 0

*=$080D
start:
        ; Inizializza schermo
        LDA #COL_BLUE
        STA BORDER
        STA BACKGROUND
        
        ; Clear screen
        LDA #$20
        LDX #$00
clear_loop:
        STA SCREEN,X
        STA SCREEN+$100,X
        STA SCREEN+$200,X
        STA SCREEN+$300,X
        DEX
        BNE clear_loop
        
        ; Colora schermo
        LDA #COL_CYAN
        LDX #$00
color_loop:
        STA COLOR_RAM,X
        STA COLOR_RAM+$100,X
        STA COLOR_RAM+$200,X
        STA COLOR_RAM+$300,X
        DEX
        BNE color_loop
        
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
        LDA #$E8
        STA CAPITAL_LO
        LDA #$03
        STA CAPITAL_HI
        LDA #$0A
        STA BET_AMOUNT
        LDA #$01
        STA DIFFICULTY
        
        JMP menu

; ============================================================
; MENU PRINCIPALE
; ============================================================
menu:
        JSR clear_screen
        
        LDX #$00
menu_loop:
        LDA menu_text,X
        BEQ wait_key
        INX
        BNE menu_loop
        
wait_key:
        LDA KEY_REG
        CMP #$FF
        BEQ wait_key
        
        CMP #$31
        BEQ start_poker
        CMP #$32
        BEQ start_blackjack
        CMP #$33
        BEQ settings
        CMP #$34
        BEQ exit_game
        
        JMP wait_key
        
start_poker:
        LDA #$00
        STA GAME_MODE
        JSR play_menu_snd
        JMP poker_init
        
start_blackjack:
        LDA #$01
        STA GAME_MODE
        JSR play_menu_snd
        JMP bj_init
        
settings:
        JSR play_menu_snd
        JMP settings_screen
        
exit_game:
        RTS

; ============================================================
; VIDEO POKER
; ============================================================
poker_init:
        JSR clear_screen
        JSR init_deck
        JSR deal_poker_hand
        JSR draw_poker_hand
        JMP poker_hold_phase

poker_hold_phase:
        LDX #$00
hold_text_loop:
        LDA hold_msg,X
        BEQ hold_wait
        INX
        BNE hold_text_loop
        
hold_wait:
        LDA KEY_REG
        CMP #$FF
        BEQ hold_wait
        
        CMP #$31
        BCC check_enter
        CMP #$36
        BCS check_enter
        
        SEC
        SBC #$31
        TAX
        LDA HAND_PTR,X
        EOR #$80
        STA HAND_PTR,X
        JSR play_chip_snd
        JMP poker_hold_phase
        
check_enter:
        CMP #$0D
        BNE hold_wait
        
        JSR draw_poker_cards
        JSR evaluate_poker
        JSR show_poker_result
        JMP poker_new_hand

poker_new_hand:
        LDA KEY_REG
        CMP #$FF
        BEQ poker_new_hand
        
        CMP #$0D
        BEQ poker_init
        
        CMP #$1B
        BEQ menu
        
        JMP poker_new_hand

; ============================================================
; BLACKJACK
; ============================================================
bj_init:
        JSR clear_screen
        JSR init_deck
        JSR deal_bj_initial
        JSR draw_bj_hands
        JSR check_bj_player
        BEQ player_bj
        JMP bj_player_turn
        
player_bj:
        JSR play_win_snd
        LDA BET_AMOUNT
        CLC
        ADC CAPITAL_LO
        STA CAPITAL_LO
        LDA #$00
        ADC CAPITAL_HI
        STA CAPITAL_HI
        
        LDA BET_AMOUNT
        LSR
        CLC
        ADC CAPITAL_LO
        STA CAPITAL_LO
        LDA #$00
        ADC CAPITAL_HI
        STA CAPITAL_HI
        
        JMP bj_show_result

bj_player_turn:
        LDX #$00
bj_prompt_loop:
        LDA bj_prompt,X
        BEQ bj_wait
        INX
        BNE bj_prompt_loop
        
bj_wait:
        LDA KEY_REG
        CMP #$FF
        BEQ bj_wait
        
        CMP #$48
        BEQ bj_hit
        CMP #$53
        BEQ bj_stand
        
        JMP bj_wait
        
bj_hit:
        JSR deal_bj_hit
        JSR calc_bj_player_value
        CMP #$16
        BCS bj_bust
        
        JSR draw_bj_hands
        JMP bj_player_turn
        
bj_bust:
        JSR play_lose_snd
        JSR draw_bj_hands
        JMP bj_show_result
        
bj_stand:
        JSR draw_bj_hands
        JMP bj_dealer_turn

bj_dealer_turn:
        JSR calc_bj_dealer_value
        
        LDA DIFFICULTY
        CMP #$00
        BEQ easy_dealer
        CMP #$01
        BEQ medium_dealer
        
hard_dealer:
        CMP #$11
        BCS dealer_done
        JMP dealer_hit
        
medium_dealer:
        CMP #$11
        BCS dealer_done
        JMP dealer_hit
        
easy_dealer:
        CMP #$10
        BCS dealer_done
        JMP dealer_hit
        
dealer_hit:
        JSR deal_bj_dealer_hit
        JSR draw_bj_hands
        
        LDX #$FF
delay_loop1:
        LDY #$FF
delay_loop2:
        DEY
        BNE delay_loop2
        DEX
        BNE delay_loop1
        
        JMP bj_dealer_turn
        
dealer_done:
        JSR calc_bj_player_value
        STA TEMP
        JSR calc_bj_dealer_value
        
        CMP TEMP
        BCC player_wins
        BEQ push
        JMP dealer_wins
        
player_wins:
        JSR play_win_snd
        LDA BET_AMOUNT
        ASL
        CLC
        ADC CAPITAL_LO
        STA CAPITAL_LO
        LDA #$00
        ADC CAPITAL_HI
        STA CAPITAL_HI
        JMP bj_show_result
        
push:
        LDA BET_AMOUNT
        CLC
        ADC CAPITAL_LO
        STA CAPITAL_LO
        LDA #$00
        ADC CAPITAL_HI
        STA CAPITAL_HI
        JMP bj_show_result
        
dealer_wins:
        JSR play_lose_snd
        JMP bj_show_result

bj_show_result:
        JSR draw_bj_result
        
bj_new_wait:
        LDA KEY_REG
        CMP #$FF
        BEQ bj_new_wait
        
        CMP #$0D
        BEQ bj_init
        
        CMP #$1B
        BEQ menu
        
        JMP bj_new_wait

; ============================================================
; IMPOSTAZIONI
; ============================================================
settings_screen:
        JSR clear_screen
        
settings_loop:
        LDA KEY_REG
        CMP #$FF
        BEQ settings_loop
        
        CMP #$31
        BEQ set_capital
        CMP #$32
        BEQ set_min_bet
        CMP #$33
        BEQ set_max_bet
        CMP #$34
        BEQ set_diff
        CMP #$1B
        BEQ menu
        
        JMP settings_loop
        
set_capital:
        LDA CAPITAL_LO
        CLC
        ADC #$64
        STA CAPITAL_LO
        LDA CAPITAL_HI
        ADC #$00
        STA CAPITAL_HI
        JSR play_chip_snd
        JMP settings_screen
        
set_min_bet:
        LDA BET_AMOUNT
        CMP #$05
        BEQ settings_loop
        SEC
        SBC #$05
        STA BET_AMOUNT
        JSR play_chip_snd
        JMP settings_screen
        
set_max_bet:
        LDA BET_AMOUNT
        CLC
        ADC #$05
        STA BET_AMOUNT
        JSR play_chip_snd
        JMP settings_screen
        
set_diff:
        LDA DIFFICULTY
        CLC
        ADC #$01
        CMP #$03
        BNE set_diff_ok
        LDA #$00
set_diff_ok:
        STA DIFFICULTY
        JSR play_chip_snd
        JMP settings_screen

; ============================================================
; INIZIALIZZA MAZZO
; ============================================================
init_deck:
        LDX #$00
deck_loop:
        TXA
        STA DECK,X
        INX
        CPX #$34
        BNE deck_loop
        
        LDX #$33
shuffle_loop:
        TXA
        JSR random
        TAY
        
        LDA DECK,X
        PHA
        LDA DECK,Y
        STA DECK,X
        PLA
        STA DECK,Y
        
        DEX
        BNE shuffle_loop
        
        RTS

; ============================================================
; RANDOM
; ============================================================
random:
        STA TEMP
        LDA RAND_SEED
        LSR
        BCC no_xor
        EOR #$B4
no_xor:
        STA RAND_SEED
        AND TEMP
        STA TEMP
        LDA RAND_SEED
        AND #$7F
        RTS

; ============================================================
; DISTRIBUISCI MANO POKER
; ============================================================
deal_poker_hand:
        LDX #$00
deal_loop:
        LDA DECK,X
        STA HAND_PTR,X
        INX
        CPX #$05
        BNE deal_loop
        
        LDX #$05
shift_loop:
        LDA DECK+5,X
        STA DECK,X
        INX
        CPX #$2F
        BNE shift_loop
        
        JSR play_deal_snd
        RTS

; ============================================================
; VALUTA MANO POKER
; ============================================================
evaluate_poker:
        JSR check_flush
        BCS is_flush
        CLC
is_flush:
        
        JSR check_straight
        BCS is_straight
        CLC
is_straight:
        
        JSR count_ranks
        
        RTS

; ============================================================
; CALCOLA VALORE BLACKJACK
; ============================================================
calc_bj_player_value:
        LDA #$00
        STA TEMP
        STA TEMP2
        LDX #$00
        
calc_loop:
        CPX CARD_COUNT
        BEQ calc_done
        
        LDA HAND_PTR,X
        AND #$0C
        LSR
        LSR
        
        CMP #$0B
        BEQ is_ace
        CMP #$0A
        BCS is_ten
        
        CLC
        ADC TEMP
        STA TEMP
        JMP next_card
        
is_ace:
        INC TEMP2
        LDA #$0B
        CLC
        ADC TEMP
        STA TEMP
        JMP next_card
        
is_ten:
        LDA #$0A
        CLC
        ADC TEMP
        STA TEMP
        
next_card:
        INX
        JMP calc_loop
        
calc_done:
        LDA TEMP
        CMP #$16
        BCC calc_return
        
        LDA TEMP2
        BEQ calc_return
        
        SEC
        SBC #$0A
        STA TEMP2
        LDA TEMP
        SEC
        SBC #$0A
        STA TEMP
        
        JMP calc_done
        
calc_return:
        LDA TEMP
        RTS

calc_bj_dealer_value:
        LDA #$00
        STA TEMP
        STA TEMP2
        LDX #$00
        
calc_d_loop:
        CPX CARD_COUNT
        BEQ calc_d_done
        
        LDA DEALER_PTR,X
        AND #$0C
        LSR
        LSR
        
        CMP #$0B
        BEQ d_is_ace
        CMP #$0A
        BCS d_is_ten
        
        CLC
        ADC TEMP
        STA TEMP
        JMP d_next
        
d_is_ace:
        INC TEMP2
        LDA #$0B
        CLC
        ADC TEMP
        STA TEMP
        JMP d_next
        
d_is_ten:
        LDA #$0A
        CLC
        ADC TEMP
        STA TEMP
        
d_next:
        INX
        JMP calc_d_loop
        
calc_d_done:
        LDA TEMP
        CMP #$16
        BCC calc_d_return
        
        LDA TEMP2
        BEQ calc_d_return
        
        SEC
        SBC #$0A
        STA TEMP2
        LDA TEMP
        SEC
        SBC #$0A
        STA TEMP
        
        JMP calc_d_done
        
calc_d_return:
        LDA TEMP
        RTS

; ============================================================
; EFFETTI SONORI SID
; ============================================================
play_deal_snd:
        LDA #$81
        STA SID_CTRL
        LDA #$44
        STA SID_FREQ_LO
        LDA #$01
        STA SID_FREQ_HI
        
        LDX #$10
d1:     LDY #$FF
d2:     DEY
        BNE d2
        DEX
        BNE d1
        
        LDA #$00
        STA SID_CTRL
        RTS

play_win_snd:
        LDX #$00
win_loop:
        LDA win_freq_lo,X
        STA SID_FREQ_LO
        LDA win_freq_hi,X
        STA SID_FREQ_HI
        LDA #$81
        STA SID_CTRL
        
        JSR short_delay
        
        INX
        CPX #$04
        BNE win_loop
        
        LDA #$00
        STA SID_CTRL
        RTS

play_lose_snd:
        LDA #$91
        STA SID_CTRL
        LDA #$88
        STA SID_FREQ_LO
        LDA #$01
        STA SID_FREQ_HI
        
        LDX #$20
descend:
        LDA SID_FREQ_LO
        SEC
        SBC #$04
        STA SID_FREQ_LO
        LDA SID_FREQ_HI
        SBC #$00
        STA SID_FREQ_HI
        
        JSR short_delay
        DEX
        BNE descend
        
        LDA #$00
        STA SID_CTRL
        RTS

play_menu_snd:
        LDA #$81
        STA SID_CTRL
        LDA #$69
        STA SID_FREQ_LO
        LDA #$02
        STA SID_FREQ_HI
        
        JSR short_delay
        
        LDA #$00
        STA SID_CTRL
        RTS

play_chip_snd:
        LDA #$81
        STA SID_CTRL
        LDA #$22
        STA SID_FREQ_LO
        LDA #$01
        STA SID_FREQ_HI
        
        JSR short_delay
        
        LDA #$00
        STA SID_CTRL
        RTS

short_delay:
        LDX #$08
sd1:    LDY #$FF
sd2:    DEY
        BNE sd2
        DEX
        BNE sd1
        RTS

win_freq_lo:
        .byte $11,$69,$98,$11
win_freq_hi:
        .byte $01,$02,$02,$04

; ============================================================
; ROUTINE SCHERMO
; ============================================================
clear_screen:
        LDA #$20
        LDX #$00
cls:    STA SCREEN,X
        STA SCREEN+$100,X
        STA SCREEN+$200,X
        STA SCREEN+$300,X
        DEX
        BNE cls
        RTS

draw_poker_hand:
        RTS

draw_poker_cards:
        RTS

show_poker_result:
        RTS

draw_bj_hands:
        RTS

draw_bj_result:
        RTS

deal_bj_initial:
        RTS

deal_bj_hit:
        RTS

deal_bj_dealer_hit:
        RTS

check_bj_player:
        RTS

check_flush:
        RTS

check_straight:
        RTS

count_ranks:
        RTS

; ============================================================
; DATI TESTO
; ============================================================
menu_text:
        .byte "1-VIDEO POKER",13
        .byte "2-BLACKJACK",13
        .byte "3-IMPOSTAZIONI",13
        .byte "4-ESCI",13,0

hold_msg:
        .byte "PREMI 1-5 PER TENERE, ENTER PER CAMBIARE",0

bj_prompt:
        .byte "H=HIT S=STAND",0
