import { Router } from "express";
import { registerUser, logoutUser, loginUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import {User} from "../models/user.models.js"
import { upload } from "../middleware/multer.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";


const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route('/login').post(loginUser)
router.route('/refresh-token').post(refreshAccessToken)

// secured routes
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/update-account').patch(verifyJWT, updateAccountDetails)

router.route('/avatar').patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route('/coverImage').patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)


router.route('/c/:username').get(verifyJWT, getUserChannelProfile)
router.route('getHistory').get(verifyJWT, getWatchHistory)


export default router