"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const validator_utils_1 = require("../../../utilities/validator.utils");
/* --------------------------------------------
   SCHEMA: IndividualUserSchema
-------------------------------------------- */
const individualUserSchema = new mongoose_1.Schema({
    // Basic info
    name: { type: String, default: "" },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator_utils_1.emailValidator, "Invalid email format"],
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
}, { timestamps: true });
/* --------------------------------------------
   MIDDLEWARE: Hash password before saving
-------------------------------------------- */
individualUserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password") || !this.password)
            return next();
        this.password = yield bcrypt_1.default.hash(this.password, 12);
        next();
    });
});
/* --------------------------------------------
   INSTANCE METHODS
-------------------------------------------- */
individualUserSchema.methods.comparePassword = function (candidate) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcrypt_1.default.compare(candidate, this.password);
    });
};
individualUserSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    return resetToken;
};
individualUserSchema.methods.comparePasswordResetToken = function (token) {
    const hashed = crypto_1.default.createHash("sha256").update(token).digest("hex");
    return this.passwordResetToken === hashed;
};
/* --------------------------------------------
   MODEL EXPORT
-------------------------------------------- */
const IndividualUser = mongoose_1.default.model("IndividualUser", individualUserSchema);
exports.default = IndividualUser;
