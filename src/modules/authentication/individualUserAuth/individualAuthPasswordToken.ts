import { Model, Schema, model, Document } from "mongoose";
import { hash, compare } from "bcrypt";
import crypto from "crypto";

// === Interfaces ===
export interface PasswordTokenDocument extends Document {
  owner: Schema.Types.ObjectId;
  token: string;
  expiresAt: Date;
}

interface PasswordTokenMethods {
  compareToken(candidateToken: string): Promise<boolean>;
}

type PasswordTokenModel = Model<
  PasswordTokenDocument,
  {},
  PasswordTokenMethods
>;

// === Schema ===
const passwordTokenSchema = new Schema<
  PasswordTokenDocument,
  PasswordTokenModel,
  PasswordTokenMethods
>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "IndividualUser",
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      index: { expires: "10m" }, // MongoDB TTL index
    },
  },
  { timestamps: false } // We manage expiry manually
);

// === Hash token before save ===
passwordTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    this.token = await hash(this.token, 10);
  }
  next();
});

// === Compare token method ===
passwordTokenSchema.methods.compareToken = async function (
  candidateToken: string
): Promise<boolean> {
  return await compare(candidateToken, this.token);
};

// === Create model ===
const PasswordToken = model<PasswordTokenDocument, PasswordTokenModel>(
  "PasswordToken",
  passwordTokenSchema
);

export default PasswordToken;
