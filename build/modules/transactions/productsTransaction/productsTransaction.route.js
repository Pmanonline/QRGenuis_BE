"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_middleware_1 = require("../../../middlewares/asyncHandler.middleware");
const productsTransaction_controller_1 = require("./productsTransaction.controller");
// import protectRoutes from "../../../middlewares/protectRoutes.middleware";
const escrowProductTransactionRouter = (0, express_1.Router)();
// we need a middleware that checks if you should be in here
escrowProductTransactionRouter
    .route("/initiate-escrow-product-transaction")
    .post((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.initiateEscrowProductTransaction));
escrowProductTransactionRouter
    .route("/seller-confirm-escrow-product-transaction")
    .post((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.sellerConfirmsAnEscrowProductTransaction));
escrowProductTransactionRouter
    .route("/verify-escrow-product-transaction-payment")
    .put((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.verifyEscrowProductTransactionPayment));
escrowProductTransactionRouter
    .route("/seller-fill-out-shipping-details")
    .post((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.sellerFillOutShippingDetails));
escrowProductTransactionRouter
    .route("/get-all-escrow-product-transaction/:user_email")
    .get((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.getAllEscrowProductTransactionByUser));
escrowProductTransactionRouter
    .route("/get-all-shipping-details/:user_email")
    .get((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.getAllShippingDetails));
// GET ALL SHIPPING DETAILS WITH AGGREGATION
escrowProductTransactionRouter
    .route("/get-all-shipping-details-with-aggregation/:user_email")
    .get((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.getAllShippingDetailsWithAggregation));
escrowProductTransactionRouter
    .route("/buyer-confirms-product")
    .put((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.buyerConfirmsProduct));
escrowProductTransactionRouter
    .route("/cancel-transaction/:transaction_id")
    .put((0, asyncHandler_middleware_1.asyncHandler)(productsTransaction_controller_1.cancelEscrowProductTransaction));
exports.default = escrowProductTransactionRouter;
