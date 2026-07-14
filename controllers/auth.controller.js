import UserModel from '../models/user.model.js';
import OtpModel from '../models/otp.model.js';
import ApiError from "../classes/apiError.class.js";
import {sendOtpMail} from "../services/mail.services.js";
import bcrypt from "bcrypt";
import GroupModel from "../models/group.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

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

        const newUser = new UserModel({
            rollNo,
            name,
            email,
            password: hashedPassword,
            groupId: dbGroup._id,
            role: "ROLE_USER"
        });
        await newUser.save({ session });
        await OtpModel.deleteOne({ email }, { session });

        const token = jwt.sign({userId: newUser._id, role: newUser.role, tokenVersion: 1}, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN})

        newUser.password = null;

        await session.commitTransaction();
        await session.endSession()

        res.status(201).send({
            success: true,
            message: "User created successfully",
            data: {
                token: token,
                user: newUser,
            }
        })
    } catch (e) {
        await session.abortTransaction();
        await session.endSession()
        next(e);
    }
}

export const logInController = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }

        const user = await UserModel.findOne({ email }).select("+password");

        if(!user) {
            throw new ApiError(401, "Incorrect email or password");
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password);
        if(!isCorrectPassword) {
            throw new ApiError(401, "Incorrect email or password");
        }

        const token = jwt.sign({userId: user._id, role: user.role, tokenVersion: user.tokenVersion}, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN});
        user.password = null;

        res.status(200).send({
            success: true,
            message: "Signed In successfully",
            data: {
                token: token,
                user: user
            }
        })
    } catch (e) {
        next(e);
    }
}

export const logoutAllController = async (req, res, next) => {
    try {
        let user = await UserModel.findById(req.user._id);

        user.tokenVersion += 1;
        await user.save();

        res.status(200).send({
            success: true,
            message: "Logged Out of all devices successfully"
        })
    } catch (e) {
        next(e);
    }
}

export const forgotPasswordController = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            throw new ApiError(400, "Missing required fields");
        }

        const user = await UserModel.findOne({ email }).session(session).select("+password");

        if (!user) {
            throw new ApiError(401, "Incorrect email or password");
        }

        const dbOtp = await OtpModel.findOne({ email }).session(session);
        if (!dbOtp || !(await bcrypt.compare(otp, dbOtp.otp))) {
            throw new ApiError(401, "Incorrect or Expired OTP");
        }

        user.password = await bcrypt.hash(password, 10);
        await OtpModel.deleteOne({ email }, { session });
        user.tokenVersion += 1;
        await user.save({ session });

        await session.commitTransaction();
        res.status(200).send({
            success: true,
            message: "Updated Password"
        })
    } catch (e) {
        await session.abortTransaction();
        next(e);
    } finally {
        await session.endSession()
    }
}