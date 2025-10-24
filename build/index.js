"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const morgan_1 = __importDefault(require("morgan"));
const dbconn_config_1 = __importDefault(require("./config/dbconn.config"));
const organizationAuth_route_1 = __importDefault(require("./modules/authentication/organizationUserAuth/organizationAuth.route"));
const individualAuth_route_1 = __importDefault(require("./modules/authentication/individualUserAuth/individualAuth.route"));
const errorHandler_util_1 = require("./utilities/errorHandler.util");
const prodSwagger_1 = require("./prodSwagger");
const devSwagger_1 = require("./devSwagger");
const deserializeUser_middleware_1 = __importDefault(require("./middlewares/deserializeUser.middleware"));
//import protectRoutes from "./middlewares/protectRoutes.middleware";
//import individualRoutes from "./modules/users/individualUsers/individualUsers.route";
const individualUsers_route_1 = __importDefault(require("./modules/users/individualUsers/individualUsers.route"));
const getOrganizationUser_route_1 = __importDefault(require("./modules/users/organization/getOrganizationUser.route"));
const userAuth_route_1 = __importDefault(require("./modules/authentication/userAuth.route"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandling_middleware_1 = require("./middlewares/errorHandling.middleware");
const productsTransaction_route_1 = __importDefault(require("./modules/transactions/productsTransaction/productsTransaction.route"));
const productDispute_route_1 = __importDefault(require("./modules/disputes/productsDispute/productDispute.route"));
const admin_route_1 = __importDefault(require("./modules/administrator/admin.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// app.use(cors());
app.use((0, cors_1.default)({
    origin: "*",
    credentials: false,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.use((0, morgan_1.default)("dev"));
app.use(deserializeUser_middleware_1.default);
// app.use(cors());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.get("/", (req, res) => {
    res.json({ msg: "welcome to doshbox api updated test" });
});
app.use("/auth/organization", organizationAuth_route_1.default);
app.use("/auth/individual", individualAuth_route_1.default);
app.use("/auth", userAuth_route_1.default);
app.use("/user", getOrganizationUser_route_1.default);
app.use("/users", individualUsers_route_1.default);
// transaction
app.use("/transactions", productsTransaction_route_1.default);
// disputes
app.use("/disputes", productDispute_route_1.default);
// mediator
// admin route
app.use("/admin", admin_route_1.default);
app.use(errorHandler_util_1.errorHandler);
const devSpec = (0, swagger_jsdoc_1.default)(devSwagger_1.options);
const prodSpec = (0, swagger_jsdoc_1.default)(prodSwagger_1.options);
app.use("/dev-api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(devSpec));
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(prodSpec));
// export app for vercel
exports.default = app;
const PORT = process.env.PORT;
(0, dbconn_config_1.default)()
    .then(() => {
    try {
        console.log("connected to mongoose");
        app.listen(PORT, () => {
            console.log(`server is running on http://localhost:${PORT}`);
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        throw new Error(error);
    }
})
    .catch((error) => {
    throw new Error(error);
});
app.use(errorHandling_middleware_1.errorHandlingMiddleware);
