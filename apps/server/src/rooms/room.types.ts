export interface Room {
  id: string
  name: string
  isPrivate: boolean
  password?: string
  hostId: string
  players: RoomPlayer[]
  maxPlayers: number
  status: 'waiting' | 'playing' | 'finished'
  createdAt: Date
}

export interface RoomPlayer {
  userId: string
  username: string
  isReady: boolean
  isAI: boolean
}

export interface CreateRoomDto {
  name: string
  isPrivate: boolean
  password?: string
  hostId: string
  hostUsername: string
}
