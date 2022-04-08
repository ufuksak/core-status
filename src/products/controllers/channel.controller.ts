import {Body, Controller, Get, Post, Request} from "@nestjs/common";
import {AddChannelBody, ChannelWithParticipants} from "../dto/channel.model";
import {ApiService} from "../services/api";
import {ChannelPublisher} from "../rabbit/channel.publisher";

@Controller('/api/v1/channel')
export class ChannelController {

    constructor(
        private service: ApiService) {}

    @Post()
    async createChannel(
        @Request() req,
        @Body() channel: AddChannelBody): Promise<ChannelWithParticipants> {
        return this.service.createChannel(req.headers.authorization, channel);
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
