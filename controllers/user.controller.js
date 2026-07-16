import UserModel from '../models/user.model.js';
import GroupModel from '../models/group.model.js';
import ApiError from "../classes/apiError.class.js";
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import bcrypt from "bcrypt";

export const uploadProfilePhotoController = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError(400, "Please upload a photo");
        }

        // Fetch the current user to get their old photo URL
        const currentUser = await UserModel.findById(req.user._id).select('profilePhoto');
        const oldPhotoUrl = currentUser?.profilePhoto;

        const result = await uploadToCloudinary(req.file.buffer, "cms/profiles");

        const user = await UserModel.findByIdAndUpdate(
            req.user._id,
            { profilePhoto: result.secure_url },
            { new: true }
        );

        // Delete the old Cloudinary asset (fire-and-forget)
        if (oldPhotoUrl) {
            deleteFromCloudinary(oldPhotoUrl);
        }

        res.status(200).send({
            success: true,
            message: "Profile photo uploaded successfully",
            data: {
                profilePhoto: user.profilePhoto
            }
        });
    } catch (e) {
        next(e);
    }
}

export const getProfileController = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user._id).populate('groupId');
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        res.status(200).send({
            success: true,
            message: "Profile retrieved successfully",
            data: {
                user
            }
        });
    } catch (e) {
        next(e);
    }
};

export const updateProfileController = async (req, res, next) => {
    try {
        const { name, rollNo, profilePhoto, group } = req.body;
        
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (profilePhoto !== undefined) updateFields.profilePhoto = profilePhoto;
        if (rollNo !== undefined) {
            const parsed = Number(rollNo);
            if (isNaN(parsed)) {
                throw new ApiError(400, "rollNo must be a valid number");
            }
            updateFields.rollNo = parsed;
        }

        // Update group reference if group data is provided
        if (group && group.year && group.dept && group.sec) {
            const allowedDepts = ['CSE', 'EEE', 'ECE', 'MME', 'MEC', 'BTH', 'CHEM', 'CIVIL'];
            if (!allowedDepts.includes(group.dept.toUpperCase())) {
                throw new ApiError(400, `Invalid department. Must be one of: ${allowedDepts.join(', ')}`);
            }
            // Find or create the group document
            let dbGroup = await GroupModel.findOne({
                year: Number(group.year),
                dept: group.dept.toUpperCase(),
                sec: group.sec.toUpperCase(),
            });
            if (!dbGroup) {
                dbGroup = await GroupModel.create({
                    year: Number(group.year),
                    dept: group.dept.toUpperCase(),
                    sec: group.sec.toUpperCase(),
                });
            }
            updateFields.groupId = dbGroup._id;
        }

        const user = await UserModel.findByIdAndUpdate(
            req.user._id,
            updateFields,
            { new: true, runValidators: true }
        ).populate('groupId');

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        res.status(200).send({
            success: true,
            message: "Profile updated successfully",
            data: {
                user
            }
        });
    } catch (e) {
        next(e);
    }
};

export const changePasswordController = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            throw new ApiError(400, "currentPassword and newPassword are required");
        }

        const user = await UserModel.findById(req.user._id).select("+password");
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (!user.password) {
            throw new ApiError(400, "Password not set for this account. Please use 'Forgot Password' to set a new one.");
        }

        const isCorrectPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isCorrectPassword) {
            throw new ApiError(400, "Incorrect current password");
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).send({
            success: true,
            message: "Password changed successfully"
        });
    } catch (e) {
        next(e);
    }
};
