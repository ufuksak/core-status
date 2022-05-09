import {Test, TestingModule} from '@nestjs/testing'
import {KeystoreController} from '../../src/products/controllers/keystore.controller'
import {KeystoreService} from '../../src/products/services/keystore'
import {AlgorithmType, KeystoreByMeDto, Purpose} from '../../src/products/dto/keystore.byme.model'
import {KeyPairCreateResponse} from '../../src/products/response/keystore.byme.response'

describe('KeystoreController Unit Tests', () => {
    let testController: KeystoreController;
    let testService: KeystoreService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [KeystoreController],
            providers: [
                {
                    provide: KeystoreService,
                    useFactory: () => ({
                        createKeystoreKeyByMe: jest.fn(() => [])
                    })
                }
            ]
        }).compile();

        testController = await module.get<KeystoreController>(KeystoreController);
        testService = await module.get<KeystoreService>(KeystoreService);
    });

    it('should be defined', () => {
        expect(testController).toBeDefined();
    });

    it('createKeystoreKeyByMe method should return object with id of inserted keystore', async () => {
        const deviceId = 'test123';
        const responseKeyPair = {} as KeyPairCreateResponse;
        responseKeyPair.device_id = 'test123';

        jest.spyOn(testService, 'createKeystoreKeyByMe').mockImplementation(() => Promise.resolve(responseKeyPair));

        const dto = {
            "public_key": "Ut incididuntelit labore",
            "encrypted_private_key": "Duis Excepteur culpa reprehenderit esse",
            "purpose": Purpose.status_stream,
            "algorithm_type": AlgorithmType.ec
        } as KeystoreByMeDto;

        const options = {
            uri: 'http://localhost',
            method: 'POST',
            headers: {
                'authorization': 'Bearer 1234'
            }
        };

        const response = await testController.issueNewKeyPairByMe(options, dto);

        expect(response).toEqual({device_id: deviceId});
    });
});
