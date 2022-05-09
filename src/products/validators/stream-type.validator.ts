import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import {ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException} from "@nestjs/common";
import {StreamTypeRepository} from "../repositories/stream_type.repository";

@Injectable()
@ValidatorConstraint({ name: 'StreamTypeAvailable', async: true })
export class StreamTypeNotExistsRule implements ValidatorConstraintInterface {
  private logger = new Logger(StreamTypeNotExistsRule.name);
  constructor(
    private readonly streamTypeRepo: StreamTypeRepository
  ) {}

  async validate(type: string, args: ValidationArguments) {
    let maybeFound = null;
    try {
      maybeFound = await this.streamTypeRepo.findOne({
        where: {
          type
        }
      });
    } catch (e) {
      this.logger.error(`stream type db error ${e}`);
      throw new InternalServerErrorException();
    }

    const shouldBe = args.constraints[0];
    if(shouldBe) {
      if(!maybeFound) {
        throw new NotFoundException('stream type not found');
      }
    } else {
      if(maybeFound) {
        throw new ConflictException('stream already exists');
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    if(args.constraints[0] === true) {
      return `stream type does not exist`;
    } else {
      return `stream type exists`;
    }
  }
}

export function StreamTypeAvailable(available: boolean, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'UserExists',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [available],
      options: validationOptions,
      validator: StreamTypeNotExistsRule,
    });
  };
}