import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { NATS_SERVICE } from '../common/constants';
import { envs } from '../config/envs';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: envs.natsServers,
        },
      },
    ]),
  ],
})
export class PaymentsModule {}
