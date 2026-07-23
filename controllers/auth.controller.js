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
        const { email, flow } = req.body;

        if (!email) {
            throw new ApiError(400, "Email is required");
        }

        if (flow === 'forgot-password') {
            const userExists = await UserModel.exists({ email });
            if (!userExists) {
                throw new ApiError(404, "Email is not registered");
            }
        } else if (flow === 'signup') {
            const userExists = await UserModel.exists({ email });
            if (userExists) {
                throw new ApiError(409, "Email is already registered");
            }
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
        const { rollNo, name, email, password, group, otp, isSelf, clg } = req.body;

        const isSelfBool = isSelf === true || isSelf === 'true';

        if (!rollNo || !name || !email || !password || !otp || !clg) {
            throw new ApiError(400, "Missing required fields");
        }

        if (!isSelfBool && (!group || !group.dept || !group.year || !group.sec)) {
            throw new ApiError(400, "Missing required group fields");
        }

        if (rollNo.toString().trim().length !== 6) {
            throw new ApiError(400, "Roll number must be exactly 6 digits");
        }

        if (await UserModel.exists({ email }).session(session)) {
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

        let dbGroup;
        
        if (isSelfBool) {
            // Self-managed users get their own unique group and act as the moderator
            const clgUpper = clg.trim().toUpperCase();
            dbGroup = await GroupModel.findOne({
                clg: clgUpper,
                year: new Date().getFullYear(),
                dept: 'SELF',
                sec: email.trim().toLowerCase()
            }).session(session);

            if (!dbGroup) {
                dbGroup = new GroupModel({
                    clg: clgUpper,
                    year: new Date().getFullYear(),
                    dept: 'SELF',
                    sec: email.trim().toLowerCase()
                });
                await dbGroup.save({ session });
            }
        } else {
            dbGroup = await GroupModel.findOne({ ...group, clg: clg.trim().toUpperCase() }).session(session);
            if (!dbGroup) {
                dbGroup = new GroupModel({
                    clg: clg.trim().toUpperCase(),
                    year: Number(group.year),
                    dept: group.dept,
                    sec: group.sec
                });
                await dbGroup.save({ session });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new UserModel({
            rollNo,
            name,
            email,
            password: hashedPassword,
            groupId: dbGroup._id,
            role: isSelfBool ? "ROLE_MODERATOR" : "ROLE_USER"
        });
        await newUser.save({ session });
        
        if (isSelfBool) {
            dbGroup.moderatorId = newUser._id;
            await dbGroup.save({ session });
        }

        await OtpModel.deleteOne({ email }, { session });

        const token = jwt.sign({userId: newUser._id, role: newUser.role, tokenVersion: 1}, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN})

        let userObj = newUser.toObject();
        userObj.password = undefined;
        if (dbGroup) {
            userObj.groupId = `${dbGroup.year} ${dbGroup.dept} ${dbGroup.sec}`;
        }

        await session.commitTransaction();
        await session.endSession()

        res.status(201).send({
            success: true,
            message: "User created successfully",
            data: {
                token: token,
                user: userObj,
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

        const user = await UserModel.findOne({ email }).populate('groupId').select("+password");

        if(!user) {
            throw new ApiError(404, "Email is not registered");
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password);
        if(!isCorrectPassword) {
            throw new ApiError(401, "Incorrect password");
        }

        const token = jwt.sign({userId: user._id, role: user.role, tokenVersion: user.tokenVersion}, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN});
        
        let userObj = user.toObject();
        userObj.password = undefined;
        if (userObj.groupId && typeof userObj.groupId === 'object') {
            userObj.groupId = `${userObj.groupId.year} ${userObj.groupId.dept} ${userObj.groupId.sec}`;
        }

        res.status(200).send({
            success: true,
            message: "Signed In successfully",
            data: {
                token: token,
                user: userObj
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

export const verifyOtpController = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            throw new ApiError(400, "Missing required fields");
        }


        const dbOtp = await OtpModel.findOne({ email });

        if (!dbOtp) {
            throw new ApiError(400, "OTP expired or not found");
        }

        const isOtpMatching = await bcrypt.compare(otp, dbOtp.otp);

        if(!isOtpMatching) {
            throw new ApiError(400, 'Incorrect OTP');
        }

        res.status(201).send({
            success: true,
            message: "OTP Verified Successfully"
        })
    } catch (e) {
        next(e);
    }
}

export const getCollegesController = async (req, res, next) => {
    try {
        const query = req.query.search ? req.query.search.trim().toUpperCase() : '';
        const regex = new RegExp(query, 'i');
        
        const colleges = await GroupModel.find({ clg: regex }).distinct('clg');
        
        res.status(200).send({
            success: true,
            message: "Colleges fetched successfully",
            data: {
                colleges
            }
        });
    } catch (e) {
        next(e);
    }
}