"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mediator_controller_1 = require("./mediator.controller");
// import protectRoutes from "../../../middlewares/protectRoutes.middleware";
const mediatorRouter = (0, express_1.Router)();
// we need a middleware that checks if you should be in here
mediatorRouter.route("/mediator-login").post(mediator_controller_1.mediatorLogin);
mediatorRouter
    .route("/involve-a-mediator/:transaction_id")
    .post(mediator_controller_1.involveAMediator);
mediatorRouter
    .route("/resolve-dispute/:transaction_id")
    .post(mediator_controller_1.mediatorResolveDispute);
mediatorRouter
    .route("/fetch-all-mediator-dispute/:mediator_email")
    .get(mediator_controller_1.getAllDisputeForAMediator);
exports.default = mediatorRouter;
