import {v2 as cloudinary} from 'cloudinary'
import dotenv from 'dotenv'
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
export const uploadImage=async(filePath,folder)=>{
    const result= await cloudinary.uploader.upload(filePath,{folder});
    return result;
}
export const deleteImage=async(publicId)=>{
    await cloudinary.uploader.destroy(publicId)
};