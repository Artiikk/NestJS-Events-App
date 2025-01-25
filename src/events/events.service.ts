import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { AttendeeAnswerEnum } from './attendee/attendee.entity';
import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { ListEvents, WhenEventFilter } from './input/list.events';
import { paginate, PaginateOptions } from '../pagination/paginator';
import { CreateEventDto } from './input/create-event.dto';
import { User } from '../auth/user.entity';
import { Event, PaginatedEvents } from './event.entity';
import { UpdateEventDto } from './input/update-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  private getEventsBaseQuery(): SelectQueryBuilder<Event> {
    return this.eventsRepository
      .createQueryBuilder('e')
      .orderBy('e.id', 'DESC');
  }

  public getEventsWithAttendeeCountQuery(): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap('e.attendeeCount', 'e.attendees') // ✅ Correct mapping
      .loadRelationCountAndMap(
        'e.attendeeAccepted',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.andWhere('attendee.answer = :answer', { answer: 'Accepted' }),
      )
      .loadRelationCountAndMap(
        'e.attendeeMaybe',
        'e.attendees',
        'attendee',
        (qb) => qb.andWhere('attendee.answer = :answer', { answer: 'Maybe' }),
      )
      .loadRelationCountAndMap(
        'e.attendeeRejected',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.andWhere('attendee.answer = :answer', { answer: 'Rejected' }),
      );
  }

  private getEventsWithAttendeeCountFilteredQuery(
    filter?: ListEvents,
  ): SelectQueryBuilder<Event> {
    let query = this.getEventsWithAttendeeCountQuery();

    if (filter?.when) {
      if (Number(filter.when) === WhenEventFilter.Today) {
        query = query.andWhere(
          'e.when >= CURDATE() AND e.when <= CURDATE() + INTERVAL 1 DAY',
        );
      } else if (Number(filter.when) === WhenEventFilter.Tomorrow) {
        query = query.andWhere(
          'e.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE() + INTERVAL 2 DAY',
        );
      } else if (Number(filter.when) === WhenEventFilter.ThisWeek) {
        query = query.andWhere('YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)');
      } else if (Number(filter.when) === WhenEventFilter.NextWeek) {
        query = query.andWhere(
          'YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1) + 1',
        );
      }
    }

    this.logger.debug(`Query: ${query.getSql()}`);

    return query;
  }

  public async getEventsWithAttendeeCountFilteredPaginated(
    filter: ListEvents,
    paginateOptions: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return await paginate(
      await this.getEventsWithAttendeeCountFilteredQuery(filter),
      paginateOptions,
    );
  }

  public async getEventWithAttendeeCount(
    id: number,
  ): Promise<Event | undefined> {
    const query = this.getEventsWithAttendeeCountQuery().andWhere(
      'e.id = :id',
      { id },
    );

    this.logger.debug(`Query: ${query.getSql()}`);

    return await query.getOne();
  }

  public async findOne(id: number): Promise<Event | undefined> {
    return await this.eventsRepository.findOneBy({ id });
  }

  public async deleteEvent(id: number): Promise<DeleteResult> {
    return await this.eventsRepository
      .createQueryBuilder('e')
      .delete()
      .where('e.id = :id', { id })
      .execute();
  }

  public async createEvent(input: CreateEventDto, user: User): Promise<Event> {
    return await this.eventsRepository.save(
      new Event({
        ...input,
        when: new Date(input.when),
        organizer: user,
      }),
    );
  }

  public async updateEvent(
    event: Event,
    input: UpdateEventDto,
  ): Promise<Event> {
    return await this.eventsRepository.save(
      new Event({
        ...event,
        ...input,
        when: input.when ? new Date(input.when) : event.when,
      }),
    );
  }

  public async getEventsOrganizedByUserIdPaginated(
    userId: number,
    paginateOptions: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return await paginate<Event>(
      await this.getEventsOrganizedByUserIdQuery(userId),
      paginateOptions,
    );
  }

  private getEventsOrganizedByUserIdQuery(
    userId: number,
  ): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery().where('e.organizerId = :userId', {
      userId,
    });
  }

  public async getEventsAttendedByUserIdPaginated(
    userId: number,
    paginateOptions: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return await paginate<Event>(
      await this.getEventsAttendedByUserIdQuery(userId),
      paginateOptions,
    );
  }

  private getEventsAttendedByUserIdQuery(
    userId: number,
  ): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery()
      .leftJoinAndSelect('e.attendees', 'a')
      .where('a.userId = :userId', {
        userId,
      });
  }
}
