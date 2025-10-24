import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { emailValidator } from "../../../utilities/validator.utils";

/* --------------------------------------------
   INTERFACE: IndividualUserDocument
-------------------------------------------- */
export interface IndividualUserDocument extends Document {
  // Core fields
  email: string;
  phone_number?: string;
  password?: string;
  name?: string;
  role: "user" | "admin" | "g-ind" | "fb-ind" | "x-ind";
  email_verified: boolean;
  picture?: string;
  sub?: string;
  facebookId?: string;
  xId?: string;

  // Security & tokens
  otp?: string;
  otpExpiresAt?: Date;
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  // Instance methods
  comparePassword(candidate: string): Promise<boolean>;
  createPasswordResetToken(): string;
  comparePasswordResetToken(token: string): boolean;
}

/* --------------------------------------------
   SCHEMA: IndividualUserSchema
-------------------------------------------- */
const individualUserSchema = new Schema<IndividualUserDocument>(
  {
    // Basic info
    name: { type: String, default: "" },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [emailValidator, "Invalid email format"],
    },
    phone_number: { type: String, trim: true },

    // Authentication
    password: { type: String, select: false },
    email_verified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["user", "admin", "g-ind", "fb-ind", "x-ind"],
      default: "user",
      required: true,
    },

    // OAuth & social
    picture: String,
    sub: String,
    facebookId: String,
    xId: String,

    // Password reset
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },

    // OTP & session tokens
    otp: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

/* --------------------------------------------
   MIDDLEWARE: Hash password before saving
-------------------------------------------- */
individualUserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* --------------------------------------------
   INSTANCE METHODS
-------------------------------------------- */
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

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  return resetToken;
};

individualUserSchema.methods.comparePasswordResetToken = function (
  token: string
) {
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  return this.passwordResetToken === hashed;
};

/* --------------------------------------------
   MODEL EXPORT
-------------------------------------------- */
const IndividualUser = mongoose.model<IndividualUserDocument>(
  "IndividualUser",
  individualUserSchema
);

export default IndividualUser;
