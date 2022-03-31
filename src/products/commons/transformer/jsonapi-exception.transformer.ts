import {ExceptionFilter, Catch} from '@nestjs/common';
import {HttpException} from '@nestjs/common';
import {isArray} from 'util';

@Catch(HttpException)
export class JsonApiExceptionTransformer implements ExceptionFilter {
    catch(exception: HttpException, response) {
        const status = exception.getStatus();
        const errResponse = exception.getResponse();

        console.log(errResponse)

        const errorObj = errResponse["errors"] || errResponse["error"];
        const errorTitle = errResponse["title"] || errResponse["message"];
        const errorArr = isArray(errorObj) ? errorObj : [errorObj];
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
