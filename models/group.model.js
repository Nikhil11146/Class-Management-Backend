import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    clg: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    year: {
        type: Number,
        required: true,
    },
    dept: {
        type: String,
        required: true,
        enum: ['CSE', 'ECE', 'EEE', 'CIVIL', 'MEC', 'BTH', 'CHEM', 'SELF']
    },
    sec: {
        type: String,
        required: true
    },
    moderatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}, {
    timestamps: true
})

groupSchema.index(
    {
        clg: 1,
        year: 1,
        dept: 1,
        sec: 1
    },
    {
        unique: true
    }
);

const GroupModel = mongoose.model('Group', groupSchema);

export default GroupModel;