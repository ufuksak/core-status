import {CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor} from '@nestjs/common';
import {ResponseException} from '../../exception/response.exception';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {isArray} from 'util';

@Injectable()
export class JsonApiTransformer implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(map((data) => {
            let dataResponse, count: number = 1, total: number = 1;

            const buildData = (vdata) => {
                return vdata || {};
            };

            dataResponse = data || [];

            if (dataResponse.constructor.prototype instanceof Error) {
                throw new ResponseException(dataResponse.message, dataResponse.name, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            dataResponse = isArray(data) ? data.map(item => buildData(item)) : buildData(data);
            const result = { data: dataResponse };

            if (isArray(dataResponse)) {
                count = dataResponse.length;
                total = dataResponse.length;
                result['meta'] = {
                    count: count,
                    total: total,
                };
            }

            return result;
        }));
    }
}
