import {Injectable, InternalServerErrorException, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {StreamDto} from "../dto/stream.model";
import {StreamRepository} from "../repositories/stream.repository";
import {KeystoreService} from "./keystore";
import {StreamEntity} from "../entity/stream.entity";
import {FindOneOptions} from "typeorm";
import {AlgorithmType, KeystoreByMeDto, Purpose} from '../dto/keystore.byme.model'

@Injectable()
export class StreamService {
  private readonly logger = new Logger(StreamService.name);
  constructor(
    @InjectRepository(StreamRepository) private readonly streamRepo: StreamRepository,
    private readonly keystoreService: KeystoreService
  ) {}

  async getAll(): Promise<StreamEntity[]> {
    return this.streamRepo.find({ relations: ['grants']});
  }

  async create(
    owner_id: string, token: string, streamType: string, encryptedPrivateKey: string, publicKey: string
  ) : Promise<StreamEntity> {
    const keystoreDto = {
      public_key           : publicKey,
      encrypted_private_key: encryptedPrivateKey,
      purpose              : Purpose.status_stream,
      algorithm_type       : AlgorithmType.ec,
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

  getById(streamId: string, options?: FindOneOptions<StreamEntity>) {
    return this.streamRepo.getStreamById(streamId, options);
  }
}
