import Announcement from '../models/announcement.model.js';

export const createAnnouncement = async (req, res) => {
    try {
        const { title, category, content, date, time } = req.body;
        const author = req.user._id;
        const groupId = req.user.groupId;

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
        await newAnnouncement.populate('author', 'name');

        const formatted = {
            ...newAnnouncement.toObject(),
            author: newAnnouncement.author ? newAnnouncement.author.name : 'Unknown'
        };

        res.status(201).json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({ groupId: req.user.groupId })
            .populate('author', 'name')
            .sort({ createdAt: -1 });

        const formattedAnnouncements = announcements.map(a => {
            const doc = a.toObject();
            return {
                ...doc,
                author: doc.author ? doc.author.name : 'Unknown'
            };
        });

        res.status(200).json(formattedAnnouncements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findOne({ _id: id, groupId: req.user.groupId }).populate('author', 'name');
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

        const formatted = {
            ...announcement.toObject(),
            author: announcement.author ? announcement.author.name : 'Unknown'
        };

        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedAnnouncement = await Announcement.findOneAndUpdate(
            { _id: id, groupId: req.user.groupId },
            req.body,
            { new: true }
        ).populate('author', 'name');

        if (!updatedAnnouncement) return res.status(404).json({ message: 'Announcement not found' });

        const formatted = {
            ...updatedAnnouncement.toObject(),
            author: updatedAnnouncement.author ? updatedAnnouncement.author.name : 'Unknown'
        };

        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAnnouncement = await Announcement.findOneAndDelete({ _id: id, groupId: req.user.groupId });
        if (!deletedAnnouncement) return res.status(404).json({ message: 'Announcement not found' });
        res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
