import {HttpException, NotFoundException} from '@nestjs/common';

export class ResponseException extends HttpException {
    constructor(errors: string | object, title: string, status: number) {
        super({errors: errors, title: title}, status);
    }
}

export class GrantNotFoundException extends NotFoundException {
    constructor() {
        super('grant not found');
    }
}