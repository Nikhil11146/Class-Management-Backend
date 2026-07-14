import UserModel from '../models/user.model.js';
import OtpModel from '../models/otp.model.js';
import ApiError from "../classes/apiError.class.js";
import {sendOtpMail} from "../services/mail.services.js";
import bcrypt from "bcrypt";
import GroupModel from "../models/group.model.js";
import mongoose from "mongoose";

export const sendOtpController = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (await UserModel.exists({ email })) {
            throw new ApiError(409, "User already exists");
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const hashedOtp = await bcrypt.hash(otp, 10);

        await OtpModel.deleteOne({ email });
        await OtpModel.create({ email, otp: hashedOtp});

        await sendOtpMail(email, otp);

        res.status(200).send({
            success: true,
            message: "OTP sent successfully"
        })
    } catch (e) {
        next(e);
    }
}

export const registerController = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { rollNo, name, email, password, group, otp } = req.body;

        if (!rollNo || !name || !email || !password || !group || !otp || !group.dept || !group.year || !group.sec) {
            throw new ApiError(400, "Missing required fields");
        }

        if (await UserModel.exists({ email }).session(session) || await UserModel.exists({ rollNo }).session(session)) {
            throw new ApiError(409, "User already exists");
        }

        const dbOtp = await OtpModel.findOne({ email }).session(session);

        if (!dbOtp) {
            throw new ApiError(400, "OTP expired or not found");
        }

        const isOtpMatching = await bcrypt.compare(otp, dbOtp.otp);

        if(!isOtpMatching) {
            throw new ApiError(400, 'Incorrect OTP');
        }

        const dbGroup = await GroupModel.findOne(group).session(session);

        if (!dbGroup) {
            throw new ApiError(404, "Group not found");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await UserModel.findById(newUser._id).session(session);
        await OtpModel.deleteOne({ email }, { session });

        await session.commitTransaction();

        res.status(201).send({
            success: true,
            message: "User created successfully",
            data: {
                user: newUser,
            }
        })
    } catch (e) {
        await session.abortTransaction();
        next(e);
    } finally {
        await session.endSession()
    }
}

// name, email, password, group, role