import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import {v1BaseUrl} from '../config/route';
import {BaseEntityInterface} from "../repositories/interface/base-entity.interface";
import {queryParams} from "../repositories/query.options";
import {ContainerService} from "../services/container.service";
import {ContainerDto} from "../dto/container.dto";

/**
 * Container controller
 * the prefix is defined in domain constant
 */
const domain = 'containers';
const baseURL = v1BaseUrl(domain);

@Controller(baseURL)
export class ContainerController {
    constructor(readonly service: ContainerService) {
    }

    @Get()
    findAll(@Query() query): Promise<BaseEntityInterface[]> {
        const options = queryParams(query);
        return this.service.find(options);
    }

    @Get(':id')
    find(@Param() params, @Query() query): Promise<BaseEntityInterface> {
        const id = params.id;
        const options = queryParams(query);
        return this.service.findOne(id, options);
    }

    @Post()
    create(@Body() containerDto: ContainerDto): Promise<BaseEntityInterface> {
        return this.service.create(containerDto)
    }
}
