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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt_1 = require("bcrypt");
// === Schema ===
const passwordTokenSchema = new mongoose_1.Schema({
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, { timestamps: false } // We manage expiry manually
);
// === Hash token before save ===
passwordTokenSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("token")) {
            this.token = yield (0, bcrypt_1.hash)(this.token, 10);
        }
        next();
    });
});
// === Compare token method ===
passwordTokenSchema.methods.compareToken = function (candidateToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, bcrypt_1.compare)(candidateToken, this.token);
    });
};
// === Create model ===
const PasswordToken = (0, mongoose_1.model)("PasswordToken", passwordTokenSchema);
exports.default = PasswordToken;
