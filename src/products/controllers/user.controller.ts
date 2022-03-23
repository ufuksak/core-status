import {Body, Controller, Delete, Get, Put, Param, Post} from "@nestjs/common";
import {UserService} from "../services/user.service";
import { StatusRequestBody, StatusResponseBody } from "../dto/status.model";
import { UserEntity } from "../entity/user.entity";

@Controller('/api/v1/users')
export class UserController {

    constructor(private service: UserService) {
    }

    @Post()
    async addUsers(@Body() user: UserEntity) {
        const generatedId = await this.service.insertUser(user);

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
