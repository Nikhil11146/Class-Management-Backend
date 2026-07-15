import UserModel from "../models/user.model.js";
import ApiError from "../classes/apiError.class.js";

export const modAuthMiddleware = async (req, res, next) => {
    try {
        const moderatorId = req.user._id;

        const moderator = await UserModel.findById(moderatorId);

        if(!moderator) {
            throw new ApiError(400, 'Incorrect moderator ID');
        }

        if(moderator.role === 'ROLE_USER') {
            throw new ApiError(401, 'Unauthorized');
        }

        next();
    }catch (e) {
        next(e);
    }
}