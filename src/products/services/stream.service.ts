import {Injectable, InternalServerErrorException, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {KeystoreByMeDto} from "../dto/keystore.byme.model";
import {StreamDto} from "../dto/stream.model";
import {StreamRepository} from "../repositories/stream.repository";
import {KeystoreService} from "./keystore";
import {StreamEntity} from "../entity/stream.entity";

@Injectable()
export class StreamService {
    private readonly logger = new Logger(StreamService.name);
    constructor(
      @InjectRepository(StreamRepository) private readonly streamRepo: StreamRepository,
      private readonly keystoreService: KeystoreService
    ) {}

    async getAll(): Promise<StreamEntity[]> {
      return this.streamRepo.find({});
    }

    async create(
      owner_id: string, token: string, streamType: string, encryptedPrivateKey: string, publicKey: string
    ) : Promise<StreamEntity> {
      const keystoreDto = {
        public_key           : publicKey,
        encrypted_private_key: encryptedPrivateKey,
        purpose              : 'encryption', // TODO clarification about new values?
        algorithm_type       : 'rsa',
      } as KeystoreByMeDto;

      let keypair = null;
      try {
        keypair = await this.keystoreService.createKeystoreKeyByMe(token, keystoreDto);
      } catch (e) {
        this.logger.error(e.message);
        throw new InternalServerErrorException();
      }

      const streamDto = {
        owner_id,
        type      : streamType,
        keypair_id: keypair.uuid,
        device_id : keypair.device_id,
      } as StreamDto;

      return await this.streamRepo.saveStream(streamDto);
    }
}
