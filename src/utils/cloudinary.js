import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return "Path not found";
    const resposne = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File uploaded successfully --> ", resposne.url);
    return resposne;
  } catch (error) {
    fs.unlink(localFilePath);
    return "Error uploading to cloudinary: " + error.message;
  }
};

export { uploadCloudinary };
