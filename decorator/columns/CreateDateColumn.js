"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("../../");
/**
 * This column will store a creation date of the inserted object.
 * Creation date is generated and inserted only once,
 * at the first time when you create an object, the value is inserted into the table, and is never touched again.
 */
function CreateDateColumn(options) {
    return function (object, propertyName) {
        _1.getMetadataArgsStorage().columns.push({
            target: object.constructor,
            propertyName: propertyName,
            mode: "createDate",
            options: options || {}
        });
    };
}
exports.CreateDateColumn = CreateDateColumn;
//# sourceMappingURL=CreateDateColumn.js.map