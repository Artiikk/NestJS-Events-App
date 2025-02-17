import {
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Query,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events-organized-by-user/:userId')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsOrganizedByUserController {
  private readonly logger = new Logger(EventsOrganizedByUserController.name);

  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
  ) {
    return await this.eventsService.getEventsOrganizedByUserIdPaginated(
      userId,
      { currentPage: page, limit: 5 },
    );
  }
}
