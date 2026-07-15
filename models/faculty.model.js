import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [25, "Maximum length: 25"]
    },
    dept: {
        type: String,
        required: true,
        enum: ['CSE', 'ECE', 'EEE', 'CIVIL', 'MECH', 'BIOTECH', 'CHEM']
    },
    profilePhoto: {
        type: String,
        default: null
    }
}, {
    timestamps: true
})

facultySchema.index({
    dept: 1,
    name: 1
})

const FacultyModel = mongoose.model('Faculty', facultySchema);

export default FacultyModel;