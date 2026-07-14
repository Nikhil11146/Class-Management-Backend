import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [25, "Maximum length: 25"]
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        // required: true
    },
    credits: {
        type: Number,
        required: true,
        min: 0,
        max: 6
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