import Announcement from '../models/announcement.model.js';

export const createAnnouncement = async (req, res) => {
    try {
        const { title, category, content, date, time, author, groupId } = req.body;
        const newAnnouncement = new Announcement({
            title,
            category,
            content,
            date,
            time,
            author,
            groupId
        });
        await newAnnouncement.save();
        res.status(201).json(newAnnouncement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findById(id);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
        res.status(200).json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedAnnouncement) return res.status(404).json({ message: 'Announcement not found' });
        res.status(200).json(updatedAnnouncement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
        if (!deletedAnnouncement) return res.status(404).json({ message: 'Announcement not found' });
        res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
