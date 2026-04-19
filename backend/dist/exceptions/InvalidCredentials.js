"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InvalidCredentials extends Error {
    constructor(message) {
        super(message);
    }
}
exports.default = InvalidCredentials;
