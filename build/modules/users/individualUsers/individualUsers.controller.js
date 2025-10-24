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
exports.updateIndividualUser = exports.getIndividualUser = void 0;
const individualUserAuth_model_1 = __importDefault(require("../../authentication/individualUserAuth/individualUserAuth.model"));
const organizationAuth_model_1 = __importDefault(require("../../authentication/organizationUserAuth/organizationAuth.model"));
/** GET: http://localhost:5000/users/user/:user_id */
const getIndividualUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(res.locals.user);
    return res.status(200).json({
        status: true,
        message: "Logged in user profile",
        data: res.locals.user,
    });
});
exports.getIndividualUser = getIndividualUser;
/** GET: http://localhost:5000/users */
// export const getAllIndividualUsers = async (req: Request, res: Response) => {};
//  * @param: {
//  * "id": "<userid>"
//  * }
//  *
//  * body: {
//  * "email": "kor@gmail.com",
//  * "phonenum": "1232455",
//  * "username": "jane doe",
//  * "fullname": "Ada Jones"
//  * }
//  */
/** PUT: http://localhost:5000/users/updateuser
 * @param: {
 * "id": "<userid>"
 * }
 *
 * body: {
 * "email": "kor@gmail.com",
 * "phonenum": "1232455",
 * "username": "jane doe",
 * "fullname": "Ada Jones"
 * }
 */
const updateIndividualUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userData } = res.locals.user;
    const { phone_number, name, contact_email, contact_number } = req.body;
    if (userData.role === "ind") {
        const updatedUser = yield individualUserAuth_model_1.default.findOneAndUpdate({ email: userData.email }, { name, phone_number });
        return res.status(200).json({
            message: "Individual user sucessfully updated",
            updatedUser,
        });
    }
    else if (userData.role === "org") {
        const updatedUser = yield organizationAuth_model_1.default.findOneAndUpdate({ organization_email: userData.organization_email }, { contact_email, contact_number }, { new: true });
        return res.status(200).json({
            message: "Organization user sucessfully updated",
            updatedUser,
        });
    }
});
exports.updateIndividualUser = updateIndividualUser;
/** DELETE: http://localhost:5000/users/deleteuser */
// export const deleteIndividualUser = async (req: Request, res: Response) => {};
