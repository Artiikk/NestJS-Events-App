import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  // UsePipes,
  // ValidationPipe,
} from '@nestjs/common';
import { CreateEventDto } from './input/create-event.dto';
import { UpdateEventDto } from './input/update-event.dto';
import { Event } from './event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, MoreThan, Repository } from 'typeorm';
import { Attendee } from './attendee/attendee.entity';
import { EventsService } from './events.service';
import { ListEvents } from './input/list.events';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { AuthGuardJwt } from 'src/auth/guards/auth-guard.jwt';
import { PaginatedEventsDto } from './input/paginated-event.dto';
import { plainToInstance } from 'class-transformer';

@Controller('/events')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
    @Inject(EventsService)
    private readonly eventsService: EventsService,
  ) {}

  // will populate the missing values with the defaults
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Query() filter: ListEvents): Promise<PaginatedEventsDto> {
    this.logger.log('Hit the findAll route');
    // const events = await this.repository.find();
    const events =
      await this.eventsService.getEventsWithAttendeeCountFilteredPaginated(
        filter,
        { total: true, currentPage: filter.page, limit: 2 },
      );

    if (!events) {
      throw new NotFoundException();
    }

    return plainToInstance(PaginatedEventsDto, events);
  }

  @Get('/practice')
  async practice() {
    return await this.repository.find({
      select: ['id', 'when'],
      where: [
        { id: MoreThan(3), when: MoreThan(new Date('2021-02-12T13:00:00')) },
        { description: Like('%meet%') },
      ],
      take: 2,
      order: { id: 'DESC' },
    });
  }

  @Get('/practice2')
  async practice2() {
    // return await this.repository.findOne({
    //   where: { id: 1 },
    //   relations: ['attendees'],
    // });

    // const event = new Event();
    // event.id = 1;

    const event = await this.repository.findOne({
      where: { id: 1 },
      relations: ['attendees'],
    });

    const attendee = new Attendee();

    // attendee.event = event;

    event.attendees.push(attendee);
    event.attendees = [];

    // await this.attendeeRepository.save(attendee);

    await this.repository.save(event);

    return event;
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventsService.getEventWithAttendeeCount(id);

    if (!event) {
      throw new NotFoundException();
    }

    return event;
  }

  // @UsePipes(new ValidationPipe({ groups: ['create'] }))
  @Post()
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() input: CreateEventDto, @CurrentUser() user: User) {
    return await this.eventsService.createEvent(input, user);
  }

  // @UsePipes(new ValidationPipe({ groups: ['update'] }))
  @Patch(':id')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id', ParseIntPipe) id,
    @Body() input: UpdateEventDto,
    @CurrentUser() user: User,
  ) {
    const event = await this.eventsService.findOne(id);

    if (!event) {
      throw new NotFoundException();
    }

    if (event.organizerId !== user.id) {
      throw new ForbiddenException(
        null,
        'You are not the authorized to change this event',
      );
    }

    return await this.eventsService.updateEvent(event, input);
  }

  @Delete(':id')
  @UseGuards(AuthGuardJwt)
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id, @CurrentUser() user: User) {
    const event = await this.eventsService.findOne(id);

    if (!event) {
      throw new NotFoundException();
    }

    if (event.organizerId !== user.id) {
      throw new ForbiddenException(
        null,
        'You are not the authorized to change this event',
      );
    }

    await this.eventsService.deleteEvent(id);
  }
}
