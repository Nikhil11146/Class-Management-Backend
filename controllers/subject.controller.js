import ApiError from "../classes/apiError.class.js";
import GroupModel from "../models/group.model.js";
import SubjectModel from "../models/subject.model.js";

const SUBJECT_POPULATE = [
    {
        path: "groupId",
        select: "year dept sec"
    }
];

export const getSubjectController = async (req, res, next) => {
    try {
        const subjectId = req.params.subjectId;

        const subject = await SubjectModel.findById(subjectId);

        if(!subject) {
            throw new ApiError(404, "Subject not found");
        }

        if(!subject.groupId.equals(req.user.groupId)) {
            throw new ApiError(403, "Forbidden");
        }

        await subject.populate(SUBJECT_POPULATE);

        res.status(200).send({
            success: true,
            message: "Subject Found",
            data: {
                subject: subject
            }
        });
    } catch(e) {
        next(e);
    }
}

export const getSubjectsController = async (req, res, next) => {
    try {
        const subjects = await SubjectModel.find({ groupId: req.user.groupId }).populate(SUBJECT_POPULATE);

        res.status(200).send({
            success: true,
            message: "Subjects Found",
            data: {
                subjects: subjects
            }
        });
    } catch(e) {
        next(e);
    }
}

export const createSubjectController = async (req, res, next) => {
    try {
        const { name, code, facultyName, credits, weeklyDays } = req.body;

        const moderatorId = req.user._id;

        if(!name || credits === undefined) {
            throw new ApiError(400, "Missing required fields: name, credits");
        }

        const group = await GroupModel.findOne({ moderatorId });
        if(!group) {
            throw new ApiError(403, "You are not moderator of any Group");
        }

        let subject = await SubjectModel.findOne({ name, groupId: group._id});
        if(subject) {
            throw new ApiError(409, "Subject already exists");
        }

        subject = await SubjectModel.create({
            name,
            code: code || '',
            facultyName: facultyName || '',
            credits,
            weeklyDays: Array.isArray(weeklyDays) ? weeklyDays : [],
            groupId: group._id
        });
        await subject.populate(SUBJECT_POPULATE);

        res.status(201).send({
            success: true,
            message: "Subject created successfully",
            data: {
                subject: subject,
            }
        })
    } catch (e) {
        next(e);
    }
}

export const updateSubjectController = async (req, res, next) => {
    try {
        const { name, code, facultyName, credits, weeklyDays } = req.body;

        let subject = await SubjectModel.findById(req.params.subjectId);

        if(!subject) {
            throw new ApiError(404, "No subject found");
        }

        if (!subject.groupId.equals(req.user.groupId)) {
            throw new ApiError(403, "Forbidden");
        }

        if(facultyName !== undefined) subject.facultyName = facultyName;
        if(credits !== undefined) subject.credits = credits;
        if(code !== undefined) subject.code = code;
        if(Array.isArray(weeklyDays)) subject.weeklyDays = weeklyDays;

        if (name) {
            const exists = await SubjectModel.exists({
                name,
                groupId: subject.groupId,
                _id: { $ne: subject._id }
            });

            if (exists) {
                throw new ApiError(409, "Subject already exists");
            }

            subject.name = name;
        }

        await subject.save();
        await subject.populate(SUBJECT_POPULATE);

        res.status(200).send({
            success: true,
            message: "Subject Updated successfully",
            data: {
                subject: subject,
            }
        })
    } catch (e) {
        next(e);
    }
}

export const deleteSubjectController = async (req, res, next) => {
    try {
        const subject = await SubjectModel.findById(req.params.subjectId);

        if(!subject) {
            throw new ApiError(404, "No subject found");
        }

        if (!subject.groupId.equals(req.user.groupId)) {
            throw new ApiError(403, "Forbidden");
        }

        await subject.deleteOne();
        await subject.populate(SUBJECT_POPULATE);

        res.status(200).send({
            success: true,
            message: "Subject deleted successfully",
            data: {
                subject: subject,
            }
        })
    } catch (e) {
        next(e);
    }
}
