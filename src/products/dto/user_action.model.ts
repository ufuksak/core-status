import {UserDto} from "./user.model";

export class UserActionDto {

    constructor(
        public id: string,
        public name: string,
        public description: string,
        public user: UserDto
    ) {

    }
}
