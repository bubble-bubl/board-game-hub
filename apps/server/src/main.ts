import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const corsOrigin = process.env.CORS_ORIGIN
  app.enableCors({
    origin: corsOrigin ? [corsOrigin, /localhost/] : /localhost/,
    credentials: true,
  })

  const port = process.env.PORT ?? 4000
  await app.listen(port)
  console.log(`Server running on port ${port}`)
}

bootstrap()
