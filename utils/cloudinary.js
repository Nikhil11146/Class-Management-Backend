import cloudinary from '../config/cloudinary.config.js';
import streamifier from 'streamifier';

export const uploadToCloudinary = (fileBuffer, folder = "cms/assets") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};
