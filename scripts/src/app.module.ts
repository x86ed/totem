import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ApiController } from './controllers/api.controller';
import { TicketController } from './controllers/ticket.controller';
import { SimpleController } from './controllers/simple.controller';
import { TotemService } from './services/totem.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'frontend', 'dist'),
      exclude: ['/api*'],
    }),
  ],
  controllers: [ApiController, TicketController, SimpleController],
  providers: [TotemService],
})
export class AppModule {}