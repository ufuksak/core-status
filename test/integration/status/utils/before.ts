import {truncateEntity} from "../../helpers";
import {StreamEntity} from "../../../../src/products/entity/stream.entity";
import {StreamTypeEntity} from "../../../../src/products/entity/stream_type.entity";
import {UpdateEntity} from "../../../../src/products/entity/update.entity";
import {GrantEntity} from "../../../../src/products/entity/grant.entity";

export default async function beforeEach(){
  await Promise.all([UpdateEntity, StreamEntity, StreamTypeEntity, GrantEntity]
    .map(el => truncateEntity(el))
  );
}