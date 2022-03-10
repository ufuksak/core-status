import {registerDecorator, ValidationArguments} from "class-validator";

export enum ChannelType {
    Service = 'SERVICE',
    Presence = 'PRESENCE',
    Personal = 'PERSONAL',
    Multi = 'MULTI',
    Group = 'GROUP',
    GroupCustom = 'GROUP_CUSTOM',
}

export const PERSONAL_CHANNEL_PARTICIPANTS: number = 1

export const MULTI_CHANNEL_MIN_PARTICIPANTS: number = 3

export const MULTI_CHANNEL_MAX_PARTICIPANTS: number = 37

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
