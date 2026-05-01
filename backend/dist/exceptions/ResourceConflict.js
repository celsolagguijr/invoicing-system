"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResourceConflict extends Error {
    constructor(message, details = null) {
        super(message);
        this.details = details;
    }
}
exports.default = ResourceConflict;
