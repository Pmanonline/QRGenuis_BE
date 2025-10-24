"use strict";
// import { Request, Response, NextFunction } from "express";
// import { validateFormFields } from "../../../utilities/validation.utilities";
// import IndividualUser from "../../authentication/individualUserAuth/individualUserAuth.model1";
// import ProductTransaction from "../../transactions/productsTransaction/productsTransaction.model";
// import ProductDispute from "./productDispute.model";
// import { errorHandler } from "../../../middlewares/errorHandling.middleware";
// import {
//   BuyerResolveDisputeParams,
//   BuyerResolveDisputeBody,
//   BuyerResolveDisputeResponse,
//   SellerResolveDisputeParams,
//   SellerResolveDisputeResponse,
//   SellerResolveDisputeBody,
// } from "./productDispute.interface";
// import { log } from "console";
// import {
//   sendBuyerResolutionMailToBuyer,
//   sendBuyerResolutionMailToSeller,
//   sendDisputeMailToBuyer,
//   sendDisputeMailToSeller,
//   sendSellerResolutionMailToBuyer,
//   sendSellerResolutionMailToSeller,
// } from "./productDispute.mail";
// // import productTransaction from "../../transactions/productsTransaction/productsTransaction.model";
// // seller rejects escrow initiated
// /*
//     1. accepts:- buyer are given their "create transaction" form to edit
//     2. rejects:-
//         a. cancels the escrow initiated
//         b. involves a mediator
//             - mediator receives mail
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
exports.sellerResolveDispute = exports.buyerResolveDispute = exports.getAllDisputesByUser = exports.raiseDispute = void 0;
const validation_utilities_1 = require("../../../utilities/validation.utilities");
const individualUserAuth_model_1 = __importDefault(require("../../authentication/individualUserAuth/individualUserAuth.model"));
const productsTransaction_model_1 = __importDefault(require("../../transactions/productsTransaction/productsTransaction.model"));
const productDispute_model_1 = __importDefault(require("./productDispute.model"));
const errorHandling_middleware_1 = require("../../../middlewares/errorHandling.middleware");
const console_1 = require("console");
const productDispute_mail_1 = require("./productDispute.mail");
const raiseDispute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { transaction_id, user_email, buyer_email, vendor_name, vendor_email, vendor_phone_number, product_name, product_image, reason_for_dispute, dispute_description, } = req.body;
    let dispute_raised_by = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.dispute_raised_by;
    (0, validation_utilities_1.validateFormFields)({
        product_name,
        product_image,
        transaction_id,
        reason_for_dispute,
        dispute_description,
    }, next);
    try {
        const user = yield individualUserAuth_model_1.default.findOne({ email: user_email });
        console.log("user_email", user_email);
        const transaction = yield productsTransaction_model_1.default.findOne({
            transaction_id: transaction_id,
        });
        const transactionStatus = transaction === null || transaction === void 0 ? void 0 : transaction.transaction_status;
        if (!user) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "User not found"));
        }
        else if (!transaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Transaction not found"));
        }
        else if (buyer_email === vendor_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "You cannot raise a dispute against yourself"));
        }
        else if (transactionStatus === "completed") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "You cannot raise a dispute for this transaction because it has already been completed"));
        }
        else if (transactionStatus === "cancelled") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "You cannot raise a dispute for this transaction because it has already been cancelled"));
        }
        else if (transactionStatus === "inDispute") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "You cannot raise a dispute for this transaction because it is already in dispute"));
        }
        if (user_email === vendor_email) {
            dispute_raised_by = "seller";
        }
        else if (user_email === buyer_email) {
            dispute_raised_by = "buyer";
        }
        const updateProductTransactionStatus = yield productsTransaction_model_1.default.findByIdAndUpdate(transaction._id, { $set: { transaction_status: "inDispute" } }, { new: true });
        if (!updateProductTransactionStatus) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update transaction status"));
        }
        // Populate products array from transaction, filtered by product_name and product_image
        const matchingProducts = transaction.products.filter((p) => p.name === product_name && p.image === product_image);
        if (matchingProducts.length === 0) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Provided product details do not match transaction"));
        }
        const newProductDispute = new productDispute_model_1.default({
            user,
            transaction: transaction._id,
            mediator: null,
            transaction_id,
            buyer_email,
            vendor_name,
            vendor_email,
            vendor_phone_number,
            product_name,
            product_image,
            products: matchingProducts.map((p) => ({
                name: p.name,
                quantity: p.quantity,
                price: p.price,
                image: p.image,
                description: p.description,
            })),
            reason_for_dispute,
            dispute_description,
            dispute_raised_by,
            dispute_raised_by_email: user_email,
        });
        yield newProductDispute.save();
        yield Promise.all([
            (0, productDispute_mail_1.sendDisputeMailToBuyer)(buyer_email, product_name, dispute_description),
            (0, productDispute_mail_1.sendDisputeMailToSeller)(vendor_email, product_name, dispute_description),
        ]);
        res.json({
            status: "success",
            message: "Dispute has been raised successfully",
        });
    }
    catch (error) {
        console.log("error", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.raiseDispute = raiseDispute;
const getAllDisputesByUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_email } = req.params;
        if (!user_email) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "User email is required"));
        }
        const fetchDisputeDetails = yield productDispute_model_1.default.find({
            $or: [{ vendor_email: user_email }, { buyer_email: user_email }],
        }).sort({ createdAt: -1 });
        if (!fetchDisputeDetails || (fetchDisputeDetails === null || fetchDisputeDetails === void 0 ? void 0 : fetchDisputeDetails.length) === 0) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "No disputes found for this user"));
        }
        else {
            res.json({
                fetchDisputeDetails,
                status: "success",
                message: "all disputes have been fetched successfully",
            });
        }
    }
    catch (error) {
        console.log("error", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.getAllDisputesByUser = getAllDisputesByUser;
const buyerResolveDispute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendor_name, vendor_phone_number, vendor_email, transaction_type, product_name, product_quantity, product_price, transaction_total, product_image, product_description, signed_escrow_doc, delivery_address, } = req.body;
    const { transaction_id } = req.params;
    try {
        const productDetails = yield productsTransaction_model_1.default.findOne({
            transaction_id: transaction_id,
            transaction_status: "inDispute",
        });
        const disputeDetails = yield productDispute_model_1.default.findOne({
            transaction_id: transaction_id,
        });
        if (!productDetails) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "No dispute found for this transaction"));
        }
        else if (!disputeDetails) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Dispute does not exist"));
        }
        if (!["Not in Dispute", "processing"].includes(disputeDetails.dispute_status)) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, `Cannot update dispute: Current status is ${disputeDetails.dispute_status}`));
        }
        if (disputeDetails.dispute_resolution_method === "mediator" &&
            disputeDetails.mediator) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Cannot resolve dispute: A mediator is assigned to this dispute"));
        }
        const updatedProducts = productDetails.products.map((p) => {
            if (p.name === product_name) {
                return Object.assign(Object.assign({}, p), { quantity: product_quantity || p.quantity, price: product_price || p.price, image: product_image || p.image, description: product_description || p.description });
            }
            return p;
        });
        const updateTransaction = yield productsTransaction_model_1.default.findByIdAndUpdate(productDetails._id, {
            $set: {
                vendor_name: vendor_name || productDetails.vendor_name,
                vendor_phone_number: vendor_phone_number || productDetails.vendor_phone_number,
                vendor_email: vendor_email || productDetails.vendor_email,
                transaction_type: transaction_type || productDetails.transaction_type,
                products: updatedProducts,
                transaction_total: transaction_total || productDetails.transaction_total,
                signed_escrow_doc: signed_escrow_doc || productDetails.signed_escrow_doc,
                delivery_address: delivery_address || productDetails.delivery_address,
            },
        }, { new: true, runValidators: true });
        if (!updateTransaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update transaction"));
        }
        const updateDispute = yield productDispute_model_1.default.findByIdAndUpdate(disputeDetails._id, {
            $set: {
                dispute_status: "resolving",
                dispute_resolution_method: disputeDetails.dispute_resolution_method || "dispute_parties",
            },
        }, { new: true, runValidators: true }).populate("transaction user mediator");
        if (!updateDispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update transaction"));
        }
        (0, console_1.log)("updatedTransaction", updateTransaction);
        (0, console_1.log)("updateDispute", updateDispute);
        yield Promise.all([
            (0, productDispute_mail_1.sendBuyerResolutionMailToBuyer)(updateDispute.buyer_email, product_name),
            (0, productDispute_mail_1.sendBuyerResolutionMailToSeller)(updateDispute.vendor_email, product_name),
        ]);
        res.json({
            status: "success",
            message: "Transaction form updated successfully and dispute is being resolved",
            data: {
                dispute: updateDispute,
            },
        });
    }
    catch (error) {
        console.log("error", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.buyerResolveDispute = buyerResolveDispute;
const sellerResolveDispute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { resolution_description } = req.body;
    const { transaction_id } = req.params;
    (0, validation_utilities_1.validateFormFields)({
        resolution_description,
    }, next);
    try {
        const disputeDetails = yield productDispute_model_1.default.findOne({
            transaction_id,
        }).populate("transaction user");
        const productDetails = yield productsTransaction_model_1.default.findOne({
            transaction_id,
            transaction_status: "inDispute",
        });
        if (!disputeDetails) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "Dispute does not exist"));
        }
        if (!productDetails) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "No dispute found for this transaction"));
        }
        if (disputeDetails.dispute_status === "resolved") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "This dispute has been resolved"));
        }
        if (disputeDetails.dispute_status === "cancelled") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "This dispute has been cancelled"));
        }
        const updatedTransaction = yield productsTransaction_model_1.default.findByIdAndUpdate(productDetails._id, { $set: { transaction_status: "completed" } }, { new: true, runValidators: true });
        if (!updatedTransaction) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update transaction status"));
        }
        const updateDispute = yield productDispute_model_1.default.findByIdAndUpdate(disputeDetails._id, {
            $set: {
                dispute_status: "resolving",
                dispute_resolution_method: disputeDetails.dispute_resolution_method || "dispute_parties",
                resolution_description,
            },
        }, { new: true, runValidators: true }).populate("transaction user mediator");
        if (!updateDispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update transaction"));
        }
        // Use product_name from dispute instead of products array
        yield Promise.all([
            (0, productDispute_mail_1.sendSellerResolutionMailToBuyer)(updateDispute.buyer_email, updateDispute.product_name),
            (0, productDispute_mail_1.sendSellerResolutionMailToSeller)(updateDispute.vendor_email, updateDispute.product_name),
        ]);
        res.json({
            status: "success",
            message: "Transaction form updated successfully and dispute is being resolved",
            data: {
                dispute: updateDispute,
            },
        });
    }
    catch (error) {
        console.log("error", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.sellerResolveDispute = sellerResolveDispute;
