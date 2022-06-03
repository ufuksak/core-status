import {STATUS_UPDATE_EXCHANGE} from "../config/rabbit";
import {IsDateString, IsString, IsUUID} from "class-validator";
import {IsNotBlank} from "../../../src/products/util/util";
import {ExchangeType, Message} from "@globalid/nest-amqp";

@Message({ name :STATUS_UPDATE_EXCHANGE, exchangeType: ExchangeType.direct })
export class StatusUpdateDto {
  @IsUUID('4')
  id: string;

  @IsUUID('4')
  user_id: string;

  @IsUUID('4')
  stream_id: string;

  @IsUUID('4')
  recipient_id: string;

  @IsDateString()
  recorded_at: string;

  @IsString()
  @IsNotBlank()
  payload: string;
}
