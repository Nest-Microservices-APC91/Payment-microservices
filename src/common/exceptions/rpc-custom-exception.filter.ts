import { Catch, ArgumentsHost } from '@nestjs/common';
import { ExceptionFilter, HttpArgumentsHost } from '@nestjs/common/interfaces';
import { RpcException } from '@nestjs/microservices';

import { Response } from 'express';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const resp: Response = ctx.getResponse();

    const rpcError = exception.getError();

    //si alguna microservices esta caido
    // Aca se puede disparar alguna sistema de notificación
    if (rpcError.toString().includes('Empty response')) {
      return resp.status(500).json({
        status: 500,
        message: rpcError
          .toString()
          .substring(0, rpcError.toString().indexOf('(') - 1),
      });
    }

    if (
      typeof rpcError === 'object' && // Si rpcError es un objeto
      'status' in rpcError && // Si status exite in rpcError
      'message' in rpcError // Si message exite in rpcError
    ) {
      const status = isNaN(+rpcError.status) ? 400 : +rpcError.status;
      return resp.status(status).json(rpcError);
    }

    resp.status(400).json({
      status: 400,
      message: rpcError,
    });
  }
}
