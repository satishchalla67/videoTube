import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import {uploadOnCloudinary, deleteCloudinary} from "../utils/cloudinary.js";
import { ApiResonse } from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js"



const registerUser = asyncHandler(async (req, res) => {
    
    // Retrieve the input data from requst
    const {userName, email, fullName, password } = req.body

    // Check all the fields are there or not
    if([userName, email, fullName, password].some((field) => field?.trim()==="")){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{userName}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or userName already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath = ""
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files?.coverImage[0]?.path
    }

    if(!avatarLocalPath){
        throw new ApiError(409, "Avatar file is missing")
    }

    let avatar = ""
    let coverImage = ""

    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
        if(!avatar){
            throw new ApiError(409, "Avatar file is missing")
        }
    
        const user = await User.create({
            fullName,
            email,
            avatar: avatar.url,
            coverImage: coverImage.url || "",
            password,
            userName: userName.toLowerCase()
        })
    
        const createdUser = await User.findById(user._id).select(
            '-password -refreshToken'
        )
    
        if(!createdUser){
            throw new ApiError(409, "Something went wrong while registering the user")
        }
    
        return res.status(201).json(
            new ApiResonse(200, createdUser, "User registered successfully")
        )
    
    } catch (error) {

        if(avatar){
            await deleteCloudinary(avatar.public_id)
        }
        if(coverImage){
            await deleteCloudinary(coverImage.public_id)
        }
        throw new ApiError(409, "Something went wrong while registering the user")
        
    }

})


export {
    registerUser
}