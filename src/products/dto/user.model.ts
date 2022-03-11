import {GpsDto} from "./gps.model";
import {StatusDto} from "./status.model";
import {UserActionDto} from "./user_action.model";

export class UserDto {

    constructor(
        public id: number,
        public username: string,
        public pin: string,
        public name: string,
        public surname: string,
        public address_line_1: string,
        public address_line_2: string,
        public city: string,
        public state_province: string,
        public postal_code: string,
        public country: string,
        public phone_num: string,
        public mobile_num: string,
        public fax_num: string,
        public status: StatusDto[],
        public last_status_utc: Date,
        public last_connection_utc: Date,
        public available_utc: Date,
        public gpsList: GpsDto[],
        public actionList: UserActionDto[]
    ) {

    }
}
