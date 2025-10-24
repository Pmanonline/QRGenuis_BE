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
exports.handleXLogin = exports.handleFacebookLogin = exports.handleGoogleLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const individualUserAuth_model_1 = __importDefault(require("./individualUserAuth.model"));
const email_utils_1 = require("../../../utilities/email.utils");
// === GOOGLE LOGIN ===
const handleGoogleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { credential } = req.body;
    if (!credential) {
        return res.status(400).json({
            success: false,
            message: "Google credential is required",
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.decode(credential);
        if (!decoded || !decoded.email) {
            return res.status(400).json({
                success: false,
                message: "Invalid Google token",
            });
        }
        let user = yield individualUserAuth_model_1.default.findOne({ email: decoded.email });
        // Block admin login via Google
        if (user && user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin accounts cannot login through Google. Use standard login.",
            });
        }
        const isNewUser = !user;
        if (!user) {
            user = new individualUserAuth_model_1.default({
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture,
                sub: decoded.sub,
                role: "g-ind",
                email_verified: decoded.email_verified || true,
            });
            yield user.save();
        }
        // Send welcome email for new users
        if (isNewUser) {
            try {
                yield (0, email_utils_1.sendWelcomeEmail)(user.email, user.name || user.email.split("@")[0]);
            }
            catch (emailError) {
                console.error("Failed to send Google welcome email:", emailError);
            }
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });
        return res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name || user.email.split("@")[0],
                role: user.role,
                picture: user.picture,
            },
        });
    }
    catch (error) {
        console.error("Google login error:", error);
        return res.status(500).json({
            success: false,
            message: "Error processing Google login",
        });
    }
});
exports.handleGoogleLogin = handleGoogleLogin;
// === FACEBOOK LOGIN ===
const handleFacebookLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { accessToken } = req.body;
    if (!accessToken) {
        return res.status(400).json({
            success: false,
            message: "Facebook access token is required",
        });
    }
    try {
        const { data } = yield axios_1.default.get(`https://graph.facebook.com/v20.0/me?fields=id,name,email,picture&access_token=${accessToken}`);
        if (!data.email) {
            return res.status(400).json({
                success: false,
                message: "Email not provided by Facebook",
            });
        }
        let user = yield individualUserAuth_model_1.default.findOne({ email: data.email });
        // Block admin login via Facebook
        if (user && user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin accounts cannot login through Facebook. Use standard login.",
            });
        }
        const isNewUser = !user;
        if (!user) {
            user = new individualUserAuth_model_1.default({
                email: data.email,
                name: data.name,
                picture: (_b = (_a = data.picture) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.url,
                facebookId: data.id,
                role: "fb-ind",
                email_verified: true,
            });
            yield user.save();
        }
        // Send welcome email for new users
        if (isNewUser) {
            try {
                yield (0, email_utils_1.sendWelcomeEmail)(user.email, user.name || user.email.split("@")[0]);
            }
            catch (emailError) {
                console.error("Failed to send Facebook welcome email:", emailError);
            }
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });
        return res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name || user.email.split("@")[0],
                role: user.role,
                picture: user.picture,
            },
        });
    }
    catch (error) {
        console.error("Facebook login error:", ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message);
        return res.status(500).json({
            success: false,
            message: "Error processing Facebook login",
        });
    }
});
exports.handleFacebookLogin = handleFacebookLogin;
// === X (TWITTER) LOGIN ===
const handleXLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { oauth_token, oauth_verifier } = req.body;
    if (!oauth_token || !oauth_verifier) {
        return res.status(400).json({
            success: false,
            message: "OAuth token and verifier are required",
        });
    }
    try {
        // Get access token
        const tokenResponse = yield axios_1.default.post("https://api.twitter.com/oauth/access_token", null, {
            params: {
                oauth_token,
                oauth_verifier,
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        const params = new URLSearchParams(tokenResponse.data);
        const accessToken = params.get("oauth_token");
        const accessTokenSecret = params.get("oauth_token_secret");
        const userId = params.get("user_id");
        const screenName = params.get("screen_name");
        if (!accessToken || !userId) {
            return res.status(400).json({
                success: false,
                message: "Failed to authenticate with X",
            });
        }
        // Get user profile
        const userResponse = yield axios_1.default.get("https://api.twitter.com/1.1/account/verify_credentials.json", {
            params: { include_email: "true" },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const xData = userResponse.data;
        const email = xData.email || `${screenName}@x-generated.com`;
        let user = yield individualUserAuth_model_1.default.findOne({ email });
        // Block admin login via X
        if (user && user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin accounts cannot login through X. Use standard login.",
            });
        }
        const isNewUser = !user;
        if (!user) {
            user = new individualUserAuth_model_1.default({
                email,
                name: xData.name,
                picture: (_a = xData.profile_image_url_https) === null || _a === void 0 ? void 0 : _a.replace("_normal", ""),
                xId: userId,
                role: "x-ind",
                email_verified: !!xData.email,
            });
            yield user.save();
        }
        // Send welcome email for new users
        if (isNewUser && xData.email) {
            try {
                yield (0, email_utils_1.sendWelcomeEmail)(user.email, user.name);
            }
            catch (emailError) {
                console.error("Failed to send X welcome email:", emailError);
            }
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });
        return res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name || screenName,
                role: user.role,
                picture: user.picture,
            },
        });
    }
    catch (error) {
        console.error("X login error:", ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
        return res.status(500).json({
            success: false,
            message: "Error processing X login",
        });
    }
});
exports.handleXLogin = handleXLogin;
