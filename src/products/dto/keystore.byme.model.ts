export enum Purpose {
    'messaging' = 'messaging',
    'encryption' = 'encryption',
    'signing' = 'signing',
    'annotations' = 'annotations',
    'device_encryption' = 'device-encryption',
    'status_sharing' = 'status-sharing',
    'status_stream' = 'status-stream',
}

export enum AlgorithmType {
    'ripple' = 'ripple',
    'rsa' = 'rsa',
    'ec' = 'ec',
}

export class KeystoreByMeDto {

    constructor(
        public public_key: string,
        public encrypted_private_key: string,
        public purpose: Purpose,
        public algorithm_type: AlgorithmType
    ) {
    }
}
