export type Suit = 'spade' | 'heart' | 'diamond' | 'club'
export type Rank =
  | 'A'
  | 'K'
  | 'Q'
  | 'J'
  | '10'
  | '9'
  | '8'
  | '7'
  | '6'
  | '5'
  | '4'
  | '3'
  | '2'

export interface Card {
  suit: Suit | 'joker'
  rank: Rank | 'joker'
  id: string
}

export interface Bid {
  playerId: string
  count: number
  trump: Suit | 'no-trump' | null
}

export type GamePhase =
  | 'waiting'
  | 'dealing'
  | 'bidding'
  | 'kitty'
  | 'friend-select'
  | 'playing'
  | 'finished'

export type AILevel = 'beginner' | 'intermediate' | 'expert'

export interface Player {
  id: string
  name: string
  hand: Card[]
  isAI: boolean
  aiLevel?: AILevel
}

export interface TrickCard {
  playerId: string
  card: Card
}

export interface Trick {
  cards: TrickCard[]
  winnerId: string
  points: number
}

export interface GameState {
  phase: GamePhase
  players: Player[]
  kitty: Card[]
  currentBid: Bid | null
  trump: Suit | 'no-trump' | null
  friendCard: Card | null
  presidentId: string | null
  friendId: string | null
  currentTurnId: string | null
  tricks: Trick[]
  currentTrick: TrickCard[]
  trickCount: number
  pointsScored: number
  winner: 'president' | 'opposition' | null
}
