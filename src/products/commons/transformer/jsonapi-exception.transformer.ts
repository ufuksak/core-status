import {ArgumentsHost, Catch, ExceptionFilter, HttpException} from '@nestjs/common';
import {Response} from 'express';

@Catch(HttpException)
export class JsonApiExceptionTransformer implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();

        const status = exception.getStatus();
        const errResponse = exception.getResponse();

        const errorObj = errResponse["errors"] || errResponse["error"];
        const errorTitle = errResponse["title"] || errResponse["message"];
        const errorArr = Array.isArray(errorObj) ? errorObj : [errorObj];
        const errors = errorArr.map(e => {
            return {
                status: status,
                title: errorTitle,
                detail: e
            }
        });

        response.status(status).json({
            errors: errors
        });
    }
}
