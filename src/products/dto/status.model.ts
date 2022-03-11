import {UserDto} from "./user.model";

export class StatusDto {

    constructor(
        public id: number,
        public title: string,
        public description: string,
        public user: UserDto
    ) {

    }
}
