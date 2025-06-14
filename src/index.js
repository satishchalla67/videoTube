import { app } from "./app.js";
import dotenv from "dotenv"
import connectDB from "./db/index.js";


dotenv.config({
    path: "./.env"
})

const PORT = process.env.PORT || 8001


connectDB()
.then(() => {
    app.listen(PORT, () => {
    console.log(`Your server is running on ${PORT}`)
})
})
.catch(() => {
    console.log(`Unable to connect to db server`)
})


