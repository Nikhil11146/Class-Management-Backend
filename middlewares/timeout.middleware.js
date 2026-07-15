import ApiError from "../classes/apiError.class.js";

export const timeoutMiddleware = (seconds = 15) => {
    return (req, res, next) => {
        const timeoutId = setTimeout(() => {
            if (!res.headersSent) {
                // Trigger the error middleware to send the 408 response
                next(new ApiError(408, "Request Timeout"));

                // Stub subsequent response methods to prevent "headers already sent" errors
                res.send = () => res;
                res.json = () => res;
                res.end = () => res;
            }
        }, seconds * 1000);

        res.on('finish', () => clearTimeout(timeoutId));
        res.on('close', () => clearTimeout(timeoutId));

        next();
    };
};
