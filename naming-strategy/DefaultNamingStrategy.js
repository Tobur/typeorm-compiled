"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var RandomGenerator_1 = require("../util/RandomGenerator");
var StringUtils_1 = require("../util/StringUtils");
var Table_1 = require("../schema-builder/table/Table");
/**
 * Naming strategy that is used by default.
 */
var DefaultNamingStrategy = /** @class */ (function () {
    function DefaultNamingStrategy() {
    }
    /**
     * Normalizes table name.
     *
     * @param targetName Name of the target entity that can be used to generate a table name.
     * @param userSpecifiedName For example if user specified a table name in a decorator, e.g. @Entity("name")
     */
    DefaultNamingStrategy.prototype.tableName = function (targetName, userSpecifiedName) {
        return userSpecifiedName ? userSpecifiedName : StringUtils_1.snakeCase(targetName);
    };
    /**
     * Creates a table name for a junction table of a closure table.
     *
     * @param originalClosureTableName Name of the closure table which owns this junction table.
     */
    DefaultNamingStrategy.prototype.closureJunctionTableName = function (originalClosureTableName) {
        return originalClosureTableName + "_closure";
    };
    DefaultNamingStrategy.prototype.columnName = function (propertyName, customName, embeddedPrefixes) {
        if (embeddedPrefixes.length)
            return StringUtils_1.camelCase(embeddedPrefixes.join("_")) + (customName ? StringUtils_1.titleCase(customName) : StringUtils_1.titleCase(propertyName));
        return customName ? customName : propertyName;
    };
    DefaultNamingStrategy.prototype.relationName = function (propertyName) {
        return propertyName;
    };
    DefaultNamingStrategy.prototype.primaryKeyName = function (tableOrName, columnNames) {
        // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
        var clonedColumnNames = __spread(columnNames);
        clonedColumnNames.sort();
        var tableName = tableOrName instanceof Table_1.Table ? tableOrName.name : tableOrName;
        var replacedTableName = tableName.replace(".", "_");
        var key = replacedTableName + "_" + clonedColumnNames.join("_");
        return "PK_" + RandomGenerator_1.RandomGenerator.sha1(key).substr(0, 27);
    };
    DefaultNamingStrategy.prototype.uniqueConstraintName = function (tableOrName, columnNames) {
        // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
        var clonedColumnNames = __spread(columnNames);
        clonedColumnNames.sort();
        var tableName = tableOrName instanceof Table_1.Table ? tableOrName.name : tableOrName;
        var replacedTableName = tableName.replace(".", "_");
        var key = replacedTableName + "_" + clonedColumnNames.join("_");
        return "UQ_" + RandomGenerator_1.RandomGenerator.sha1(key).substr(0, 27);
    };
    DefaultNamingStrategy.prototype.relationConstraintName = function (tableOrName, columnNames, where) {
        // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
        var clonedColumnNames = __spread(columnNames);
        clonedColumnNames.sort();
        var tableName = tableOrName instanceof Table_1.Table ? tableOrName.name : tableOrName;
        var replacedTableName = tableName.replace(".", "_");
        var key = replacedTableName + "_" + clonedColumnNames.join("_");
        if (where)
            key += "_" + where;
        return "REL_" + RandomGenerator_1.RandomGenerator.sha1(key).substr(0, 26);
    };
    DefaultNamingStrategy.prototype.defaultConstraintName = function (tableOrName, columnName) {
        var tableName = tableOrName instanceof Table_1.Table ? tableOrName.name : tableOrName;
        var replacedTableName = tableName.replace(".", "_");
        var key = replacedTableName + "_" + columnName;
        return "DF_" + RandomGenerator_1.RandomGenerator.sha1(key).substr(0, 27);
    };
    DefaultNamingStrategy.prototype.foreignKeyName = function (tableOrName, columnNames) {
        // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
        var clonedColumnNames = __spread(columnNames);
        clonedColumnNames.sort();
        var tableName = tableOrName instanceof Table_1.Table ? tableOrName.name : tableOrName;
        var replacedTableName = tableName.replace(".", "_");
        var key = replacedTableName + "_" + clonedColumnNames.join("_");
        return "FK_" + RandomGenerator_1.RandomGenerator.sha1(key).substr(0, 27);
    };
    DefaultNamingStrategy.prototype.indexName = function (tableOrName, columnNames, where) {
        // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
        var clonedColumnNames = __spread(columnNames);
        clonedColumnNames.sort();
        var tableName = tableOrName instanceof Table_1.Table ? tableOrName.name : tableOrName;
        var replacedTableName = tableName.replace(".", "_");
        var key = replacedTableName + "_" + clonedColumnNames.join("_");
        if (where)
            key += "_" + where;
        return "IDX_" + RandomGenerator_1.RandomGenerator.sha1(key).substr(0, 26);
    };
    DefaultNamingStrategy.prototype.checkConstraintName = function (tableOrName, expression) {
        var tableName = tableOrName instanceof Table_1.Table ? tableOrName.name : tableOrName;
        var replacedTableName = tableName.replace(".", "_");
        var key = replacedTableName + "_" + expression;
        return "CHK_" + RandomGenerator_1.RandomGenerator.sha1(key).substr(0, 26);
    };
    DefaultNamingStrategy.prototype.joinColumnName = function (relationName, referencedColumnName) {
        return StringUtils_1.camelCase(relationName + "_" + referencedColumnName);
    };
    DefaultNamingStrategy.prototype.joinTableName = function (firstTableName, secondTableName, firstPropertyName, secondPropertyName) {
        return StringUtils_1.snakeCase(firstTableName + "_" + firstPropertyName.replace(/\./gi, "_") + "_" + secondTableName);
    };
    DefaultNamingStrategy.prototype.joinTableColumnDuplicationPrefix = function (columnName, index) {
        return columnName + "_" + index;
    };
    DefaultNamingStrategy.prototype.joinTableColumnName = function (tableName, propertyName, columnName) {
        return StringUtils_1.camelCase(tableName + "_" + (columnName ? columnName : propertyName));
    };
    DefaultNamingStrategy.prototype.joinTableInverseColumnName = function (tableName, propertyName, columnName) {
        return this.joinTableColumnName(tableName, propertyName, columnName);
    };
    /**
     * Adds globally set prefix to the table name.
     * This method is executed no matter if prefix was set or not.
     * Table name is either user's given table name, either name generated from entity target.
     * Note that table name comes here already normalized by #tableName method.
     */
    DefaultNamingStrategy.prototype.prefixTableName = function (prefix, tableName) {
        return prefix + tableName;
    };
    return DefaultNamingStrategy;
}());
exports.DefaultNamingStrategy = DefaultNamingStrategy;
//# sourceMappingURL=DefaultNamingStrategy.js.map