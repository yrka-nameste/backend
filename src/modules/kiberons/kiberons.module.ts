import { Module } from '@nestjs/common';
import { KiberonsController } from './kiberons.controller';
import { KiberonsService } from './kiberons.service';

@Module({
  controllers: [KiberonsController],
  providers: [KiberonsService],
})
export class KiberonsModule {}
