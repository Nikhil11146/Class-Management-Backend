import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    rollNo: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        maxlength: [25, "Maximum length: 25"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: true,
        minlength: [8, "Password must be at least 8 characters"],
        select: false,
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['ROLE_ADMIN', 'ROLE_USER', "ROLE_MODERATOR"],
        default: 'ROLE_USER'
    }
}, {
    timestamps: true
})

userSchema.index({
    groupId: 1,
    role: 1
})

const UserModel = mongoose.model('User', userSchema);

export default UserModel;