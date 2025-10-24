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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const shippingDetailSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "IndividualUser", // Reference to User model
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ProductTransaction", // ✅ FIXED: Changed from "Product" to "ProductTransaction"
    },
    shipping_company: {
        type: String,
        required: true,
    },
    delivery_person_name: {
        type: String,
        required: true,
    },
    delivery_person_number: {
        type: String,
        required: true,
    },
    delivery_person_email: {
        type: String,
    },
    delivery_date: {
        type: String,
        required: true,
    },
    pick_up_address: {
        type: String,
        required: true,
    },
    buyer_email: {
        type: String,
    },
    vendor_email: {
        type: String,
    },
}, {
    timestamps: true,
});
const ShippingDetails = mongoose_1.default.model("ShippingDetails", shippingDetailSchema);
exports.default = ShippingDetails;
