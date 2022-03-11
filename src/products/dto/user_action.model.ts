import {UserDto} from "./user.model";

export class UserActionDto {

    constructor(
        public name: string,
        public description: string,
        public user: UserDto
    ) {

    }
}
