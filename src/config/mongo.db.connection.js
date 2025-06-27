/**
 * This is a configuration file for mongoDB connection
 */
import { connect } from "mongoose";

const dbConnection = async () => {
  try {
    const mongoDB = await connect(process.env.MONGO_DB_CONNECTION);
    console.log(`MongoDB connected: ${mongoDB.connection.host}`);
  } catch (error) {
    console.log(`Error connecting to the MongoDB database : ${error}`);
    process.exit(1);
  }
};

export default dbConnection;
