import {ObjectLiteral} from 'typeorm/common/ObjectLiteral'

export interface IdStringObjectLiteral extends ObjectLiteral {
    id: string
}

export function isIdStringObjectLiteral(value: ObjectLiteral): value is IdStringObjectLiteral {
    return typeof value.id === 'string'
}

export interface InvalidPayload {
    title: string
    payload: object
    errorMessage: string
}
