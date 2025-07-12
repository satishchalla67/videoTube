import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


// Database connection
const connectDB = async () => {
    try{

        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}`,
            {
                dbName: DB_NAME, // Explicitly specify database name
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            }
        );
        console.log(`mongodb connection is sucessfull with host: ${connectionInstance.connection.host}`)
    }
    catch(err){
        console.log(`unable to connet to db server ${err}`)
        process.exit(1)
    }
}

export default connectDB