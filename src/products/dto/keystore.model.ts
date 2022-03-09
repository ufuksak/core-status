export class KeystoreDto {

    constructor(
        public message: string,
        public nonce: string,
        public algorithm_type: string,
        public tag: string
    ) {
    }
}
