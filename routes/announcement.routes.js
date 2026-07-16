import { Router } from 'express';
import { 
    createAnnouncement, 
    getAnnouncements, 
    getAnnouncementById, 
    updateAnnouncement, 
    deleteAnnouncement 
} from '../controllers/announcement.controller.js';

const announcementRouter = Router();

announcementRouter.post('/', createAnnouncement);
announcementRouter.get('/', getAnnouncements);
announcementRouter.get('/:id', getAnnouncementById);
announcementRouter.put('/:id', updateAnnouncement);
announcementRouter.delete('/:id', deleteAnnouncement);

export default announcementRouter;