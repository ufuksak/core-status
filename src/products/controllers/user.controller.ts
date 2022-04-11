import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Param,
  Post,
} from "@nestjs/common";
import { UserService } from "../services/user.service";
import { StatusRequestBody, StatusResponseBody } from "../dto/status.model";
import { StatusService } from "../services/status.service";
import { UserDto } from "../dto/user.model";
import { UploadService } from "../services/upload.service";
import { StatusEntity } from "../entity/status.entity";

@Controller("/api/v1/users")
export class UserController {
  constructor(
    private userService: UserService,
    private statusService: StatusService,
    private readonly uploadService: UploadService
  ) {}

  @Post()
  async addUsers(@Body() user: UserDto) {
    const generatedId = await this.userService.insertUser(user);

    return { id: generatedId };
  }

  @Get()
  getUsers() {
    return this.userService.getAllUsers();
  }

  @Get("/:id")
  getUserById(@Param("id") id: string) {
    return this.userService.getUserById(id);
  }

  @Get("/:id/statuses")
  getUserStatuses(@Param("id") id: string) {
    return this.userService.getUserStatuses(id);
  }

  @Delete("/:id")
  async deleteUser(@Param("id") id: string) {
    const user = await this.userService.getUserById(id, {
      relations: ["fileList"],
    });
    await this.uploadService.deleteManyFromS3(user.fileList);
    await this.statusService.delete(id);

    return this.userService.deleteUser(id);
  }

  @Put("/:id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body() body: StatusRequestBody
  ): Promise<StatusResponseBody> {
    const { status_updates } = body;

    const saveStatus = await this.statusService.save(id, status_updates);

    return {
      status_updates: saveStatus,
    };
  }
}
