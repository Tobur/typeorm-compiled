"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("../../");
/**
 * Column decorator is used to mark a specific class property as a table column.
 * Only properties decorated with this decorator will be persisted to the database when entity be saved.
 * This column creates an integer PRIMARY COLUMN with generated set to true.
 */
function PrimaryGeneratedColumn(strategyOrOptions, maybeOptions) {
    // normalize parameters
    var options = {};
    var strategy;
    if (strategyOrOptions) {
        if (typeof strategyOrOptions === "string")
            strategy = strategyOrOptions;
        if (strategyOrOptions instanceof Object) {
            strategy = "increment";
            Object.assign(options, strategyOrOptions);
        }
    }
    else {
        strategy = "increment";
    }
    if (maybeOptions instanceof Object)
        Object.assign(options, maybeOptions);
    return function (object, propertyName) {
        // if column type is not explicitly set then determine it based on generation strategy
        if (!options.type)
            options.type = strategy === "increment" ? Number : "uuid";
        // explicitly set a primary and generated to column options
        options.primary = true;
        // register column metadata args
        _1.getMetadataArgsStorage().columns.push({
            target: object.constructor,
            propertyName: propertyName,
            mode: "regular",
            options: options
        });
        // register generated metadata args
        _1.getMetadataArgsStorage().generations.push({
            target: object.constructor,
            propertyName: propertyName,
            strategy: strategy
        });
    };
}
exports.PrimaryGeneratedColumn = PrimaryGeneratedColumn;
//# sourceMappingURL=PrimaryGeneratedColumn.js.map