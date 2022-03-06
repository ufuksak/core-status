import {Body, Controller, Get, Post} from "@nestjs/common";
import {ChannelDto} from "../dto/channel.model";
import {ApiService} from "../services/api";

@Controller('/api/v1/channel')
export class ChannelController {

    constructor(private service: ApiService) {
    }

    @Post()
    async createChannel(@Body() channel: ChannelDto) {
        await this.service.createChannel(channel);
    }

    @Get()
    async getChannels(page: number = 1, perPage: number = 20) {
        await this.service.getChannels(page, perPage);
    }

    @Get('/counters')
    async getChannelCounter(page: number = 1, perPage: number = 100) {
        await this.service.getCounters(page, perPage);
    }
}
