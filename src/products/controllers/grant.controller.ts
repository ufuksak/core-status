import {Get, Post, Patch, Body, Param, Controller, Query, Delete} from '@nestjs/common';
import {v1BaseUrl} from '../config/route';
import {GrantDto} from '../dto/grant.model';
import {BaseEntityInterface} from '../repositories/interface/base-entity.interface';
import {queryParams} from '../repositories/query.options';
import {GrantStreamService} from "../services/grant_stream.service";

/**
 * Grant controller
 * the prefix is defined in domain constant
 */
const domain = 'status/data';
const baseURL = v1BaseUrl(domain);

@Controller(baseURL)
export class GrantController {

    constructor(readonly grantService: GrantStreamService) {
    }

    @Get()
    findAll(@Query() query): Promise<BaseEntityInterface[]> {
        const options = queryParams(query);
        return this.grantService.find(options);
    }

    @Post()
    create(@Body() createDto: GrantDto): Promise<BaseEntityInterface> {
        return this.grantService.create(createDto);
    }

    @Patch(':id')
    update(@Param() params, @Body() updateDto: GrantDto): Promise<BaseEntityInterface> {
        const id = params.id;
        return this.grantService.update(id, updateDto);
    }
}
