export const ASSEMBLY_POKER = `; ============================================
; COMMODORE 64 VIDEO POKER
; 6502 Assembly - SID Sound Effects
; ============================================
; Memory Map:
; $0801-$0FFF : Program Code
; $1000-$13FF : Screen RAM
; $D800-$DBFF : Color RAM
; $D400-$D418 : SID Registers
; ============================================

; Zero Page Variables
CARD_COUNT  = $FB      ; Number of cards dealt
DECK_PTR    = $FC      ; Pointer to deck array
HAND_PTR    = $FE      ; Pointer to hand array
SCORE_HI    = $20      ; Score high byte
SCORE_LO    = $21      ; Score low byte
BET_AMOUNT  = $22      ; Current bet
CAPITAL_HI  = $23      ; Player capital high
CAPITAL_LO  = $24      ; Player capital low
TEMP        = $25      ; Temporary storage
RAND_SEED   = $26      ; Random number seed

; SID Register Addresses
SID_FREQ_LO = $D400    ; Voice 1 Frequency Low
SID_FREQ_HI = $D401    ; Voice 1 Frequency High
SID_CTRL    = $D404    ; Voice 1 Control
SID_AD      = $D405    ; Voice 1 Attack/Decay
SID_SR      = $D406    ; Voice 1 Sustain/Release
SID_VOLUME  = $D418    ; Master Volume

; Screen addresses
SCREEN      = $1000    ; Screen memory
COLOR_RAM   = $D800    ; Color memory

; Colors
COL_BLUE    = $06
COL_WHITE   = $01
COL_YELLOW  = $07
COL_RED     = $02
COL_GREEN   = $05
COL_CYAN    = $03

; ============================================
; MAIN PROGRAM ENTRY
; ============================================
*=$0801
        ; BASIC stub to run machine code
        .byte $0B,$08,$0A,$00,$9E,$20
        .byte $28,$32,$30,$36,$34,$29
        .byte $00,$00,$00

*=$080E
INIT:
        ; Initialize screen
        LDA #$00
        STA $D020        ; Border color (black)
        STA $D021        ; Background color (black)
        
        ; Clear screen
        LDA #$20         ; Space character
        LDX #$00
@clear:
        STA SCREEN,X
        STA SCREEN+$100,X
        STA SCREEN+$200,X
        STA SCREEN+$300,X
        DEX
        BNE @clear
        
        ; Initialize SID
        LDA #$00
        STA SID_CTRL     ; Stop all voices
        LDA #$09
        STA SID_AD       ; Attack=0, Decay=9
        LDA #$99
        STA SID_SR       ; Sustain=9, Release=9
        
        ; Initialize game state
        LDA #$00
        STA SCORE_HI
        STA SCORE_LO
        LDA #$E8         ; Capital = 1000
        STA CAPITAL_LO
        LDA #$03
        STA CAPITAL_HI
        LDA #$0A         ; Min bet = 10
        STA BET_AMOUNT
        
        ; Seed random number
        LDA $DC04        ; Timer A low byte
        STA RAND_SEED
        
        JMP GAME_MENU

; ============================================
; GAME MENU
; ============================================
GAME_MENU:
        ; Display title
        LDX #$00
@title:
        LDA TITLE_TEXT,X
        BEQ @menu_options
        STA SCREEN+$028,X  ; Row 2, col 8
        LDA #COL_YELLOW
        STA COLOR_RAM+$028,X
        INX
        BNE @title
        
@menu_options:
        ; Display menu options
        LDX #$00
@opts:
        LDA MENU_TEXT,X
        BEQ @wait_input
        STA SCREEN+$168,X  ; Row 7
        LDA #COL_WHITE
        STA COLOR_RAM+$168,X
        INX
        BNE @opts

@wait_input:
        ; Wait for keypress
        LDA $DC01        ; Read keyboard
        CMP #$FF
        BEQ @wait_input
        
        ; Check which key
        CMP #$31         ; '1' - Poker
        BEQ START_POKER
        CMP #$32         ; '2' - Blackjack
        BEQ START_BLACKJACK
        CMP #$33         ; '3' - Settings
        BEQ SHOW_SETTINGS
        
        JMP @wait_input

; ============================================
; CARD DECK INITIALIZATION
; ============================================
INIT_DECK:
        ; Create 52-card deck
        LDX #$00
@deck_loop:
        ; Card = suit * 13 + rank
        TXA
        STA DECK,X
        INX
        CPX #$34         ; 52 cards
        BNE @deck_loop
        
        ; Shuffle deck (Fisher-Yates)
        LDX #$33         ; Start from 52
@shuffle:
        TXA
        JSR RANDOM       ; Get random 0-X
        TAY
        
        ; Swap deck[X] and deck[Y]
        LDA DECK,X
        PHA
        LDA DECK,Y
        STA DECK,X
        PLA
        STA DECK,Y
        
        DEX
        BNE @shuffle
        
        RTS

; ============================================
; RANDOM NUMBER GENERATOR
; ============================================
; Returns random number 0 to A in A
RANDOM:
        STA TEMP
        LDA RAND_SEED
        LSR              ; Shift right
        BCC @no_xor
        EOR #$B4         ; XOR with polynomial
@no_xor:
        STA RAND_SEED
        AND TEMP
        ; Modulo operation
        STA TEMP
        LDA RAND_SEED
        AND #$7F         ; Limit to 0-127
        RTS

; ============================================
; DEAL CARDS
; ============================================
DEAL_HAND:
        ; Deal 5 cards from deck
        LDX #$00
@deal_loop:
        LDA DECK,X       ; Get card from deck
        STA HAND_PTR,X   ; Store in hand
        INX
        CPX #$05
        BNE @deal_loop
        
        ; Remove dealt cards from deck
        ; (shift remaining cards)
        LDX #$05
@shift:
        LDA DECK+5,X
        STA DECK,X
        INX
        CPX #$2F         ; 52-5 = 47
        BNE @shift
        
        JSR DRAW_CARDS   ; Display cards
        JSR PLAY_DEAL_SND
        RTS

; ============================================
; DRAW CARDS ON SCREEN
; ============================================
DRAW_CARDS:
        LDX #$00
@draw_card:
        ; Calculate screen position
        ; Cards at row 12, spaced 8 apart
        TXA
        ASL              ; *2
        ASL              ; *4
        ASL              ; *8
        CLC
        ADC #$04         ; Offset from left
        STA TEMP
        
        ; Draw card border
        LDA #$70         ; Top-left corner
        JSR PLOT_CARD
        
        ; Draw card face
        LDA HAND_PTR,X
        JSR GET_SUIT_CHAR
        ; ... (suit display code)
        
        ; Draw card value
        LDA HAND_PTR,X
        JSR GET_RANK_CHAR
        
        INX
        CPX #$05
        BNE @draw_card
        
        RTS

; ============================================
; EVALUATE POKER HAND
; ============================================
EVALUATE_HAND:
        ; Check for flush
        JSR CHECK_FLUSH
        BCS @is_flush
        CLC
@is_flush:
        ; Check for straight
        JSR CHECK_STRAIGHT
        BCS @is_straight
        CLC
@is_straight:
        
        ; Check pairs/trips/quads
        JSR COUNT_RANKS
        
        ; Determine hand rank
        ; ... (comparison logic)
        
        ; Set multiplier in SCORE
        ; Royal Flush = 250x
        ; Straight Flush = 50x
        ; Four of a Kind = 25x
        ; Full House = 9x
        ; Flush = 6x
        ; Straight = 4x
        ; Three of a Kind = 3x
        ; Two Pair = 2x
        ; Jacks or Better = 1x
        
        RTS

; ============================================
; SID SOUND EFFECTS
; ============================================
PLAY_DEAL_SND:
        ; Card deal sound effect
        LDA #$81         ; Note on, square wave
        STA SID_CTRL
        LDA #$44         ; Frequency
        STA SID_FREQ_LO
        LDA #$01
        STA SID_FREQ_HI
        LDA #$0F         ; Max volume
        STA SID_VOLUME
        
        ; Short delay
        LDX #$10
@delay1:
        LDY #$FF
@delay2:
        DEY
        BNE @delay2
        DEX
        BNE @delay1
        
        LDA #$00         ; Note off
        STA SID_CTRL
        RTS

PLAY_WIN_SND:
        ; Victory fanfare
        LDX #$00
@win_notes:
        LDA WIN_FREQ_LO,X
        STA SID_FREQ_LO
        LDA WIN_FREQ_HI,X
        STA SID_FREQ_HI
        LDA #$81
        STA SID_CTRL
        LDA #$0F
        STA SID_VOLUME
        
        ; Delay between notes
        JSR SHORT_DELAY
        
        INX
        CPX #$04
        BNE @win_notes
        
        LDA #$00
        STA SID_CTRL
        RTS

PLAY_LOSE_SND:
        ; Losing sound (descending)
        LDA #$91         ; Sawtooth wave
        STA SID_CTRL
        LDA #$88
        STA SID_FREQ_LO
        LDA #$01
        STA SID_FREQ_HI
        
        ; Descending frequency
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

; ============================================
; WIN FREQUENCY TABLE
; ============================================
WIN_FREQ_LO:
        .byte $11,$69,$98,$11  ; C5,E5,G5,C6
WIN_FREQ_HI:
        .byte $01,$02,$02,$04

; ============================================
; TEXT DATA
; ============================================
TITLE_TEXT:
        .byte "*** COMMODORE 64 POKER ***"
        .byte $00

MENU_TEXT:
        .byte "1-VIDEO POKER  2-BLACKJACK"
        .byte "  3-SETTINGS"
        .byte $00

; ============================================
; BLACKJACK SUBROUTINES
; ============================================
START_BLACKJACK:
        JSR INIT_DECK
        
        ; Deal initial cards (2 each)
        JSR DEAL_BJ_PLAYER
        JSR DEAL_BJ_DEALER
        
        ; Check for blackjack
        JSR CHECK_BJ_VALUE
        CMP #$15         ; 21
        BEQ @player_bj
        
        JMP BJ_PLAYER_TURN
        
@player_bj:
        ; Player has blackjack!
        JSR PLAY_WIN_SND
        ; Pay 3:2
        RTS

BJ_PLAYER_TURN:
        ; Show hit/stand options
        ; Wait for input
        LDA $DC01
        CMP #$FF
        BEQ BJ_PLAYER_TURN
        
        CMP #$48         ; 'H' for Hit
        BEQ BJ_HIT
        CMP #$53         ; 'S' for Stand
        BEQ BJ_STAND
        
        JMP BJ_PLAYER_TURN

BJ_HIT:
        ; Deal one more card
        JSR DEAL_ONE_CARD
        JSR CHECK_BJ_VALUE
        CMP #$15         ; 21
        BEQ BJ_STAND     ; Auto-stand on 21
        CMP #$16         ; Over 21?
        BCS @bust
        
        JMP BJ_PLAYER_TURN
        
@bust:
        JSR PLAY_LOSE_SND
        RTS

BJ_STAND:
        ; Dealer's turn
        JSR DEALER_PLAY
        RTS

; ============================================
; DEALER AI (Difficulty Based)
; ============================================
DEALER_PLAY:
        ; Easy: stands on 17+
        ; Medium: stands on 17+, hits soft 17
        ; Hard: optimal strategy
        
        LDA DIFFICULTY
        CMP #$00
        BEQ @easy_dealer
        CMP #$01
        BEQ @medium_dealer
        
@hard_dealer:
        ; Hard: use basic strategy
        JSR CHECK_BJ_VALUE
        CMP #$11         ; 17
        BCS @dealer_stand
        JMP DEAL_ONE_CARD

@medium_dealer:
        JSR CHECK_BJ_VALUE
        CMP #$11         ; Stand on 17+
        BCS @dealer_stand
        JMP DEAL_ONE_CARD

@easy_dealer:
        ; Easy: might stand early
        JSR CHECK_BJ_VALUE
        CMP #$10         ; Stand on 16+
        BCS @dealer_stand
        ; 30% chance to stand on 16
        JSR RANDOM
        CMP #$30
        BCS @dealer_stand
        JMP DEAL_ONE_CARD

@dealer_stand:
        ; Compare hands
        JSR COMPARE_HANDS
        RTS

; ============================================
; SETTINGS SCREEN
; ============================================
SHOW_SETTINGS:
        ; Display settings
        ; Capital: ___
        ; Min Bet: ___
        ; Max Bet: ___
        ; Difficulty: EASY/MEDIUM/HARD
        
        ; Wait for input to modify
        ; ... (settings modification code)
        
        JMP GAME_MENU

; ============================================
; START POKER GAME
; ============================================
START_POKER:
        JSR INIT_DECK
        JSR DEAL_HAND
        
        ; Wait for hold/discard selection
@poker_input:
        LDA $DC01
        CMP #$FF
        BEQ @poker_input
        
        ; Keys 1-5 to hold/unhold cards
        ; ENTER to draw
        ; ... (input handling)
        
        JMP EVALUATE_HAND

; ============================================
; CALCULATE WINNINGS
; ============================================
CALC_WIN:
        ; Winnings = BET * MULTIPLIER
        LDA BET_AMOUNT
        STA TEMP
        
        ; Multiply by hand multiplier
        LDA SCORE_LO     ; Multiplier
        JSR MULTIPLY     ; A = TEMP * A
        
        ; Add to capital
        CLC
        ADC CAPITAL_LO
        STA CAPITAL_LO
        LDA #$00
        ADC CAPITAL_HI
        STA CAPITAL_HI
        
        RTS

; ============================================
; MULTIPLY SUBROUTINE
; ============================================
; Multiply TEMP * A, result in A
MULTIPLY:
        STA TEMP+1
        LDA #$00
        LDX #$08
@mul_loop:
        LSR TEMP+1
        BCC @no_add
        CLC
        ADC TEMP
@no_add:
        ASL TEMP
        DEX
        BNE @mul_loop
        RTS

; ============================================
; UTILITY FUNCTIONS
; ============================================
SHORT_DELAY:
        LDX #$08
@d1:    LDY #$FF
@d2:    DEY
        BNE @d2
        DEX
        BNE @d1
        RTS

GET_SUIT_CHAR:
        ; Convert card value to suit character
        AND #$03
        TAX
        LDA SUIT_CHARS,X
        RTS

GET_RANK_CHAR:
        ; Convert card value to rank
        LSR
        LSR              ; Divide by 4
        TAX
        LDA RANK_CHARS,X
        RTS

SUIT_CHARS:
        .byte $0F,$1B,$03,$06  ; Heart,Club,Spade,Diamond
        
RANK_CHARS:
        .byte $B0,$B1,$B2,$B3,$B4,$B5,$B6,$B7
        .byte $B8,$B9,$BA,$BB,$BC,$BD,$0F

; ============================================
; DATA STORAGE
; ============================================
; Deck array: 52 bytes at $0400
DECK = $0400
; Hand array: 5 bytes at $0434  
HAND = $0434
; Difficulty: 0=easy, 1=medium, 2=hard
DIFFICULTY = $0440

; ============================================
; END OF PROGRAM
; ============================================
        .byte $00        ; End marker`;

export const ASSEMBLY_BLACKJACK_EXTRA = `
; ============================================
; BLACKJACK - ADDITIONAL ROUTINES
; ============================================

DEAL_BJ_PLAYER:
        ; Deal card to player
        LDX PLAYER_CARD_COUNT
        LDA DECK,X
        STA PLAYER_HAND,X
        INC PLAYER_CARD_COUNT
        JSR DRAW_SINGLE_CARD
        JSR PLAY_DEAL_SND
        RTS

DEAL_BJ_DEALER:
        ; Deal card to dealer
        LDX DEALER_CARD_COUNT
        LDA DECK+$10,X   ; Offset for dealer
        STA DEALER_HAND,X
        INC DEALER_CARD_COUNT
        JSR DRAW_DEALER_CARD
        RTS

CHECK_BJ_VALUE:
        ; Calculate hand value
        LDA #$00
        STA TEMP         ; Total
        STA TEMP+1       ; Ace count
        LDX #$00
        
@count_loop:
        CPX PLAYER_CARD_COUNT
        BEQ @adjust_aces
        
        LDA PLAYER_HAND,X
        AND #$0C         ; Get rank (upper bits)
        LSR
        LSR
        CMP #$0B         ; Ace?
        BEQ @is_ace
        CMP #$0A         ; Face card?
        BCS @is_ten
        ; Number card
        CLC
        ADC TEMP
        STA TEMP
        JMP @next_card
        
@is_ace:
        INC TEMP+1       ; Count aces
        LDA #$0B         ; Add 11
        CLC
        ADC TEMP
        STA TEMP
        JMP @next_card
        
@is_ten:
        LDA #$0A         ; Add 10
        CLC
        ADC TEMP
        STA TEMP
        
@next_card:
        INX
        JMP @count_loop
        
@adjust_aces:
        ; If over 21, convert aces from 11 to 1
        LDA TEMP
        CMP #$16         ; > 21?
        BCC @done
        
        LDA TEMP+1
        BEQ @done        ; No aces to convert
        
        SEC
        SBC #$0A         ; Subtract 10
        STA TEMP+1
        LDA TEMP
        SEC
        SBC #$0A
        STA TEMP
        
        JMP @adjust_aces
        
@done:
        LDA TEMP
        RTS

; Player and dealer hand storage
PLAYER_HAND = $0450
DEALER_HAND = $0460
PLAYER_CARD_COUNT = $27
DEALER_CARD_COUNT = $28
`;
