import {UpdateEntity} from "../entity/update.entity";
import {GrantEntity} from "../entity/grant.entity";
import {STATUS_UPDATE_EXCHANGE} from "../config/rabbit";
import {Message} from "@globalid/nest-amqp";

@Message({name :STATUS_UPDATE_EXCHANGE})
export class UpdateWorkerDto {
  update: UpdateEntity
  grants: GrantEntity[]
}
