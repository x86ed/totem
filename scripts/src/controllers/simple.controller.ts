import { Controller, Get } from '@nestjs/common';

@Controller('simple')
export class SimpleController {
  @Get()
  getHello(): string {
    return 'Hello from SimpleController!';
  }
}
