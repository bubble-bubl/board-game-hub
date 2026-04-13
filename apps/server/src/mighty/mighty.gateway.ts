import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { MightyService } from './mighty.service'
import { RoomManager } from '../rooms/room.manager'
import { Card, Bid, Suit, AILevel, Player } from '@board-hub/game-engine'

@WebSocketGateway({
  cors: {
    origin: /localhost/,
    credentials: true,
  },
})
export class MightyGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server

  // socketId → { roomId, userId }
  private socketMap = new Map<string, { roomId: string; userId: string }>()

  constructor(
    private readonly mightyService: MightyService,
    private readonly roomManager: RoomManager,
  ) {}

  handleDisconnect(client: Socket) {
    const info = this.socketMap.get(client.id)
    if (!info) return
    const { roomId, userId } = info
    this.socketMap.delete(client.id)
    const room = this.roomManager.removePlayer(roomId, userId)
    if (room) {
      this.server.to(roomId).emit('player-left', { playerId: userId })
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string; username: string },
  ) {
    const room = this.roomManager.addPlayer(data.roomId, {
      userId: data.userId,
      username: data.username,
      isReady: false,
      isAI: false,
    })
    if (!room) {
      client.emit('error', { message: '방이 꽉 찼거나 존재하지 않습니다.' })
      return
    }
    client.join(data.roomId)
    this.socketMap.set(client.id, { roomId: data.roomId, userId: data.userId })
    this.server.to(data.roomId).emit('player-joined', { player: data })
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const info = this.socketMap.get(client.id)
    if (!info) return
    const room = this.roomManager.removePlayer(data.roomId, info.userId)
    client.leave(data.roomId)
    this.socketMap.delete(client.id)
    if (room) {
      this.server.to(data.roomId).emit('player-left', { playerId: info.userId })
    }
  }

  @SubscribeMessage('ready')
  handleReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const info = this.socketMap.get(client.id)
    if (!info) return
    this.roomManager.setReady(data.roomId, info.userId)

    if (this.roomManager.isAllReady(data.roomId)) {
      this.startGame(data.roomId)
    }
  }

  @SubscribeMessage('place-bid')
  handlePlaceBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; bid: Bid },
  ) {
    const info = this.socketMap.get(client.id)
    if (!info) return
    const bid = { ...data.bid, playerId: info.userId }
    const state = this.mightyService.placeBid(data.roomId, bid)
    if (!state) return
    this.server.to(data.roomId).emit('bid-placed', { playerId: info.userId, bid })
    this.broadcastState(data.roomId)
    this.scheduleAIAction(data.roomId)
  }

  @SubscribeMessage('pass-bid')
  handlePassBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const info = this.socketMap.get(client.id)
    if (!info) return
    const state = this.mightyService.passBid(data.roomId, info.userId)
    if (!state) return
    this.broadcastState(data.roomId)
    this.scheduleAIAction(data.roomId)
  }

  @SubscribeMessage('exchange-kitty')
  handleExchangeKitty(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; discardCards: Card[] },
  ) {
    const info = this.socketMap.get(client.id)
    if (!info) return
    const state = this.mightyService.exchangeKitty(data.roomId, info.userId, data.discardCards)
    if (!state) return
    this.broadcastState(data.roomId)
  }

  @SubscribeMessage('select-trump')
  handleSelectTrump(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; trump: Suit | 'no-trump' },
  ) {
    const state = this.mightyService.selectTrump(data.roomId, data.trump)
    if (!state) return
    this.broadcastState(data.roomId)
  }

  @SubscribeMessage('select-friend')
  handleSelectFriend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; friendCard: Card },
  ) {
    const state = this.mightyService.selectFriend(data.roomId, data.friendCard)
    if (!state) return
    this.broadcastState(data.roomId)
    this.scheduleAIAction(data.roomId)
  }

  @SubscribeMessage('play-card')
  handlePlayCard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; card: Card },
  ) {
    const info = this.socketMap.get(client.id)
    if (!info) return
    const state = this.mightyService.playCard(data.roomId, info.userId, data.card)
    if (!state) return

    this.server.to(data.roomId).emit('card-played', { playerId: info.userId, card: data.card })

    if (state.phase === 'finished') {
      this.server.to(data.roomId).emit('game-ended', {
        result: state.winner,
        scores: { pointsScored: state.pointsScored },
      })
    } else {
      this.broadcastState(data.roomId)
      this.scheduleAIAction(data.roomId)
    }
  }

  @SubscribeMessage('start-single')
  handleStartSingle(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; username: string; aiLevel: AILevel },
  ) {
    const roomId = `single-${data.userId}`
    const players: Player[] = [
      { id: data.userId, name: data.username, hand: [], isAI: false },
      { id: 'ai-1', name: 'AI봇1', hand: [], isAI: true, aiLevel: data.aiLevel },
      { id: 'ai-2', name: 'AI봇2', hand: [], isAI: true, aiLevel: data.aiLevel },
      { id: 'ai-3', name: 'AI봇3', hand: [], isAI: true, aiLevel: data.aiLevel },
      { id: 'ai-4', name: 'AI봇4', hand: [], isAI: true, aiLevel: data.aiLevel },
    ]
    client.join(roomId)
    this.socketMap.set(client.id, { roomId, userId: data.userId })

    const state = this.mightyService.initGame(roomId, players)
    client.emit('game-started', {
      hand: state.players.find((p) => p.id === data.userId)?.hand ?? [],
    })
    this.broadcastState(roomId)
    this.scheduleAIAction(roomId)
  }

  private startGame(roomId: string) {
    const room = this.roomManager.findOne(roomId)
    if (!room) return
    const players: Player[] = room.players.map((p) => ({
      id: p.userId,
      name: p.username,
      hand: [],
      isAI: p.isAI,
    }))
    this.roomManager.setStatus(roomId, 'playing')
    const state = this.mightyService.initGame(roomId, players)

    // 각 플레이어에게 자기 패만 전송
    this.server.in(roomId).fetchSockets().then((sockets) => {
      for (const socket of sockets) {
        const info = this.socketMap.get(socket.id)
        if (!info) continue
        const hand = state.players.find((p) => p.id === info.userId)?.hand ?? []
        socket.emit('game-started', { hand })
      }
    })
    this.broadcastState(roomId)
  }

  private broadcastState(roomId: string) {
    this.server.in(roomId).fetchSockets().then((sockets) => {
      for (const socket of sockets) {
        const info = this.socketMap.get(socket.id)
        if (!info) continue
        const state = this.mightyService.getStateForPlayer(roomId, info.userId)
        if (!state) continue
        socket.emit('game-state', state)

        if (state.phase === 'playing' && state.currentTurnId === info.userId) {
          const validCards = this.mightyService.getValidCards(roomId, info.userId)
          socket.emit('your-turn', { phase: state.phase, validCards })
        }
      }
    })
  }

  private scheduleAIAction(roomId: string) {
    const state = this.mightyService.getState(roomId)
    if (!state) return

    if (state.phase === 'bidding') {
      const current = state.players.find((p) => p.id === state.currentTurnId)
      if (!current?.isAI) return
      setTimeout(() => {
        const result = this.mightyService.processAIBid(roomId)
        if (!result) return
        const s = this.mightyService.getState(roomId)!
        if (result.bid === 'pass') {
          this.server.to(roomId).emit('bid-placed', { playerId: result.playerId, bid: null })
        } else {
          this.server.to(roomId).emit('bid-placed', { playerId: result.playerId, bid: result.bid })
        }
        this.broadcastState(roomId)
        this.scheduleAIAction(roomId)
      }, 600)
    }

    if (state.phase === 'playing') {
      const current = state.players.find((p) => p.id === state.currentTurnId)
      if (!current?.isAI) return
      setTimeout(() => {
        const result = this.mightyService.processAITurn(roomId)
        if (!result) return
        this.server.to(roomId).emit('card-played', { playerId: result.playerId, card: result.card })
        const s = this.mightyService.getState(roomId)!
        if (s.phase === 'finished') {
          this.server.to(roomId).emit('game-ended', {
            result: s.winner,
            scores: { pointsScored: s.pointsScored },
          })
        } else {
          this.broadcastState(roomId)
          this.scheduleAIAction(roomId)
        }
      }, 800)
    }
  }
}
