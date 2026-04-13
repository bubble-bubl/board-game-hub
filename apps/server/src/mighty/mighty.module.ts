import { Module } from '@nestjs/common'
import { MightyGateway } from './mighty.gateway'
import { MightyService } from './mighty.service'
import { RoomsModule } from '../rooms/rooms.module'

@Module({
  imports: [RoomsModule],
  providers: [MightyGateway, MightyService],
})
export class MightyModule {}
