import {Get, Post, Patch, Body, Param, Controller, Query} from '@nestjs/common';
import {v1BaseUrl} from '../config/route';
import {PotDto} from '../dto/pot.dto';
import {BaseEntityInterface} from '../repositories/interface/base-entity.interface';
import {PotService} from '../services/pot.service';
import {queryParams} from '../repositories/query.options';

/**
 * Pot controller
 * the prefix is defined in domain constant
 */
const domain = 'pots';
const baseURL = v1BaseUrl(domain);

@Controller(baseURL)
export class PotController {

    constructor(private readonly potService: PotService) {
    }

    @Get()
    findAll(@Query() query): Promise<BaseEntityInterface[]> {
        const options = queryParams(query);
        return this.potService.find(options);
    }

    @Get(':id')
    find(@Param() params, @Query() query): Promise<BaseEntityInterface> {
        const id = params.id;
        const options = queryParams(query);
        return this.potService.findOne(id, options);
    }

    @Post()
    create(@Body() createPotDto: PotDto): Promise<BaseEntityInterface> {
        return this.potService.create(createPotDto);
    }

    @Patch(':id')
    update(@Param() params, @Body() updatePotDto: PotDto): Promise<BaseEntityInterface> {
        const id = params.id;
        return this.potService.update(id, updatePotDto);
    }
}
