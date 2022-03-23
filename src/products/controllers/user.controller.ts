import {Body, Controller, Delete, Get, Put, Param, Post} from "@nestjs/common";
import {UserService} from "../services/user.service";
import {UserDto} from "../dto/user.model";
import { StatusRequestBody, StatusResponseBody } from "../dto/status.model";

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

    @Put('/:id/status')
    async updateStatus(@Param('id') id: string, @Body() body: StatusRequestBody) : Promise<StatusResponseBody> {
      const { status_updates } = body;

      const saveStatus = await this.service.saveStatus(id, status_updates);

      return {
        status_updates: saveStatus
      };
    }
}
