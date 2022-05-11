import {registerDecorator, ValidationArguments} from "class-validator";

export enum ChannelType {
    Service = 'SERVICE',
    Presence = 'PRESENCE',
    Personal = 'PERSONAL',
    Multi = 'MULTI',
    Group = 'GROUP',
    GroupCustom = 'GROUP_CUSTOM',
}

export const PG_UNIQUE_CONSTRAINT_VIOLATION = '23505';

export const PG_FOREIGN_KEY_VIOLATION = '23503';

export const STATUS_MANAGE_SCOPE = ['status.manage', 'keys.manage'];

export const GRANTS_DELETE_SCOPE = ['status.grants.delete'];

export const GRANTS_MANAGE_SCOPE = ['status.grants.manage'];

export const GRANTS_CREATE_SCOPE = ['status.grants.create'];

export const PERSONAL_CHANNEL_PARTICIPANTS: number = 1

export const MULTI_CHANNEL_MIN_PARTICIPANTS: number = 3

export const MULTI_CHANNEL_MAX_PARTICIPANTS: number = 37

export const S3_READ_CHUNK_SIZE = 100 * 1024;

export const S3_MAX_FILE_SIZE = 1024 * 1024 * 150;

export const MAX_DB_FILE_SIZE = 2 * 1024;

export const typeormTimestampFormat = 'YYYY-MM-DD HH:MM:SS';

// eslint-disable-next-line @typescript-eslint/ban-types
export function ParticipantsLength(): Function {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return (object: Object, propertyName: string): void => {
        registerDecorator({
            name: 'ParticipantsLength',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: {},
            validator: {
                validate(value: string[], args: ValidationArguments): boolean {
                    const channelType: string = <string>(<Record<string, unknown>>args.object).type
                    const participantLength: number = value.length

                    switch (channelType) {
                        case ChannelType.Personal:
                            return participantLength === PERSONAL_CHANNEL_PARTICIPANTS
                        case ChannelType.Multi:
                            if (participantLength < MULTI_CHANNEL_MIN_PARTICIPANTS ||
                                participantLength > MULTI_CHANNEL_MAX_PARTICIPANTS) {
                                return false
                            }

                            return true
                        case ChannelType.Group:
                            return true
                        default:
                            return false
                    }
                },
                defaultMessage(validationArguments: ValidationArguments): string {
                    const channelType: string = <string>(<Record<string, unknown>>validationArguments.object).type
                    switch (channelType) {
                        case ChannelType.Personal:
                            return 'You can add only one participant into personal channel'
                        case ChannelType.Multi:
                            return `You can add min ${MULTI_CHANNEL_MIN_PARTICIPANTS - 1} and max ${MULTI_CHANNEL_MAX_PARTICIPANTS - 1} participants into multi person channel`
                        default:
                            return ''
                    }
                }
            },
        })
    }
}

export function IsNotBlank(): PropertyDecorator {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return (object: Object, propertyName: string | symbol): void => {
        registerDecorator({
            name: 'isNotBlank',
            target: object.constructor,
            propertyName: <string>propertyName,
            constraints: [],
            options: {},
            validator: {
                validate(value: unknown): boolean {
                    return typeof value === 'string' && value.trim().length > 0
                },
                defaultMessage(): string {
                    return `${<string>propertyName} is too short, or contains only spaces`
                }
            }
        })
    }
}

export function toYyyyMmDd(d: Date): string {
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const frmtdMonth = month < 10 ? `0${month}` : month;
    const frmtdDay = day < 10 ? `0${day}` : day;
    return `${d.getFullYear()}-${frmtdMonth}-${frmtdDay}`;
}