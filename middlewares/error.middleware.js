export const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    res.status(err.statusCode || err.status || 500).json({
        success: false,
        message: err.message || 'Server error'
    });
}