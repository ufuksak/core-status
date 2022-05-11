import {
    ConflictException,
    ForbiddenException,
    HttpException,
    MethodNotAllowedException,
    NotFoundException
} from '@nestjs/common';

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

export class GrantOperationNotAllowed extends MethodNotAllowedException {
    constructor() {
        super('range does not support this operation');
    }
}

export class SingletonGrantExists extends ConflictException {
    constructor() {
        super('all/latest grant already exists');
    }
}

export class GrantInvalidTokenScopeException extends ForbiddenException {
    constructor() {
        super('missing permission');
    }
}
