import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: true,
    },
    dept: {
        type: String,
        required: true,
        enum: ['CSE', 'ECE', 'EEE', 'CIVIL', 'MECH', 'BIOTECH', 'CHEM']
    },
    sec: {
        type: String,
        required: true,
        enum: ["A", "B", "C", "D"],
    },
    moderatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
}, {
    timestamps: true
})

groupSchema.index(
    {
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