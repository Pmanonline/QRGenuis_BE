import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { emailValidator } from "../../../utilities/validator.utils";

export interface IndividualUserDocument extends Document {
  email: string;
  phone_number?: string;
  password?: string;
  role: "user" | "admin" | "g-ind";
  email_verified: boolean;
  picture?: string;
  sub?: string;
  facebookId: String; // Facebook
  xId: String; // X/Twitter

  // 2FA / session fields
  otp?: string;
  otpExpiresAt?: Date;
  refreshToken?: string;

  comparePassword(candidate: string): Promise<boolean>;
  createPasswordResetToken(): string;
  comparePasswordResetToken(token: string): boolean;
}

const individualUserSchema = new Schema<IndividualUserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [emailValidator, "Invalid email format"],
    },
    phone_number: { type: String, trim: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ["user", "admin", "g-ind", "fb-ind", "x-ind"],
      default: "user",
      required: true,
    },
    email_verified: { type: Boolean, default: false },
    picture: String,
    sub: String,

    // 2FA & refresh token
    otp: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

/* ---------- Password hashing ---------- */
individualUserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* ---------- Instance methods ---------- */
individualUserSchema.methods.comparePassword = async function (
  candidate: string
) {
  return bcrypt.compare(candidate, this.password!);
};

individualUserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
  return resetToken;
};

individualUserSchema.methods.comparePasswordResetToken = function (
  token: string
) {
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  return this.passwordResetToken === hashed;
};

export default mongoose.model<IndividualUserDocument>(
  "IndividualUser",
  individualUserSchema
);
