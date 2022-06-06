import {GrantEntity} from "../entity/grant.entity";
import {GRANT_UPDATE_EXCHANGE} from "../config/rabbit";
import {Message} from "@globalid/nest-amqp";

@Message({name :GRANT_UPDATE_EXCHANGE})
export class GrantWorkerDto {
  update: GrantEntity
  grants: GrantEntity[]
}
