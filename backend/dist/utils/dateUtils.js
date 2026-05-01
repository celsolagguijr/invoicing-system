"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDateString = toDateString;
/**
 * Normalizes a date value to a "YYYY-MM-DD" string for storage in TypeORM
 * `date` type columns.
 *
 * Using `new Date("YYYY-MM-DD")` parses the string as UTC midnight, which
 * TypeORM then converts to a local-timezone date string via `getFullYear()`,
 * `getMonth()`, and `getDate()`. In timezones behind UTC this produces the
 * previous calendar day. Passing the plain date string directly to TypeORM
 * avoids any timezone conversion.
 */
function toDateString(date) {
    if (typeof date === "string") {
        return date;
    }
    return date.toISOString().slice(0, 10);
}
