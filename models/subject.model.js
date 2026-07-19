import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, "Maximum length: 50"]
    },
    code: {
        type: String,
        trim: true,
        uppercase: true,
        maxlength: [10, "Maximum length: 10"],
        default: ''
    },
    facultyName: {
        type: String,
        default: ''
    },
    credits: {
        type: Number,
        required: true,
        min: 0,
        max: 6
    },
    weeklyDays: {
        // 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
        type: [Number],
        default: []
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    }
}, {
    timestamps: true
})

subjectSchema.index({
    groupId: 1,
    name: 1
}, { unique: true })

const SubjectModel = mongoose.model('Subject', subjectSchema);

export default SubjectModel;