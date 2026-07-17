import ApiError from "../classes/apiError.class.js";
import {JWT_SECRET} from "../config/env.js";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import GroupModel from "../models/group.model.js";

export const authMiddleware = async (req, res, next) => {
    try {
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if(!token) {
            throw new ApiError(401, "Unauthorized");
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await UserModel.findById(decoded.userId);

        if(!user || user.tokenVersion !== decoded.tokenVersion) {
            throw new ApiError(401, "Unauthorized");
        }

        req.user = user;
        
        const group = await GroupModel.findById(user.groupId);
        if (group) {
            req.user.clg = group.clg;
        }

        next();
    } catch (e) {
        next(e);
    }
}