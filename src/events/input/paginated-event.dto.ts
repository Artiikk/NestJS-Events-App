import { Event } from '../event.entity';
import { Expose, Type } from 'class-transformer';

export class PaginatedEventsDto {
  @Expose()
  first: number;

  @Expose()
  last: number;

  @Expose()
  limit: number;

  @Expose()
  total?: number;

  @Expose()
  @Type(() => Event)
  data: Event[];
}
