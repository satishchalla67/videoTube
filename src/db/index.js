import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



const connectDB = async () => {
    try{

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`mongodb connection is sucessfull with host: ${connectionInstance.connection.host}`)
    }
    catch(err){
        console.log(`unable to connet to db server ${err}`)
        process.exit(1)
    }
}

export default connectDB