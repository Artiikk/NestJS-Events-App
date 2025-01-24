import { IsEnum } from 'class-validator';
import { AttendeeAnswerEnum } from '../attendee/attendee.entity';

export class CreateAttendeeDto {
  @IsEnum(AttendeeAnswerEnum)
  answer: AttendeeAnswerEnum;
}
