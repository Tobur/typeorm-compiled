"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("../../");
/**
 * JoinColumn decorator used on one-to-one relations to specify owner side of relationship.
 * It also can be used on both one-to-one and many-to-one relations to specify custom column name
 * or custom referenced column.
 */
function JoinColumn(optionsOrOptionsArray) {
    return function (object, propertyName) {
        var options = optionsOrOptionsArray instanceof Array ? optionsOrOptionsArray : [optionsOrOptionsArray || {}];
        options.forEach(function (options) {
            _1.getMetadataArgsStorage().joinColumns.push({
                target: object.constructor,
                propertyName: propertyName,
                name: options.name,
                referencedColumnName: options.referencedColumnName
            });
        });
    };
}
exports.JoinColumn = JoinColumn;
//# sourceMappingURL=JoinColumn.js.map