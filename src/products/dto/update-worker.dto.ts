import {UpdateEntity} from "../entity/update.entity";
import {GrantEntity} from "../entity/grant.entity";
import {STATUS_UPDATE_EXCHANGE} from "../config/rabbit";
import {ExchangeType, Message} from "@globalid/nest-amqp";

@Message({ name :STATUS_UPDATE_EXCHANGE, exchangeType: ExchangeType.direct })
export class UpdateWorkerDto {
  update: UpdateEntity
  grants: GrantEntity[]
}
