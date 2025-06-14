import { ApiResonse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";





const healthcheck = asyncHandler((req, res) => {

    return res.status(200).json(new ApiResonse(200, "OK", "Health check is successful!!"))

})


export {healthcheck}