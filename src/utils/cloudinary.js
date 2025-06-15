import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"



cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KET,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });


const uploadOnCloudinary = async (localFilePath) => {

    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File is saved to cloudinary. src:", response.url)
        // once the file is saved we want to delete it from our local storage....
        fs.unlinkSync(localFilePath)
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null        
    }

}

const deleteCloudinary = async (publicId) => {

    try {

        const response = await cloudinary.uploader.destroy(publicId)
        console.log("Deleted cloudinary images")
        return response

    } catch (error) {
        console.log("Error in deleting the clodinary images")
        return null
    }

}

export {uploadOnCloudinary, deleteCloudinary}