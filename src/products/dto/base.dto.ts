import {IsEmpty, IsDateString} from 'class-validator';
import {BaseEntityInterface} from '../repositories/interface/base-entity.interface';

export class BaseDto implements BaseEntityInterface {

    @IsEmpty()
    id: string;

    @IsDateString()
    created_at: string;

    @IsDateString()
    updated_at: string;

}
