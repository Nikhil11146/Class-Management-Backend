import ApiError from "../classes/apiError.class.js";
import FacultyModel from "../models/faculty.model.js";
import GroupModel from "../models/group.model.js";
import SubjectModel from "../models/subject.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const getFacultiesController = (req, res, next) => {

}

export const getFacultyController = (req, res, next) => {

}

export const createFacultyController = async (req, res, next) => {
    try {
        const { name, dept } = req.body;

        if(!name || !dept) {
            throw new ApiError(400, "Missing required fields");
        }

        let faculty = await FacultyModel.findOne({ name });

        if(faculty) {
            throw new ApiError(400, "Faculty Already Exists");
        }

        faculty = await FacultyModel.create({ name, dept });

        res.status(201).send({
            success: true,
            message: "Faculty created successfully",
            data: {
                faculty: faculty
            }
        });
    } catch (e) {
        next(e);
    }
}

export const updateFacultyController = (req, res, next) => {

}

export const deleteFacultyController = (req, res, next) => {

}

export const uploadFacultyPhotoController = async (req, res, next) => {
    try {
        const { facultyId } = req.params;

        if (!req.file) {
            throw new ApiError(400, "Please upload a photo");
        }

        const faculty = await FacultyModel.findById(facultyId);
        if (!faculty) {
            throw new ApiError(404, "Faculty not found");
        }

        const result = await uploadToCloudinary(req.file.buffer, "cms/faculty");

        faculty.profilePhoto = result.secure_url;
        await faculty.save();

        res.status(200).send({
            success: true,
            message: "Faculty profile photo uploaded successfully",
            data: {
                profilePhoto: faculty.profilePhoto
            }
        });
    } catch (e) {
        next(e);
    }
}
