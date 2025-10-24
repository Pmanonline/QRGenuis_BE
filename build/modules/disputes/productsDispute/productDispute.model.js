"use strict";
// import mongoose, { Schema, Document } from "mongoose";
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
// export interface IProductDispute extends Document {
//   user: mongoose.Schema.Types.ObjectId; // Reference to the User model
//   transaction: mongoose.Schema.Types.ObjectId; // Reference to the Transaction model
//   mediator: mongoose.Schema.Types.ObjectId; // Reference to the Transaction model
//   transaction_id: string;
//   buyer_email: string;
//   vendor_email: string;
//   vendor_name: string;
//   vendor_phone_number: string;
//   product_name: string;
//   product_image: string;
//   reason_for_dispute: string;
//   dispute_description: string;
//   dispute_status: string;
//   dispute_fault: string;
//   dispute_resolution_method: string;
//   resolution_description: string;
//   dispute_raised_by: string;
//   dispute_raised_by_email: string;
// }
// const productDisputeSchema = new mongoose.Schema(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: "IndividualUser", // Reference to User model
//       // required: true,
//     },
//     transaction: {
//       type: Schema.Types.ObjectId,
//       ref: "Product", // Reference to User model
//       // required: true,
//     },
//     mediator: {
//       type: Schema.Types.ObjectId,
//       ref: "Mediator", // Reference to User model
//       // required: true,
//     },
//     transaction_id: {
//       type: String,
//       required: true,
//     },
//     buyer_email: {
//       type: String,
//       required: true,
//     },
//     vendor_name: {
//       type: String,
//       required: true,
//     },
//     vendor_email: {
//       type: String,
//       required: true,
//     },
//     vendor_phone_number: {
//       type: String,
//       required: true,
//     },
//     product_name: {
//       type: String,
//       required: true,
//     },
//     product_image: {
//       type: String,
//       required: true,
//     },
//     reason_for_dispute: {
//       type: String,
//       required: true,
//     },
//     dispute_description: {
//       type: String,
//       required: true,
//     },
//     dispute_status: {
//       type: String,
//       default: "resolving",
//       enum: ["resolving", "resolved", "cancelled"],
//     },
//     dispute_resolution_method: {
//       type: String,
//       default: "unresolved",
//       enum: ["unresolved", "dispute_parties", "mediator"],
//     },
//     dispute_fault: {
//       type: String,
//       enum: ["buyer", "seller"],
//     },
//     resolution_description: {
//       type: String,
//     },
//     dispute_raised_by: {
//       type: String,
//       enum: ["buyer", "seller"],
//       required: true,
//     },
//     dispute_raised_by_email: {
//       type: String,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );
// const ProductDispute = mongoose.model<IProductDispute>(
//   "ProductDispute",
//   productDisputeSchema
// );
// export default ProductDispute;
const mongoose_1 = __importStar(require("mongoose"));
const productDisputeSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "IndividualUser", // Reference to User model
    },
    transaction: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ProductTransaction", // Corrected reference to ProductTransaction model
    },
    mediator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Mediator", // Reference to Mediator model
    },
    transaction_id: {
        type: String,
        required: true,
    },
    buyer_email: {
        type: String,
        required: true,
    },
    vendor_name: {
        type: String,
        required: true,
    },
    vendor_email: {
        type: String,
        required: true,
    },
    vendor_phone_number: {
        type: String,
        required: true,
    },
    product_name: {
        type: String,
        required: true,
    },
    product_image: {
        type: String,
        required: true,
    },
    reason_for_dispute: {
        type: String,
        required: true,
    },
    dispute_description: {
        type: String,
        required: true,
    },
    dispute_status: {
        type: String,
        default: "resolving",
        enum: ["resolving", "resolved", "cancelled"],
    },
    dispute_resolution_method: {
        type: String,
        default: "unresolved",
        enum: ["unresolved", "dispute_parties", "mediator"],
    },
    dispute_fault: {
        type: String,
        enum: ["buyer", "seller"],
    },
    resolution_description: {
        type: String,
    },
    dispute_raised_by: {
        type: String,
        enum: ["buyer", "seller"],
        required: true,
    },
    dispute_raised_by_email: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
const ProductDispute = mongoose_1.default.model("ProductDispute", productDisputeSchema);
exports.default = ProductDispute;
