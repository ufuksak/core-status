import {STATUS_UPDATE_EXCHANGE} from "../config/rabbit";
import {IsDateString, IsString, IsUUID} from "class-validator";
import {IsNotBlank} from "../../../src/products/util/util";
import {ExchangeType, Message} from "@globalid/nest-amqp";

@Message({ name: STATUS_UPDATE_EXCHANGE, exchangeType: 'x-consistent-hash' as ExchangeType, routingKey: '1' })
export class StatusUpdateDto {
  @IsUUID('4')
  id: string;

  @IsUUID('4')
  stream_id: string;

  @IsUUID('4')
  user_id: string;

  @IsDateString()
  recorded_at: string;

  @IsString()
  @IsNotBlank()
  payload: string;
}
