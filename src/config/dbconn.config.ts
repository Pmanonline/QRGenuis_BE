import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  const DATABASE_URI = process.env.DATABASE_URI!;

  try {
    // await mongoose.connect(DATABASE_URI);
    await mongoose.connect(
      "mongodb+srv://umoru-admin:3Ode6lAAfIQh0MX7@umoru-dev.2zy4fyn.mongodb.net/QRGenius"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error);
  }
};

export default connectDB;
