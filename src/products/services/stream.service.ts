import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import { FindOneOptions } from "typeorm";
import { KeystoreByMeDto } from "../dto/keystore.byme.model";
import { StreamDto } from "../dto/stream.model";
import { StreamEntity } from "../entity/stream.entity";
import { StreamRepository } from "../repositories/stream.repository";
import { KeystoreService } from "./keystore";

@Injectable()
export class StreamService {

    constructor(
      @InjectRepository(StreamRepository) private readonly streamRepo: StreamRepository,
      private readonly keystoreService: KeystoreService,
    ) {}

    async save(token: string, owner_id: string, streamType: string, encryptedPrivateKey: string, publicKey: string) {

      const keystoreDto = {
        public_key           : publicKey,
        encrypted_private_key: encryptedPrivateKey,
        purpose              : 'status-stream',
        algorithm_type       : 'ec',
      } as KeystoreByMeDto;

      const keypair = await this.keystoreService.createKeystoreKeyByMe(token, keystoreDto);

      const streamDto = {
        type      : streamType,
        owner_id,
        keypair_id: keypair.uuid,
        device_id : keypair.device_id,
      } as StreamDto;

      const stream = await this.streamRepo.saveStream(streamDto);

      return stream.id;
    }

    getById(streamId: string, options?: FindOneOptions<StreamEntity>) {
      return this.streamRepo.getStreamById(streamId, options);
    }
}
