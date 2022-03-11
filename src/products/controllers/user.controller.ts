import {Body, Controller, Delete, Get, Param, Post} from "@nestjs/common";
import {UserService} from "../services/user.service";
import {UserDto} from "../dto/user.model";

@Controller('/api/v1/users')
export class UserController {

    constructor(private service: UserService) {
    }

    @Post()
    addUsers(@Body() user: UserDto): {} {
        const generatedId = this.service.insertUser(user);
        return {id: generatedId}
    }

    @Get()
    getUsers() {
        return this.service.getAllUsers()
    }

    @Get('/:id')
    getUserById(@Param('id') id: string) {
        return this.service.getUserById(id);
    }

    @Delete('/:id')
    deleteUser(@Param('id') id: string) {
        return this.service.deleteUser(id);
    }
}
