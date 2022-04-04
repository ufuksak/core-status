import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus} from '@nestjs/common';
import {Response} from 'express';

@Catch()
export class UploadExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const isNestHttp = exception instanceof HttpException;
        const status = isNestHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = isNestHttp ? exception.getResponse() : exception['message'];
        const messageToApply = message || 'unknown error';

        response
            .status(status)
            .json({
                message: messageToApply,
                statusCode: status,
                time: new Date().toISOString(),
            });
    }
}