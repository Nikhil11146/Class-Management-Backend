import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, "Please enter a valid email"]
    },
    otp: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
})

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });
otpSchema.index({ email: 1, createdAt: -1 })

const OtpModel = mongoose.model('Otp', otpSchema);

export default OtpModel;