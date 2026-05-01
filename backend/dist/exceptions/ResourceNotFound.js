"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResourceNotFoundException extends Error {
    constructor(message) {
        super(message);
    }
}
exports.default = ResourceNotFoundException;
