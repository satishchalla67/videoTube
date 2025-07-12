import express from "express"
import cors from "cors"
import healthcheckRouter from "../src/routes/healthcheck.router.js"
import userRouter from "../src/routes/user.router.js"
import cookieParser from "cookie-parser"


const app = express()


// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: "16kb"})) // Body Parser
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser()) // For JWT in cookies




// Routes
app.use('/api/v1/healthcheck', healthcheckRouter)
app.use('/api/v1/users', userRouter)

// Error handling (must be last middleware)

export { app }