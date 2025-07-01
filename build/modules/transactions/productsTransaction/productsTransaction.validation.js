"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProductFields = void 0;
const errorHandling_middleware_1 = require("../../../middlewares/errorHandling.middleware"); // Adjust the import path as necessary
const validateProductFields = (fields, next) => {
    for (const [key, value] of Object.entries(fields)) {
        if (!value || value === "") {
            return next((0, errorHandling_middleware_1.errorHandler)(400, `${key.replace("_", " ")} is required`));
        }
    }
};
exports.validateProductFields = validateProductFields;
