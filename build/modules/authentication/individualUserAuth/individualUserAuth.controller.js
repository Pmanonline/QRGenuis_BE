"use strict";
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
exports.forgotPassword = exports.verifyEmail = exports.resetIndividualPassword = exports.individualUserLogin = exports.individualUserRegistration = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const individualUserAuth_model_1 = __importDefault(require("./individualUserAuth.model"));
const individualAuthPasswordToken_1 = __importDefault(require("./individualAuthPasswordToken"));
const email_utils_1 = require("../../../utilities/email.utils");
const organizationAuth_model_1 = __importDefault(require("../organizationUserAuth/organizationAuth.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const createSessionAndSendToken_util_1 = require("../../../utilities/createSessionAndSendToken.util");
const individualUserRegistration = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phone_number, password, confirm_password } = req.body;
        if (!email || !phone_number || !password || !confirm_password) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "All fields (email, phone_number, password, confirm_password) are required",
            };
            return next(error);
        }
        if (password !== confirm_password) {
            const error = {
                statusCode: 401,
                status: "fail",
                message: "Password do not match",
            };
            return next(error);
        }
        const individualEmailAlreadyExist = yield individualUserAuth_model_1.default.findOne({ email });
        const organizationEmailAlreadyExist = yield organizationAuth_model_1.default.findOne({
            email,
        });
        if (individualEmailAlreadyExist || organizationEmailAlreadyExist) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "User already exists, please proceed to login",
            };
            return next(error);
        }
        const newUser = new individualUserAuth_model_1.default({
            email,
            phone_number,
            password,
            role: "user",
        });
        yield newUser.save();
        const verificationToken = jsonwebtoken_1.default.sign({ email: newUser.email }, process.env.JWT_SECRET, { expiresIn: "2h" });
        yield (0, email_utils_1.sendVerificationEmail)(email, verificationToken);
        res.status(201).json({
            status: "true",
            message: "Account is unverified! Verification email sent. Verify account to continue. Please note that token expires in 2 hours",
        });
    }
    catch (error) {
        const errResponse = {
            statusCode: 500,
            status: "error",
            message: "Error registering the user",
            stack: error instanceof Error ? { stack: error.stack } : undefined,
        };
        next(errResponse);
    }
});
exports.individualUserRegistration = individualUserRegistration;
const individualUserLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Email and password are required",
            };
            return next(error);
        }
        const user = yield individualUserAuth_model_1.default.findOne({ email }).select("+password");
        if (!user || !user.password) {
            const error = {
                statusCode: 404,
                status: "fail",
                message: "User not found",
            };
            return next(error);
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            const error = {
                statusCode: 401,
                status: "fail",
                message: "Invalid email or password",
            };
            return next(error);
        }
        if (!user.email_verified) {
            const error = {
                statusCode: 403,
                status: "fail",
                message: "Please verify your email first",
            };
            return next(error);
        }
        const userData = {
            _id: user._id,
            email: user.email,
            role: user.role,
            phone_number: user.phone_number,
        };
        // ADMIN: OTP
        if (user.role === "admin") {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            // Extract username *once* – optional, only if you use it later
            const username = user.email.split("@")[0];
            user.otp = otp;
            user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
            yield user.save();
            // Correct call – only 2 arguments
            yield (0, email_utils_1.sendOTPEmail)(email, otp);
            return res.status(200).json({
                message: "OTP sent to your email",
                requireOTP: true,
                user: userData,
            });
        }
        // REGULAR USER: Tokens
        const tokens = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)({
            user: user.toObject(),
            userAgent: req.get("user-agent") || "unknown",
            role: user.role,
            message: "Login successful",
        });
        user.refreshToken = tokens.refreshToken;
        yield user.save();
        return res.status(200).json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: userData,
        });
    }
    catch (error) {
        const errResponse = {
            statusCode: 500,
            status: "error",
            message: "Error logging in",
            stack: error instanceof Error ? { stack: error.stack } : undefined,
        };
        next(errResponse);
    }
});
exports.individualUserLogin = individualUserLogin;
const resetIndividualPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Token and password are required",
            };
            return next(error);
        }
        // Hash incoming token
        const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
        // Find valid, non-expired token
        const passwordToken = yield individualAuthPasswordToken_1.default.findOne({
            token: hashedToken,
            expiresAt: { $gt: new Date() },
        });
        if (!passwordToken) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Invalid or expired reset token",
            };
            return next(error);
        }
        // Find user
        const user = yield individualUserAuth_model_1.default.findById(passwordToken.owner);
        if (!user) {
            const error = {
                statusCode: 404,
                status: "fail",
                message: "User not found",
            };
            return next(error);
        }
        // Update password (hashed by pre-save)
        user.password = password;
        yield user.save();
        // Delete token
        yield individualAuthPasswordToken_1.default.findByIdAndDelete(passwordToken._id);
        return res.status(200).json({
            status: "success",
            message: "Password reset successfully",
        });
    }
    catch (error) {
        const errResponse = {
            statusCode: 500,
            status: "error",
            message: "Error resetting password",
            stack: error instanceof Error ? { stack: error.stack } : undefined,
        };
        next(errResponse);
    }
});
exports.resetIndividualPassword = resetIndividualPassword;
const verifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string") {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Invalid or missing token",
            };
            return next(error);
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (err) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Invalid or expired verification token",
            };
            return next(error);
        }
        const user = yield individualUserAuth_model_1.default.findOne({ email: decoded.email });
        if (!user) {
            const error = {
                statusCode: 404,
                status: "fail",
                message: "User not found",
            };
            return next(error);
        }
        if (user.email_verified) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Email already verified",
            };
            return next(error);
        }
        user.email_verified = true;
        yield user.save();
        // Send welcome email after successful verification
        yield (0, email_utils_1.sendWelcomeEmail)(user.email, user.name);
        return res.status(200).json({
            status: "success",
            message: "Email verified successfully",
        });
    }
    catch (error) {
        const errResponse = {
            statusCode: 500,
            status: "error",
            message: "Error verifying email",
            stack: error instanceof Error ? { stack: error.stack } : undefined,
        };
        next(errResponse);
    }
});
exports.verifyEmail = verifyEmail;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            const error = {
                statusCode: 400,
                status: "fail",
                message: "Email is required",
            };
            return next(error);
        }
        const user = yield individualUserAuth_model_1.default.findOne({ email });
        if (!user) {
            return res.status(200).json({
                status: "success",
                message: "If the email exists, a reset link has been sent",
            });
        }
        // Generate raw token
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const hashedToken = crypto_1.default
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        // Delete old tokens
        yield individualAuthPasswordToken_1.default.deleteMany({ owner: user._id });
        // Save new token
        yield new individualAuthPasswordToken_1.default({
            owner: user._id,
            token: hashedToken,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        }).save();
        const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}`;
        yield (0, email_utils_1.sendPasswordResetEmail)(email, resetUrl);
        return res.status(200).json({
            status: "success",
            message: "Password reset link sent",
        });
    }
    catch (error) {
        const errResponse = {
            statusCode: 500,
            status: "error",
            message: "Error sending reset email",
            stack: error instanceof Error ? { stack: error.stack } : undefined,
        };
        next(errResponse);
    }
});
exports.forgotPassword = forgotPassword;
