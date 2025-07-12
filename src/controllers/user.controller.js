import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import {uploadOnCloudinary, deleteCloudinary} from "../utils/cloudinary.js";
import { ApiResonse } from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js"
import jwt from "jsonwebtoken"




const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId)
        if(!user) return ApiError(404, "User with the provided id is not present")
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    
    // Retrieve the input data from request
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

const loginUser = asyncHandler( async (req, res) => {
    
    const{userName, email, password} = req.body

    if(!email || !userName){
        return new ApiError(400, "Email or User Name is required")
    }

    const user = await User.findOne({
        $or: [{email}, {userName}] 
    })
    if(!user){
        throw new ApiError(400, "user doesnot exists")
    }

    const isPasswordValid = user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = User.findById(user._id).select("-password -accessToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResonse(200, {user: loggedInUser, accessToken, refreshToken}, "User loggedIn sucessfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorised request")
    }


    try {
        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id)

        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }

        if(incomingRefreshToken != user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200).cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResonse(200, {accessToken, refreshToken: newRefreshToken}, "Access Token refreshed"))


        
    } catch (error) {

        throw new ApiError(401, "Something went wrong while refreshing the access token")
        
    }


    

})

const logoutUser = asyncHandler( async (req, res) => {

    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: ""
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options)
    .json(new ApiResonse(200, {}, "User is successfully logged out"))
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(401, "Password is incorrect")

    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResonse(200, user, "Password changed successfully"))

})

const getCurrentUser = asyncHandler( async (req, res) => {

    return res.status(200).json(new ApiResonse(200, req.user, "user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(401, "Fullname and password are required")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResonse(200, user, "Updated user details successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(401, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(401, "Something went wrong while uploading avatar")
    }

    const user = await findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResonse(200, user, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(200, "cover image path is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(200, "Something went wrong while updating the cover image")
    }

    const user = await findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResonse(200, user, "Cover image updated successfully"))

})


const getUserChannelProfile = asyncHandler( async (req, res) => {
    const username = req.params

    if(!username){
        throw new ApiError(200, "Username is required")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"

            }

        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount:{
                    $size: "$subscribers"
                },
                channelSubscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    if: {$in: [req.user?._id, "$subscribers.subscriber"]}
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if(!channel){
        throw new ApiError(401, "User channel cannot be created")
    }

    return res.status(200).json(new ApiResonse(200, channel[0], "User channel fetched successfully"))
})


const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})


export {
    registerUser, loginUser, refreshAccessToken, logoutUser, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory
}