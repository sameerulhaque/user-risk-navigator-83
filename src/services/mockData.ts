
// Add the following to the existing mockData.ts file

import { VersionHistory } from '@/types/risk';

// Mock version history data
export const mockVersionHistory: VersionHistory[] = [
  {
    id: 1,
    entityType: 'configuration',
    entityId: 1,
    version: '1.0.0',
    timestamp: '2023-05-20T10:30:00Z',
    changes: 'Initial configuration created',
    userId: 1,
    userName: 'Admin User'
  },
  {
    id: 2,
    entityType: 'configuration',
    entityId: 1,
    version: '1.0.1',
    timestamp: '2023-05-21T14:15:00Z',
    changes: 'Updated section weightages',
    userId: 1,
    userName: 'Admin User'
  },
  {
    id: 3,
    entityType: 'configuration',
    entityId: 1,
    version: '1.0.2',
    timestamp: '2023-05-22T09:45:00Z',
    changes: 'Modified field condition scores',
    userId: 2,
    userName: 'Configuration Manager'
  },
  {
    id: 4,
    entityType: 'configuration',
    entityId: 2,
    version: '1.0.0',
    timestamp: '2023-05-23T11:20:00Z',
    changes: 'Created configuration for Company B',
    userId: 1,
    userName: 'Admin User'
  },
  {
    id: 5,
    entityType: 'submission',
    entityId: 1,
    version: '1.0.0',
    timestamp: '2023-05-25T15:30:00Z',
    changes: 'Initial submission',
    userId: 3,
    userName: 'John Smith'
  },
  {
    id: 6,
    entityType: 'submission',
    entityId: 1,
    version: '1.0.1',
    timestamp: '2023-05-26T10:15:00Z',
    changes: 'Updated status to Approved',
    userId: 1,
    userName: 'Admin User'
  },
  {
    id: 7,
    entityType: 'submission',
    entityId: 2,
    version: '1.0.0',
    timestamp: '2023-05-27T14:45:00Z',
    changes: 'Initial submission',
    userId: 4,
    userName: 'Jane Doe'
  },
  {
    id: 8,
    entityType: 'submission',
    entityId: 2,
    version: '1.0.1',
    timestamp: '2023-05-28T09:30:00Z',
    changes: 'Updated status to Rejected',
    userId: 2,
    userName: 'Configuration Manager'
  },
  {
    id: 9,
    entityType: 'configuration',
    entityId: 1,
    version: '1.1.0',
    timestamp: '2023-06-01T11:00:00Z',
    changes: 'Major update to risk scoring algorithm',
    userId: 1,
    userName: 'Admin User'
  },
  {
    id: 10,
    entityType: 'configuration',
    entityId: 3,
    version: '1.0.0',
    timestamp: '2023-06-05T16:20:00Z',
    changes: 'Created configuration for Company C',
    userId: 2,
    userName: 'Configuration Manager'
  }
];
