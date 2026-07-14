import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
})

announcementSchema.index({
    groupId: 1,
    createdAt: -1
});

const announcementModel = mongoose.model('Announcement', announcementSchema);

export default announcementModel;