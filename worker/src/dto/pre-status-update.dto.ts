import {PRE_STATUS_UPDATE_EXCHANGE} from "../config/rabbit";
import {IsString, IsUUID} from "class-validator";
import {ExchangeType, Message} from "@globalid/nest-amqp";
import { StatusUpdateDto } from "./status-update.dto";

@Message({ name :PRE_STATUS_UPDATE_EXCHANGE, exchangeType: ExchangeType.direct })
export class PreStatusUpdateDto  extends StatusUpdateDto {
  @IsUUID('4')
  grant_id: string;

  @IsString()
  reEncryptionKey: string;
}
