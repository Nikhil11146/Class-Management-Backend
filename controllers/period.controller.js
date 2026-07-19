import GroupModel from "../models/group.model.js";
import ApiError from "../classes/apiError.class.js";
import SubjectModel from "../models/subject.model.js";
import PeriodModel from "../models/period.model.js";

const PERIOD_POPULATE = [
    {
        path: "subjectId",
        select: "name code credits weeklyDays facultyName"
    },
    {
        path: "createdBy",
        select: "name rollNo"
    }
]

export const getSubjectPeriodsController = async (req, res, next) => {
    try {
        const subject = await SubjectModel.findById(req.params.subjectId);

        if (!subject) {
            throw new ApiError(404, "Subject not found");
        }

        if (!subject.groupId.equals(req.user.groupId)) {
            throw new ApiError(403, "Forbidden");
        }

        const periods = await PeriodModel.find({ subjectId: req.params.subjectId }).populate(PERIOD_POPULATE);

        res.status(200).send({
            success: true,
            message: "Periods retrieved successfully",
            data: {
                periods: periods
            }
        });
    } catch (e) {
        next(e);
    }
}

export const createPeriodController = async (req, res, next) => {
    try {
        const { startTime, endTime, room } = req.body;

        if (!startTime || !endTime) {
            throw new ApiError(400, "Missing required fields");
        }

        const subjectId = req.params.subjectId;

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            throw new ApiError(400, "Invalid date format");
        }

        if (start >= end) {
            throw new ApiError(400, "End time must be after start time");
        }

        const group = await GroupModel.findOne({ moderatorId: req.user._id });

        if(!group) {
            throw new ApiError(404, "Group not found");
        }

        const subject = await SubjectModel.findOne({
            _id: subjectId,
            groupId: group._id
        });

        if (!subject) {
            throw new ApiError(404, "Subject not found");
        }

        const period = await PeriodModel.create({
            subjectId,
            startTime: start,
            endTime: end,
            room: room || '',
            groupId: group._id,
            createdBy: req.user._id
        });
        await period.populate(PERIOD_POPULATE);

        res.status(201).send({
            success: true,
            message: "Period created Successfully",
            data: {
                period: period
            }
        });
    } catch (e) {
        next(e);
    }
}

export const getPeriodController = async (req, res, next) => {
    try {
        const period = await PeriodModel.findById(req.params.periodId);

        if(!period) {
            throw new ApiError(404, "Period not found");
        }

        if (!period.groupId.equals(req.user.groupId)) {
            throw new ApiError(403, "Forbidden");
        }

        await period.populate(PERIOD_POPULATE);

        res.status(200).send({
            success: true,
            message: "Period retrieved successfully",
            data: {
                period: period
            }
        })
    } catch (e) {
        next(e);
    }
}

export const getPeriodsController = async (req, res, next) => {
    try {
        const { date } = req.query;
        const filter = { groupId: req.user.groupId };

        // Optional ?date=YYYY-MM-DD filter for Today's Schedule
        if (date) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
            }
            const dayStart = new Date(`${date}T00:00:00.000Z`);
            const dayEnd   = new Date(`${date}T23:59:59.999Z`);
            filter.startTime = { $gte: dayStart, $lte: dayEnd };
        }

        const periods = await PeriodModel.find(filter)
            .sort({ startTime: 1 })
            .populate(PERIOD_POPULATE);

        res.status(200).send({
            success: true,
            message: "Periods retrieved successfully",
            data: {
                periods: periods
            }
        })
    } catch (e) {
        next(e);
    }
}

export const updatePeriodController = async (req, res, next) => {
    try {
        const { startTime, endTime, room, facultyName } = req.body;

        const period = await PeriodModel.findById(req.params.periodId)

        if (!period) {
            throw new ApiError(404, "Period not found");
        }

        if(!period.groupId.equals(req.user.groupId)) {
            throw new ApiError(403, "Forbidden");
        }

        if (startTime !== undefined) period.startTime = startTime;
        if (endTime !== undefined)   period.endTime   = endTime;
        if (room !== undefined)      period.room      = room;

        const start = new Date(period.startTime);
        const end = new Date(period.endTime);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            throw new ApiError(400, "Invalid date format");
        }

        if (start >= end) {
            throw new ApiError(400, "End time must be after start time");
        }

        await period.save();

        // If facultyName provided, update it on the linked Subject too
        if (facultyName !== undefined) {
            await SubjectModel.findByIdAndUpdate(period.subjectId, { facultyName });
        }

        await period.populate(PERIOD_POPULATE);
        res.status(200).send({
            success: true,
            message: "Period Updated Successfully",
            data: {
                period: period
            }
        });
    } catch (e) {
        next(e);
    }
}

export const deletePeriodController = async (req, res, next) => {
    try {
        const period = await PeriodModel.findById(req.params.periodId);

        if (!period) {
            throw new ApiError(404, "Period not found");
        }

        if(!period.groupId.equals(req.user.groupId)) {
            throw new ApiError(403, "Forbidden");
        }

        await period.deleteOne();
        await period.populate(PERIOD_POPULATE);

        res.status(204).send({
            success: true,
            message: "Period deleted successfully",
            data: {
                period: period
            }
        })
    } catch (e) {
        next(e);
    }
}
