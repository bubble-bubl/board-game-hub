import { Module } from '@nestjs/common'
import { RoomsController } from './rooms.controller'
import { RoomManager } from './room.manager'

@Module({
  controllers: [RoomsController],
  providers: [RoomManager],
  exports: [RoomManager],
})
export class RoomsModule {}
