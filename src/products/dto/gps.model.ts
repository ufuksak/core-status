import {UserDto} from "./user.model";

export class GpsDto {

    constructor(
        public id: number,
        public device_id: string,
        public user: UserDto,
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
