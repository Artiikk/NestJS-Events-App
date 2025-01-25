import { Event } from './event.entity';

test('Event should be initialized through constructor', () => {
  const event = new Event({
    name: 'Some event',
    description: 'Description of the event',
  });

  expect(event).toEqual({
    name: 'Some event',
    description: 'Description of the event',
    id: undefined,
    when: undefined,
    address: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    organizer: undefined,
    attendees: undefined,
    organizedId: undefined,
    event: undefined,
    attendeeCount: undefined,
    attendeeRejected: undefined,
    attendeeMaybe: undefined,
    attendeeAccepted: undefined,
  });
});
