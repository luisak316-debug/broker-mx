import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import * as auth from '../controllers/supervisor/auth.controller';
import * as clients from '../controllers/supervisor/clients.controller';
import * as advisors from '../controllers/supervisor/advisors.controller';
import * as contacts from '../controllers/supervisor/contacts.controller';
import * as managers from '../controllers/supervisor/managers.controller';

export const supervisorRouter = Router();

supervisorRouter.post('/auth/login', asyncHandler(auth.login));

supervisorRouter.use(requireAuth, requireRole('SUPERVISOR'));

supervisorRouter.get('/auth/me', asyncHandler(auth.me));
supervisorRouter.get('/clients', asyncHandler(clients.listClientsSummary));

supervisorRouter.get('/advisors', asyncHandler(advisors.listAdvisors));
supervisorRouter.post('/advisors', asyncHandler(advisors.createAdvisor));
supervisorRouter.get('/advisors/:id/phones', asyncHandler(advisors.listAdvisorPhones));
supervisorRouter.patch('/advisors/:id/phone', asyncHandler(advisors.updateAdvisorPhoneHandler));
supervisorRouter.patch('/advisors/:id/dates', asyncHandler(advisors.updateAdvisorDatesHandler));
supervisorRouter.delete('/advisors/:id', asyncHandler(advisors.removeAdvisor));

supervisorRouter.get('/managers', asyncHandler(managers.listManagers));

supervisorRouter.get('/contacts', asyncHandler(contacts.listContacts));
supervisorRouter.post('/contacts', asyncHandler(contacts.saveContact));
supervisorRouter.post('/contacts/bulk', asyncHandler(contacts.bulkAssignContacts));
supervisorRouter.post('/contacts/bulk/managers', asyncHandler(contacts.bulkAssignContactsToManagers));
supervisorRouter.post('/contacts/bulk/preview', asyncHandler(contacts.previewBulkContacts));
supervisorRouter.delete('/contacts/:id', asyncHandler(contacts.removeContact));
