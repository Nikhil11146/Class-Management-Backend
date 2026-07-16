import UserModel from '../models/user.model.js';
import ApiError from "../classes/apiError.class.js";
import { uploadToCloudinary } from '../utils/cloudinary.js';

export const uploadProfilePhotoController = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError(400, "Please upload a photo");
        }

        const result = await uploadToCloudinary(req.file.buffer, "cms/profiles");

        const user = await UserModel.findByIdAndUpdate(
            req.user._id,
            { profilePhoto: result.secure_url },
            { new: true }
        );

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
        const user = await UserModel.findById(req.user._id);
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
        const { name } = req.body;
        
        const user = await UserModel.findByIdAndUpdate(
            req.user._id,
            { name },
            { new: true, runValidators: true }
        );

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
