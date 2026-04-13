import { Module } from '@nestjs/common'
import { RoomsModule } from './rooms/rooms.module'
import { MightyModule } from './mighty/mighty.module'
import { Controller, Get } from '@nestjs/common'

@Controller()
class HealthController {
  @Get('health')
  health() {
    return { status: 'ok' }
  }
}

@Module({
  imports: [RoomsModule, MightyModule],
  controllers: [HealthController],
})
export class AppModule {}
