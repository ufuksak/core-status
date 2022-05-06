import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import {Injectable, InternalServerErrorException} from "@nestjs/common";
import {StreamTypeRepository} from "../repositories/stream_type.repository";

@Injectable()
@ValidatorConstraint({ name: 'StreamTypeAvailable', async: true })
export class StreamTypeNotExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly streamTypeRepo: StreamTypeRepository) {}

  async validate(type: string, args: ValidationArguments) {
    try {
      const maybeFound = await this.streamTypeRepo.findOne({
        where: {
          type
        }
      });

      const shouldBe = args.constraints[0];
      return shouldBe ? !!maybeFound : !maybeFound;
    } catch (e) {
      throw new InternalServerErrorException();
    }
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