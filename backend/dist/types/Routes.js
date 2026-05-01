"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteTypes = void 0;
/**
 * Route request/response types
 */
exports.RouteTypes = {
    Login: {
        request: "LoginRequest",
        response: "AuthResponse",
    },
    Register: {
        request: "RegisterRequest",
        response: "AuthResponse",
    },
    GetUser: {
        request: "{ id: string }",
        response: "GetUserResponse",
    },
};
