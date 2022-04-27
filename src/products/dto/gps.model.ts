export class GpsDto {

    constructor(
        public id: string,
        public device_id: string,
        public entry_utc: Date,
        public speed: number,
        public direction: number,
        public latitude: number,
        public longitude: number,
        public street: string,
        public suite: string,
        public city: string,
        public state_province: string,
        public postal_code: string,
        public country: string
    ) {

    }
}
