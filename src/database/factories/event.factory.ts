import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import { Event } from '../../events/event.entity';

const eventTemplates = [
  {
    name: 'Start of 1st Year/Master classes',
    description: 'Start of classes for 1st year and Master students.',
    startDate: '2025-09-22T09:00:00Z',
    endDate: null,
  },
  {
    name: 'Start of classes, others',
    description: 'Start of classes for all other students.',
    startDate: '2025-09-15T09:00:00Z',
    endDate: null,
  },
  {
    name: 'FEUP Project Week (1st year/Bachelor)',
    description:
      'A week dedicated to FEUP projects for 1st year Bachelor students.',
    startDate: '2025-09-15T09:00:00Z',
    endDate: '2025-09-19T18:00:00Z',
  },
  {
    name: 'New Masters Celebration',
    description: 'Celebration event for new Masters graduates.',
    startDate: '2025-11-22T17:00:00Z',
    endDate: null,
  },
  {
    name: 'FEUP Day',
    description: 'Annual FEUP Day celebration. Date to be defined.',
    startDate: null,
    endDate: null,
  },
  {
    name: 'FEUP and Staff Mobil. Week',
    description: 'Mobility week for FEUP staff and students.',
    startDate: '2025-10-27T09:00:00Z',
    endDate: '2025-10-31T18:00:00Z',
  },
  {
    name: 'Christmas Holidays',
    description: 'Christmas holiday break.',
    startDate: '2025-12-22T00:00:00Z',
    endDate: '2026-01-02T23:59:59Z',
  },
  {
    name: 'End of classes 1st Year/Bachelor',
    description: 'End of classes for 1st year Bachelor students.',
    startDate: '2026-01-09T18:00:00Z',
    endDate: null,
  },
  {
    name: 'End of classes, others',
    description: 'End of classes for all other students.',
    startDate: '2025-12-19T18:00:00Z',
    endDate: null,
  },
  {
    name: 'Exams, 1st Year/Bachelor',
    description: 'Exam period for 1st year Bachelor students.',
    startDate: '2026-01-12T09:00:00Z',
    endDate: '2026-02-06T18:00:00Z',
  },
  {
    name: 'Exams, others',
    description: 'Exam period for all other students.',
    startDate: '2026-01-05T09:00:00Z',
    endDate: '2026-02-06T18:00:00Z',
  },
  {
    name: 'Publication marks',
    description: 'Publication of marks for the semester.',
    startDate: '2026-02-20T10:00:00Z',
    endDate: null,
  },
  {
    name: 'Special examination period, completion of cycle of studies, 1st call',
    description: 'Special exam period for completion of studies (1st call).',
    startDate: '2026-03-02T09:00:00Z',
    endDate: '2026-03-13T18:00:00Z',
  },
  {
    name: 'Publication marks, special exam. completion of cycle of studies, 1st call',
    description:
      'Publication of marks for special exam (completion of studies, 1st call).',
    startDate: '2026-03-20T10:00:00Z',
    endDate: null,
  },
  {
    name: 'Special examination period, legally applicable status, 1st semester',
    description:
      'Special exam period for legally applicable status, 1st semester (until deadline).',
    startDate: null,
    endDate: '2026-04-30T23:59:59Z',
  },
  {
    name: 'Publication marks, special exam. legally applicable status, 1st semester',
    description:
      'Publication of marks for special exam, legally applicable status, 1st semester.',
    startDate: '2026-05-13T10:00:00Z',
    endDate: null,
  },
  {
    name: 'Start of classes',
    description: 'Start of classes for the 2nd semester.',
    startDate: '2026-02-18T09:00:00Z',
    endDate: null,
  },
  {
    name: 'Carnival Holidays',
    description: 'Carnival holiday break.',
    startDate: '2026-02-16T00:00:00Z',
    endDate: '2026-02-17T23:59:59Z',
  },
  {
    name: 'U.Porto Day',
    description: 'U.Porto Day celebration. Date to be defined.',
    startDate: null,
    endDate: null,
  },
  {
    name: 'Easter Holidays',
    description: 'Easter holiday break.',
    startDate: '2026-03-30T00:00:00Z',
    endDate: '2026-04-06T23:59:59Z',
  },
  {
    name: 'Academic and Staff mobil. week',
    description: 'Academic and staff mobility week.',
    startDate: '2026-05-04T09:00:00Z',
    endDate: '2026-05-08T18:00:00Z',
  },
  {
    name: 'End of classes',
    description: 'End of classes for the 2nd semester.',
    startDate: '2026-06-05T18:00:00Z',
    endDate: null,
  },
  {
    name: 'Exams',
    description: 'Exam period for the 2nd semester.',
    startDate: '2026-06-08T09:00:00Z',
    endDate: '2026-07-14T18:00:00Z',
  },
  {
    name: 'Publication marks',
    description: 'Publication of marks for the 2nd semester.',
    startDate: '2026-07-21T10:00:00Z',
    endDate: null,
  },
  {
    name: 'Special examination period, completion of cycle of studies, 2nd call',
    description: 'Special exam period for completion of studies (2nd call).',
    startDate: '2026-09-01T09:00:00Z',
    endDate: '2026-09-11T18:00:00Z',
  },
  {
    name: 'Publication marks, special exam. completion of cycle of studies, 2nd semester call',
    description:
      'Publication of marks for special exam (completion of studies, 2nd semester call).',
    startDate: '2026-09-18T10:00:00Z',
    endDate: null,
  },
  {
    name: 'Special examination period, legally applicable status, 2nd semester',
    description:
      'Special exam period for legally applicable status, 2nd semester (until deadline).',
    startDate: null,
    endDate: '2026-11-27T23:59:59Z',
  },
  {
    name: 'Publication of marks, special exam. legally applicable status, 2nd',
    description:
      'Publication of marks for special exam, legally applicable status, 2nd semester.',
    startDate: '2026-12-11T10:00:00Z',
    endDate: null,
  },
];

export default setSeederFactory(Event, () => {
  const template = faker.helpers.arrayElement(eventTemplates);

  const event = new Event();
  event.name = template.name;
  event.description = template.description;
  event.startDate = template.startDate ? new Date(template.startDate) : null;
  event.endDate = template.endDate ? new Date(template.endDate) : null;

  return event;
});
