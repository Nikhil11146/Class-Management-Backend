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

/**
 * Extracts the Cloudinary public_id from a secure_url and destroys the asset.
 * Example URL: https://res.cloudinary.com/<cloud>/image/upload/v1234/cms/profiles/abc123.jpg
 * => public_id: cms/profiles/abc123
 */
export const deleteFromCloudinary = async (photoUrl) => {
  try {
    // Match everything after /upload/v<version>/ and strip the file extension
    const match = photoUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    if (!match) return;
    const publicId = match[1];
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // Non-critical — log but don't throw
    console.error('Failed to delete old Cloudinary asset:', err);
  }
};
