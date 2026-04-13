import { Injectable } from '@nestjs/common'
import { Room, RoomPlayer, CreateRoomDto } from './room.types'
import { randomUUID } from 'crypto'

@Injectable()
export class RoomManager {
  private rooms = new Map<string, Room>()

  create(dto: CreateRoomDto): Room {
    const room: Room = {
      id: randomUUID(),
      name: dto.name,
      isPrivate: dto.isPrivate,
      password: dto.password,
      hostId: dto.hostId,
      maxPlayers: 5,
      status: 'waiting',
      createdAt: new Date(),
      players: [
        { userId: dto.hostId, username: dto.hostUsername, isReady: false, isAI: false },
      ],
    }
    this.rooms.set(room.id, room)
    return room
  }

  findAll(): Room[] {
    return Array.from(this.rooms.values()).filter((r) => !r.isPrivate && r.status === 'waiting')
  }

  findOne(id: string): Room | undefined {
    return this.rooms.get(id)
  }

  delete(id: string, userId: string): boolean {
    const room = this.rooms.get(id)
    if (!room || room.hostId !== userId) return false
    this.rooms.delete(id)
    return true
  }

  addPlayer(roomId: string, player: RoomPlayer): Room | null {
    const room = this.rooms.get(roomId)
    if (!room || room.players.length >= room.maxPlayers) return null
    if (room.players.some((p) => p.userId === player.userId)) return room
    room.players.push(player)
    return room
  }

  removePlayer(roomId: string, userId: string): Room | null {
    const room = this.rooms.get(roomId)
    if (!room) return null
    room.players = room.players.filter((p) => p.userId !== userId)
    if (room.players.length === 0) {
      this.rooms.delete(roomId)
      return null
    }
    if (room.hostId === userId && room.players.length > 0) {
      room.hostId = room.players[0].userId
    }
    return room
  }

  setReady(roomId: string, userId: string): Room | null {
    const room = this.rooms.get(roomId)
    if (!room) return null
    const player = room.players.find((p) => p.userId === userId)
    if (player) player.isReady = true
    return room
  }

  setStatus(roomId: string, status: Room['status']): void {
    const room = this.rooms.get(roomId)
    if (room) room.status = status
  }

  isAllReady(roomId: string): boolean {
    const room = this.rooms.get(roomId)
    if (!room || room.players.length < room.maxPlayers) return false
    return room.players.every((p) => p.isReady)
  }
}
