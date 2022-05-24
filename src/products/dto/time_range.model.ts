import { IsDateString, IsNotEmpty } from "class-validator";

export class TimeRangeDto {
  @IsDateString()
  @IsNotEmpty()
  fromDate: string;

  @IsDateString()
  @IsNotEmpty()
  toDate: string;
}
