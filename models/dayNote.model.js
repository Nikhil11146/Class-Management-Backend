import mongoose from 'mongoose';

const dayNoteSchema = new mongoose.Schema({
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    date: {
        // YYYY-MM-DD
        type: String,
        required: true,
        match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
    },
    note: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Note cannot exceed 500 characters']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// One broadcast note per (subject, group, date)
dayNoteSchema.index({ subjectId: 1, groupId: 1, date: 1 }, { unique: true });
dayNoteSchema.index({ groupId: 1 });

const DayNoteModel = mongoose.model('DayNote', dayNoteSchema);
export default DayNoteModel;
