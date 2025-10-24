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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediatorResolveDispute = exports.getAllDisputeForAMediator = exports.involveAMediator = exports.mediatorLogin = void 0;
const validation_utilities_1 = require("../../utilities/validation.utilities");
const mediator_model_1 = __importDefault(require("./mediator.model"));
const errorHandling_middleware_1 = require("../../middlewares/errorHandling.middleware");
const mediator_mail_1 = require("./mediator.mail");
const bcrypt_1 = __importDefault(require("bcrypt"));
const createSessionAndSendToken_util_1 = require("../../utilities/createSessionAndSendToken.util");
const productDispute_model_1 = __importDefault(require("../disputes/productsDispute/productDispute.model"));
// import ProductResolution from "../disputes/productsDispute/productResolution.model";
const productDispute_mail_1 = require("../disputes/productsDispute/productDispute.mail");
// move unboard and get all mediator to admin module//
// this works but its not returning any response in its body
// export const onboardAMediator = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const {
//     first_name,
//     middle_name,
//     last_name,
//     mediator_email,
//     mediator_phone_number,
//     password,
//   } = req.body;
//   validateFormFields(
//     {
//       first_name,
//       // middle_name,
//       last_name,
//       mediator_email,
//       // mediator_phone_number,
//       password,
//     },
//     next
//   );
//   try {
//     // check if mediator exist
//     const findMediator = await MediatorModel.findOne({
//       mediator_email: mediator_email,
//     });
//     // console.log(findMediator);
//     if (findMediator) {
//       return next(
//         errorHandler(400, "Mediator already exist, please proceed to login")
//       );
//     }
//     const hashedPassword = bcrypt.hashSync(password, 10);
//     // console.log(hashedPassword);
//     const addNewMediatorToSystem = new MediatorModel({
//       first_name,
//       // middle_name,
//       last_name,
//       mediator_email,
//       mediator_phone_number,
//       password: hashedPassword,
//     });
//     await addNewMediatorToSystem.save();
//     await sendMediatorLoginDetailsMail(first_name, mediator_email, password);
//     res.status(200).json({
//       // addNewMediatorToSystem,
//       status: "success",
//       message: "Mediator has been added successfully and a mail sent",
//     });
//   } catch (error: unknown) {
//     console.error("Error adding mediator: ", error);
//     return next(errorHandler(500, "Internal server error"));
//   }
// };
// export const getAllMediators = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const fetchAllMediators = await MediatorModel.find()
//     .select("-password")
//     .sort({ createdAt: -1 });
//   if (fetchAllMediators?.length === 0) {
//     return next(errorHandler(404, "no mediators present in the system"));
//   } else {
//     res.json({
//       fetchAllMediators,
//       status: "success",
//       message: "All mediators fetched successfully",
//     });
//   }
// };
const mediatorLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { mediator_email, password } = req.body;
    (0, validation_utilities_1.validateFormFields)({
        mediator_email,
        password,
    }, next);
    try {
        const mediatorToLogin = yield mediator_model_1.default.findOne({
            mediator_email,
        }).select("+password");
        if (!mediatorToLogin) {
            return next((0, errorHandling_middleware_1.errorHandler)(401, "Invalid email"));
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, mediatorToLogin === null || mediatorToLogin === void 0 ? void 0 : mediatorToLogin.password);
        if (!isPasswordValid) {
            return next((0, errorHandling_middleware_1.errorHandler)(401, "invalid password"));
        }
        const _a = mediatorToLogin.toObject(), { password: _ } = _a, mediatorWithoutPassword = __rest(_a, ["password"]);
        const sessionResponse = yield (0, createSessionAndSendToken_util_1.createSessionAndSendTokens)({
            user: mediatorWithoutPassword,
            userAgent: req.get("user-agent") || "",
            role: "mediator",
            message: "Mediator successfully logged in",
        });
        res.status(200).json({
            status: sessionResponse.status,
            message: sessionResponse.message,
            user: sessionResponse.user,
            accessToken: sessionResponse.accessToken,
            refreshToken: sessionResponse.refreshToken,
        });
    }
    catch (error) {
        console.error("Error logging in: ", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
    // You can now use mediatorWithoutPassword as needed
});
exports.mediatorLogin = mediatorLogin;
const involveAMediator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transaction_id } = req.params;
    if (!transaction_id) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction ID is required"));
    }
    try {
        const dispute = yield productDispute_model_1.default.findOne({ transaction_id }).populate("transaction user mediator");
        if (!dispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "Dispute not found"));
        }
        if ((dispute === null || dispute === void 0 ? void 0 : dispute.dispute_status) === "resolved" ||
            (dispute === null || dispute === void 0 ? void 0 : dispute.dispute_status) === "cancelled") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, `Cannot involve a mediator: Dispute is ${dispute === null || dispute === void 0 ? void 0 : dispute.dispute_status}`));
        }
        // Check if a mediator is already assigned
        let currentMediator = null;
        let needsReassignment = false;
        if (dispute === null || dispute === void 0 ? void 0 : dispute.mediator) {
            // Fetch the current mediator's open disputes
            // currentMediator = await MediatorModel.findById(dispute?.mediator)
            //   .select("-password")
            //   .populate({
            //     path: "disputes",
            //     match: { dispute_status: { $in: ["processing", "resolving"] } },
            //   });
            // if (currentMediator && (currentMediator.dispute?.length || 0) >= 5) {
            //   needsReassignment = true;
            // }
            return next((0, errorHandling_middleware_1.errorHandler)(400, "A mediator is already assigned to this dispute"));
        }
        // find a mediator with fewer than 5 open disputes
        const mediators = yield mediator_model_1.default.find()
            .select("-password")
            .populate({
            path: "disputes",
            match: { dispute_status: { $in: ["processing", "resolving"] } },
        });
        // const availableMediator = mediators.find(
        //   (mediator: IMediator) =>
        //     (mediator.dispute?.length || 0) < 5 &&
        //     (mediator?._id as string).toString() !== dispute.mediator?.toString()
        // );
        const availableMediator = mediators.find((mediator) => {
            var _a, _b;
            return (((_a = mediator.dispute) === null || _a === void 0 ? void 0 : _a.length) || 0) < 5 &&
                (mediator === null || mediator === void 0 ? void 0 : mediator._id).toString() !== ((_b = dispute.mediator) === null || _b === void 0 ? void 0 : _b.toString()) &&
                mediator.mediator_email !== dispute.buyer_email &&
                mediator.mediator_email !== dispute.vendor_email;
        });
        // find a mediator with fewer than 5 open disputes
        // const availableMediator = mediators.find(
        //   (mediator: IMediator) =>
        //     (mediator?.dispute?.length || 0) < 5 &&
        //     mediator?._id !== dispute?.mediator
        // );
        if (!availableMediator) {
            return next((0, errorHandling_middleware_1.errorHandler)(404, "No available mediators with fewer than 5 open disputes"));
        }
        // Update ProductDispute with mediator and resolution method
        // const updatedDispute = await ProductDispute.findOneAndUpdate(
        //   { _id: dispute?._id },
        //   {
        //     $set: {
        //       mediator: availableMediator?._id,
        //       dispute_resolution_method: "mediator",
        //       dispute_status: "resolving",
        //     },
        //   },
        //   { new: true, runValidators: true }
        // ).populate("transaction user mediator");
        const updatedDispute = yield productDispute_model_1.default.findByIdAndUpdate({ _id: dispute === null || dispute === void 0 ? void 0 : dispute._id }, {
            $set: {
                mediator: availableMediator === null || availableMediator === void 0 ? void 0 : availableMediator._id,
                dispute_resolution_method: "mediator",
                dispute_status: "resolving",
            },
        }, { new: true, runValidators: true }).populate("transaction user mediator");
        if (!updatedDispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update dispute with mediator"));
        }
        // Update Mediator with the dispute
        // const updatedMediator = await MediatorModel.findByIdAndUpdate(
        //   availableMediator?._id,
        //   { $addToSet: { disputes: dispute?._id } },
        //   { new: true, runValidators: true }
        // ).select("-password");
        // if (!updatedMediator) {
        //   return next(errorHandler(500, "Failed to update mediator with dispute"));
        // }
        const updatedMediator = yield mediator_model_1.default.findByIdAndUpdate(availableMediator._id, { $addToSet: { disputes: dispute._id } }, { new: true, runValidators: true }).select("-password");
        if (!updatedMediator) {
            return next((0, errorHandling_middleware_1.errorHandler)(500, "Failed to update mediator with dispute"));
        }
        // Create a ProductResolution document
        // const newResolution = new ProductResolution({
        //   dispute: dispute?._id,
        //   dispute_id: dispute?.transaction_id,
        //   resolution_description: "Mediation initiated for dispute",
        //   resolution_status: "processing",
        // });
        // await newResolution.save();
        // send email to mediator
        let mediator_email = updatedMediator === null || updatedMediator === void 0 ? void 0 : updatedMediator.mediator_email;
        let mediator_first_name = updatedMediator === null || updatedMediator === void 0 ? void 0 : updatedMediator.first_name;
        let buyer_email = updatedDispute === null || updatedDispute === void 0 ? void 0 : updatedDispute.buyer_email;
        let vendor_email = updatedDispute === null || updatedDispute === void 0 ? void 0 : updatedDispute.vendor_email;
        let product_name = updatedDispute === null || updatedDispute === void 0 ? void 0 : updatedDispute.product_name;
        // Send emails
        try {
            yield Promise.all([
                (0, mediator_mail_1.sendMediatorInvolvementMailToMediator)(mediator_email, mediator_first_name),
                (0, productDispute_mail_1.sendMediatorInvolvementMailToBuyer)(buyer_email, product_name),
                (0, productDispute_mail_1.sendMediatorInvolvementMailToSeller)(vendor_email, product_name),
            ]);
            console.log("Emails sent to mediator, buyer, and seller");
        }
        catch (emailError) {
            console.error("Error sending emails:", emailError);
            // Continue despite email failure
        }
        res.status(200).json({
            status: "success",
            message: "Mediator assigned to dispute successfully",
            data: {
                dispute: updatedDispute,
                mediator: updatedMediator.toObject(),
            },
        });
    }
    catch (error) {
        console.error("Error involving mediator:", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal server error"));
    }
});
exports.involveAMediator = involveAMediator;
const getAllDisputeForAMediator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { mediator_email } = req.params;
    // Find mediator by email
    const mediator = yield mediator_model_1.default.findOne({ mediator_email }).select("-password");
    console.log("Found Mediator:", mediator);
    if (!mediator) {
        return next((0, errorHandling_middleware_1.errorHandler)(404, "Mediator not found"));
    }
    // Find all disputes assigned to the mediator
    const disputes = yield productDispute_model_1.default.find({ mediator: mediator._id })
        .sort({ createdAt: -1 })
        .populate("transaction user"); // Populate transaction and user details
    console.log("Found Disputes:", disputes);
    if (disputes.length === 0) {
        return next((0, errorHandling_middleware_1.errorHandler)(404, "No disputes assigned to this mediator"));
    }
    // Convert mediator to plain object to ensure password is excluded
    const mediatorWithoutPassword = mediator.toObject();
    res.status(200).json({
        status: "success",
        message: "Disputes fetched successfully for mediator",
        data: {
            mediator: mediatorWithoutPassword,
            disputes,
        },
    });
});
exports.getAllDisputeForAMediator = getAllDisputeForAMediator;
// to resolve a dispute, you have to fetch all the details of the transaction in dispute such as the transaction_id, buyer_email, vendor_email, product_name, product_image, reason_for_dispute, dispute_description, and dispute_status
// trigger mails for both buyers and sellers after the dispute is resolved
// and then update the dispute status to resolved
// and then update the transaction status to completed
const mediatorResolveDispute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transaction_id } = req.params;
    const { dispute_fault, resolution_description } = req.body;
    if (!transaction_id) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Transaction ID is required"));
    }
    if (!dispute_fault || !["buyer", "seller"].includes(dispute_fault)) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Fault must be either a buyer or seller"));
    }
    if (!resolution_description) {
        return next((0, errorHandling_middleware_1.errorHandler)(400, "Resolution description must be provided"));
    }
    try {
        const dispute = yield productDispute_model_1.default.findOne({ transaction_id }).populate("transaction user mediator");
        if (!dispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "dispute not raised for this transaction"));
        }
        if (!(dispute === null || dispute === void 0 ? void 0 : dispute.mediator)) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "No mediator has been assigned to this dispute"));
        }
        if ((dispute === null || dispute === void 0 ? void 0 : dispute.dispute_status) !== "resolving") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, `Cannot resolve dispute as it is in ${dispute === null || dispute === void 0 ? void 0 : dispute.dispute_status}`));
        }
        const updatedDispute = yield productDispute_model_1.default.findByIdAndUpdate(dispute === null || dispute === void 0 ? void 0 : dispute._id, {
            $set: {
                dispute_status: "resolved",
                dispute_fault,
                resolution_description,
            },
        }, { new: true, runValidators: true }).populate("transaction user mediator");
        if (!updatedDispute) {
            return next((0, errorHandling_middleware_1.errorHandler)(400, "dispute not resolved successfully"));
        }
        let buyer_email = updatedDispute === null || updatedDispute === void 0 ? void 0 : updatedDispute.buyer_email;
        let vendor_email = updatedDispute === null || updatedDispute === void 0 ? void 0 : updatedDispute.vendor_email;
        let product_name = updatedDispute === null || updatedDispute === void 0 ? void 0 : updatedDispute.product_name;
        let resolution_description_result = updatedDispute === null || updatedDispute === void 0 ? void 0 : updatedDispute.resolution_description;
        let dispute_fault_result = updatedDispute === null || updatedDispute === void 0 ? void 0 : updatedDispute.dispute_fault;
        yield Promise.all([
            (0, mediator_mail_1.sendResolutionMailToBuyer)(buyer_email, product_name, resolution_description_result, dispute_fault_result),
            (0, mediator_mail_1.sendResolutionMailToSeller)(vendor_email, product_name, resolution_description_result, dispute_fault_result),
        ]);
        res.status(200).json({
            status: "success",
            message: "Dispute resolved successfully",
            data: {
                dispute: updatedDispute,
            },
        });
    }
    catch (error) {
        console.error("Error resolving dispute", error);
        return next((0, errorHandling_middleware_1.errorHandler)(500, "Internal Server Error"));
    }
});
exports.mediatorResolveDispute = mediatorResolveDispute;
