import cloudinary from 'cloudinary'
import logger from './logger.js'
import {CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET} from '../config/env.js'

cloudinary.v2.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
})

const uploadMediaToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            logger.error("Error while uploading media to cloudinary", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
  
      uploadStream.end(file.buffer);
    });
  };

const deleteMediaFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        logger.info("Media deleted from cloudinary", result)
        return result
    } catch (error) {
        logger.error(error)
        throw error
    }
}

export {uploadMediaToCloudinary, deleteMediaFromCloudinary}