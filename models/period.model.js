import mongoose from "mongoose";

const periodSchema = new mongoose.Schema({
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
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

periodSchema.index({
    groupId: 1,
    date: 1
})

periodSchema.index({
    subjectId: 1,
    date: 1
});

const PeriodModel = mongoose.model('Period', periodSchema);

export default PeriodModel;