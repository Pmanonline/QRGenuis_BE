"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
// import protectRoutes from "../../../middlewares/protectRoutes.middleware";
const mediatorRouter = (0, express_1.Router)();
// we need a middleware that checks if you should be in here
mediatorRouter.route("/onboard-mediator").post(admin_controller_1.onboardAMediator);
mediatorRouter.route("/fetch-all-mediators").get(admin_controller_1.getAllMediators);
exports.default = mediatorRouter;
