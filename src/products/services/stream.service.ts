import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import { KeystoreByMeDto } from "../dto/keystore.byme.model";
import { StreamDto } from "../dto/stream.dto";
import { StreamRepository } from "../repositories/stream.repository";
import { KeystoreService } from "./keystore";
import {StreamEntity} from "../entity/stream.entity";

@Injectable()
export class StreamService {

    constructor(
      @InjectRepository(StreamRepository) private readonly streamRepo: StreamRepository,
      private readonly keystoreService: KeystoreService,
    ) {}

    async getStreams(): Promise<StreamEntity[]> {
      return this.streamRepo.find({});
    }

    async save(token:string, streamType:string, encryptedPrivateKey:string, publicKey:string) {
      const keystoreDto = {
        public_key           : publicKey,
        encrypted_private_key: encryptedPrivateKey,
        purpose: 'status',
        algorithm_type: 'ec',
      } as KeystoreByMeDto;

      const kaypair = await this.keystoreService.createKeystoreKeyByMe(token, keystoreDto);

      const streamDto = {
        type: streamType,
        owner_id: kaypair.client_id,
        keypair_id: kaypair.uuid,
        device_id: kaypair.device_id,
      } as StreamDto;

      const stream = await this.streamRepo.saveStream(streamDto);

      return stream.id;
    }

}
