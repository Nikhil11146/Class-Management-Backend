import { Router } from 'express';
import { 
    createAnnouncement, 
    getAnnouncements, 
    getAnnouncementById, 
    updateAnnouncement, 
    deleteAnnouncement 
} from '../controllers/announcement.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { modAuthMiddleware } from '../middlewares/modauth.middleware.js';

const announcementRouter = Router();

announcementRouter.get('/', authMiddleware, getAnnouncements);
announcementRouter.get('/:id', authMiddleware, getAnnouncementById);

announcementRouter.post('/', authMiddleware, modAuthMiddleware, createAnnouncement);
announcementRouter.put('/:id', authMiddleware, modAuthMiddleware, updateAnnouncement);
announcementRouter.delete('/:id', authMiddleware, modAuthMiddleware, deleteAnnouncement);

export default announcementRouter;