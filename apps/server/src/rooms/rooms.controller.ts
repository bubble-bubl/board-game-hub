import { Controller, Get, Post, Delete, Param, Body, NotFoundException, ForbiddenException } from '@nestjs/common'
import { RoomManager } from './room.manager'
import { CreateRoomDto } from './room.types'

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomManager: RoomManager) {}

  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomManager.create(dto)
  }

  @Get()
  findAll() {
    return this.roomManager.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const room = this.roomManager.findOne(id)
    if (!room) throw new NotFoundException('Room not found')
    return room
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body('userId') userId: string) {
    const ok = this.roomManager.delete(id, userId)
    if (!ok) throw new ForbiddenException('Not the host or room not found')
    return { success: true }
  }
}
