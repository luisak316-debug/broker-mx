import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import * as auth from '../controllers/advisor/auth.controller';
import * as advisorContacts from '../controllers/admin/advisorContacts.controller';
import * as calls from '../controllers/admin/calls.controller';
import * as telephony from '../controllers/advisor/telephony.controller';

export const advisorRouter = Router();

advisorRouter.post('/auth/login', asyncHandler(auth.login));

advisorRouter.use(requireAuth, requireRole('ADVISOR'));

advisorRouter.get('/auth/me', asyncHandler(auth.me));
advisorRouter.get('/my-contacts', asyncHandler(advisorContacts.listMyAssignedContacts));
advisorRouter.get('/telephony/webrtc-config', asyncHandler(telephony.getWebRtcConfig));
advisorRouter.post('/contacts/:id/call-dial', asyncHandler(calls.getContactDialString));
