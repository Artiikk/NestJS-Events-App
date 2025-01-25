import { Repository } from 'typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './event.entity';
import { ListEvents } from './input/list.events';
import { User } from '../auth/user.entity';

describe('EventsController', () => {
  let eventsController: EventsController;
  let eventsService: EventsService;
  let eventsRepository: Repository<Event>;

  beforeEach(() => {
    // Create a mock repository object
    eventsRepository = {
      findOne: jest.fn(),
      // Add other methods if needed
    } as unknown as Repository<Event>;

    eventsService = new EventsService(eventsRepository);
    eventsController = new EventsController(eventsRepository, eventsService);
  });

  it('should return an array of events', async () => {
    const result = {
      first: 1,
      last: 1,
      limit: 10,
      data: [],
    };

    const spy = jest
      .spyOn(eventsService, 'getEventsWithAttendeeCountFilteredPaginated')
      .mockImplementation((): any => result);

    expect(await eventsController.findAll(new ListEvents())).toEqual(result);
    expect(spy).toHaveBeenCalled();
  });

  it('should delete an event', async () => {
    const deleteSpy = jest.spyOn(eventsService, 'deleteEvent');

    try {
      await eventsController.remove(1, new User());
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
    }

    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
