import {ChannelType} from "../model";
import {IsNotBlank, ParticipantsLength} from "../util/util"
import {
    ArrayMinSize,
    ArrayNotEmpty,
    ArrayUnique,
    IsArray,
    IsBoolean,
    IsDateString,
    IsInt,
    IsJSON,
    IsNotEmpty,
    IsNumberString,
    IsString,
    IsUrl,
    IsUUID,
    Length,
    MaxLength,
    ValidateNested
} from "class-validator";
import {IsArrayOf, IsEnum, IsInstanceOf, OrNull, OrUndefined} from "micro-kit-atlas/routing";

export const MAX_MESSAGE_LENGTH: number = 30000

export enum MuteStatus {
    Muted = 'MUTED',
    Unmuted = 'UNMUTED',
    MentionsOnly = 'MENTIONS_ONLY'
}


export enum PrivacyType {
    Public = 'PUBLIC',
    Private = 'PRIVATE'
}

export enum MemberVisibility {
    Public = 'PUBLIC',
    Hidden = 'HIDDEN',
}

export enum MessageType {
    Text = 'TEXT',
    EncryptedText = 'ENCRYPTED_TEXT',

    CardView = 'CARD_VIEW',
    EncryptedCardView = 'ENCRYPTED_CARD_VIEW',

    CardDualView = 'CARD_DUAL_VIEW',
    EncryptedCardDualView = 'ENCRYPTED_CARD_DUAL_VIEW',

    Media = 'MEDIA',
    EncryptedMedia = 'ENCRYPTED_MEDIA',
    MediaWithText = 'MEDIA_WITH_TEXT',
    MediaWithEncryptedText = 'MEDIA_WITH_ENCRYPTED_TEXT',

    FilesWithText = 'FILES_WITH_TEXT',
    FilesWithEncryptedText = 'FILES_WITH_ENCRYPTED_TEXT',

    System = 'SYSTEM',

    Deleted = 'DELETED'
}

export enum ChannelPermissionType {
    Readonly = "READONLY",
    Moderator = "MODERATOR"
}

export interface MentionDto {
    type: MentionType
    gid_uuid?: string
    gid_name?: string
}

export interface MessageMetaDto {
    mentions?: Mention[]
}

export interface MessagePreviewWithoutReferenceMessageDto extends MessagePreviewBase {
    reference_message: null
}

export interface MessageContentDto {
    type: MessageType
    content: string
    silent?: boolean
}

export interface MessagePreviewDto extends MessagePreviewBase {
    reference_message: MessagePreviewWithoutReferenceMessage | null
}

export interface MessagePayload extends MessageContent {
    uuid: string
    reference_message_id?: string | null
    meta?: MessageMeta | null
}

export interface MessagePreviewBaseDto extends MessagePayload {
    id: string
    author: string
    deleted: boolean
    created_at?: string
    updated_at?: string | null
    deleted_at?: string | null
    deleted_by?: string | null
    reference_message_id: string | null
    meta: MessageMeta | null
}

export interface ChannelProps {
    type: ChannelType
    exposed: boolean
    title?: string | null
    description?: string | null
    image_url?: string | null
    deleted: boolean
    created_by: string
    created_at: string
    updated_by?: string | null
    updated_at?: string | null
    message?: MessagePreview
    unread_count?: number
    unread_mentions_count?: number
    folder_id?: string | null
    secret?: ChannelSecret | null
    permissions?: ChannelPermission[]
    group_uuid?: string | null
    secrets?: ChannelDeviceSecret[]
    member_visibility: MemberVisibility
    members_count: number
    mute: Mute
    is_large: boolean
    default_join: boolean
    privacy_type: PrivacyType
}

export interface MessagePayloadDto extends MessageContent {
    uuid: string
    reference_message_id?: string | null
    meta?: MessageMeta | null
}

export interface ChannelSecretDto {
    encrypted_secret: string
    header: ChannelSecretHeader
}

export interface ChannelSecretHeaderDto {
    alg: string
    kid: string
}

export interface ParticipantChannelSecretDto {
    gid_uuid: string
    secret: ChannelSecret
}

export interface ChannelWithParticipantsDto extends Channel {
    participants: string[]
    is_large: boolean
}

export interface ChannelDto extends ChannelProps {
    id: string
    alias: string
    uuid: string
}

export interface ParticipantChannelSecret {
    gid_uuid: string
    secret: ChannelSecret
}

export interface ChannelIdWithChannelSecret {
    channel_id: string
    secret: ChannelSecret
}

export interface MuteDto {
    status: MuteStatus
}

export class Mute implements MuteDto {
    @IsEnum(() => MuteStatus) status!: MuteStatus
}

export interface ChannelPermissionDto {
    name: ChannelPermissionType
    value: boolean
}

export interface ChannelDeviceSecretDto {
    secret: ChannelSecret
    device_id: string
}

export class ChannelPermission implements ChannelPermissionDto {
    @IsEnum(() => ChannelPermissionType) name!: ChannelPermissionType
    @IsBoolean() value!: boolean
}

export class MessageContent implements MessageContentDto {
    @IsEnum(() => MessageType) type!: MessageType
    @IsString() @IsJSON() @MaxLength(MAX_MESSAGE_LENGTH) content!: string
    @IsBoolean() @OrUndefined() silent?: boolean
}

export class ChannelSecretHeader implements ChannelSecretHeaderDto {
    @IsString() @IsNotEmpty() alg!: string
    @IsString() @IsNotEmpty() kid!: string
}

export class ChannelSecret implements ChannelSecretDto {
    @IsString() @IsNotEmpty() encrypted_secret!: string
    @IsInstanceOf(ChannelSecretHeader) header!: ChannelSecretHeader
}

export class ChannelDeviceSecret implements ChannelDeviceSecretDto {
    @IsUUID('4') device_id!: string
    @IsInstanceOf(ChannelSecret) secret!: ChannelSecret
}

export class ParticipantChannelSecret implements ParticipantChannelSecretDto {
    @IsUUID('4') gid_uuid!: string
    @IsInstanceOf(ChannelSecret) secret!: ChannelSecret
}

export enum AllowedChanelType {
    Personal = 'PERSONAL',
    Multi = 'MULTI',
}

export interface AddChannel {
    participants: string[]
    uuid: string
    exposed: boolean
    type: ChannelType
    title?: string | null
    description?: string | null
    image_url?: string
    secrets?: ParticipantChannelSecret[]
}

export enum MentionType {
    User = 'user',
    Channel = 'channel',
}

class Mention implements MentionDto {
    @IsEnum(MentionType) type!: MentionType
    @IsUUID() @OrUndefined() gid_uuid?: string
    @IsString() @OrUndefined() gid_name?: string
}

export class MessageMeta implements MessageMetaDto {
    @IsArrayOf(Mention) @OrUndefined() mentions?: Mention[]
}

export class MessagePayload extends MessageContent implements MessagePayloadDto {
    @IsUUID('4') uuid!: string
    @IsNumberString() @OrUndefined() @OrNull() reference_message_id?: string | null
    @IsInstanceOf(MessageMeta) @ValidateNested() @OrUndefined() @OrNull() meta?: MessageMeta | null
}


class MessagePreviewBase extends MessagePayload implements MessagePreviewBaseDto {
    @IsNumberString() id!: string
    @IsString() author!: string
    @IsBoolean() deleted!: boolean
    @IsDateString() created_at?: string
    @IsDateString() @OrUndefined() @OrNull() updated_at?: string | null
    @IsDateString() @OrUndefined() @OrNull() deleted_at?: string | null
    @IsString() @OrUndefined() @OrNull() deleted_by?: string | null
    @IsNumberString() @OrNull() reference_message_id!: string | null
    @IsInstanceOf(MessageMeta) @ValidateNested() @OrNull() meta!: MessageMeta | null
}

export class MessagePreviewWithoutReferenceMessage extends MessagePreviewBase implements MessagePreviewWithoutReferenceMessageDto {
    @OrNull() reference_message!: null
}

export class MessagePreview extends MessagePreviewBase implements MessagePreviewDto {
    @IsInstanceOf(MessagePreviewWithoutReferenceMessage) @OrNull() reference_message!: MessagePreviewWithoutReferenceMessage | null
}

export class Channel implements ChannelDto {
    @IsNumberString() id!: string
    @IsString() alias!: string
    @IsUUID('4') uuid!: string
    @IsEnum(() => ChannelType) type!: ChannelType
    @IsBoolean() exposed!: boolean
    @IsString() @OrUndefined() @OrNull() title?: string | null
    @IsString() @OrUndefined() @OrNull() description?: string | null
    @IsUrl() @OrUndefined() @OrNull() image_url?: string | null
    @IsBoolean() deleted!: boolean
    @IsString() created_by!: string
    @IsString() created_at!: string
    @IsString() @OrUndefined() @OrNull() updated_by?: string | null
    @IsString() @OrUndefined() @OrNull() updated_at?: string | null
    @ValidateNested() @OrUndefined() message?: MessagePreview
    @IsInt() @OrUndefined() unread_count?: number
    @IsInt() @OrUndefined() unread_mentions_count?: number
    @IsInstanceOf(ChannelSecret) @ValidateNested() @OrUndefined() @OrNull() secret?: ChannelSecret | null
    @IsArrayOf(ChannelPermission) @OrUndefined() permissions?: ChannelPermission[]
    @IsNumberString() @OrUndefined() @OrNull() folder_id?: string | null
    @IsUUID('4') @OrUndefined() @OrNull() group_uuid?: string | null
    @IsArrayOf(ChannelDeviceSecret) @OrUndefined() secrets?: ChannelDeviceSecret[]
    @IsEnum(() => MemberVisibility) member_visibility!: MemberVisibility
    @IsInt() members_count!: number
    @IsInstanceOf(Mute) @ValidateNested() mute!: Mute
    @IsBoolean() is_large!: boolean
    @IsBoolean() default_join!: boolean
    @IsEnum(() => PrivacyType) privacy_type!: PrivacyType
}

export class AddChannelBody implements AddChannel {
    @IsArray() @ArrayUnique() @ArrayNotEmpty()
    @IsUUID('4', {each: true})
    @ParticipantsLength()
    participants!: string[]
    @IsUUID('4') uuid!: string
    @IsBoolean() exposed!: boolean
    @IsEnum(() => AllowedChanelType) type!: ChannelType
    @IsString() @OrNull() @IsNotBlank() @OrUndefined() @Length(1, 255) title?: string | null
    @IsString() @OrUndefined() @OrNull() @Length(0, 512) description?: string | null
    @IsUrl() @OrUndefined() @Length(0, 255) image_url?: string
    @IsArrayOf(ParticipantChannelSecret) @ArrayMinSize(2) @OrUndefined() secrets?: ParticipantChannelSecret[]
    @IsUUID('4') @OrUndefined() group_uuid?: string
}

export class ChannelWithParticipants extends Channel implements ChannelWithParticipantsDto {
    @IsArray() @ArrayUnique() @IsUUID('4', {each: true}) participants!: string[]
    @IsBoolean() is_large!: boolean
}
