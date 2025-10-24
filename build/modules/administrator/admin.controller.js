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
exports.getAllMediators = exports.onboardAMediator = void 0;
const validation_utilities_1 = require("../../utilities/validation.utilities");
const mediator_model_1 = __importDefault(require("../mediator/mediator.model"));
const errorHandling_middleware_1 = require("../../middlewares/errorHandling.middleware");
const mediator_mail_1 = require("../mediator/mediator.mail");
const bcrypt_1 = __importDefault(require("bcrypt"));
// this works but its not returning any response in its body
const onboardAMediator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { first_name, middle_name, last_name, mediator_email, mediator_phone_number, password, } = req.body;
    (0, validation_utilities_1.validateFormFields)({
        first_name,
        // middle_name,
        last_name,
        mediator_email,
        // mediator_phone_number,
        password,
    }, next);
    try {
        // check if mediator exist
        const findMediator = yield mediator_model_1.default.findOne({
            mediator_email: mediator_email,
        });
        // console.log(findMediator);
        if (findMediator) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Mediator already exist, please proceed to login"));
        }
        const hashedPassword = bcrypt_1.default.hashSync(password, 10);
        // console.log(hashedPassword);
        const addNewMediatorToSystem = new mediator_model_1.default({
            first_name,
            // middle_name,
            last_name,
            mediator_email,
            mediator_phone_number,
            password: hashedPassword,
        });
        yield addNewMediatorToSystem.save();
        yield (0, mediator_mail_1.sendMediatorLoginDetailsMail)(first_name, mediator_email, password);
        res.status(200).json({
            // addNewMediatorToSystem,
            status: "success",
            message: "Mediator has been added successfully and a mail sent",
        });
    }
    catch (error) {
        console.error("Error adding mediator: ", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.onboardAMediator = onboardAMediator;
const getAllMediators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const fetchAllMediators = yield mediator_model_1.default.find()
        .select("-password")
        .sort({ createdAt: -1 });
    if ((fetchAllMediators === null || fetchAllMediators === void 0 ? void 0 : fetchAllMediators.length) === 0) {
        return next((0, errorHandling_middleware_1.errorHandler)(404, "no mediators present in the system"));
    }
    else {
        res.json({
            fetchAllMediators,
            status: "success",
            message: "All mediators fetched successfully",
        });
    }
});
exports.getAllMediators = getAllMediators;
