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
var OrmUtils = /** @class */ (function () {
    function OrmUtils() {
    }
    // -------------------------------------------------------------------------
    // Public methods
    // -------------------------------------------------------------------------
    /**
     * Chunks array into peaces.
     */
    OrmUtils.chunk = function (array, size) {
        return Array.from(Array(Math.ceil(array.length / size)), function (_, i) {
            return array.slice(i * size, i * size + size);
        });
    };
    OrmUtils.splitClassesAndStrings = function (clsesAndStrings) {
        return [
            (clsesAndStrings).filter(function (cls) { return typeof cls !== "string"; }),
            (clsesAndStrings).filter(function (str) { return typeof str === "string"; }),
        ];
    };
    OrmUtils.groupBy = function (array, propertyCallback) {
        return array.reduce(function (groupedArray, value) {
            var key = propertyCallback(value);
            var grouped = groupedArray.find(function (i) { return i.id === key; });
            if (!grouped) {
                grouped = { id: key, items: [] };
                groupedArray.push(grouped);
            }
            grouped.items.push(value);
            return groupedArray;
        }, []);
    };
    OrmUtils.uniq = function (array, criteriaOrProperty) {
        return array.reduce(function (uniqueArray, item) {
            var found = false;
            if (criteriaOrProperty instanceof Function) {
                var itemValue_1 = criteriaOrProperty(item);
                found = !!uniqueArray.find(function (uniqueItem) { return criteriaOrProperty(uniqueItem) === itemValue_1; });
            }
            else if (typeof criteriaOrProperty === "string") {
                found = !!uniqueArray.find(function (uniqueItem) { return uniqueItem[criteriaOrProperty] === item[criteriaOrProperty]; });
            }
            else {
                found = uniqueArray.indexOf(item) !== -1;
            }
            if (!found)
                uniqueArray.push(item);
            return uniqueArray;
        }, []);
    };
    OrmUtils.isObject = function (item) {
        return (item && typeof item === "object" && !Array.isArray(item));
    };
    /**
     * Deep Object.assign.
     *
     * @see http://stackoverflow.com/a/34749873
     */
    OrmUtils.mergeDeep = function (target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        if (!sources.length)
            return target;
        var source = sources.shift();
        if (this.isObject(target) && this.isObject(source)) {
            for (var key in source) {
                var propertyKey = key;
                if (source[key] instanceof Promise)
                    continue;
                // if (source[key] instanceof Promise) {
                //     propertyKey = "__" + key + "__";
                // }
                if (this.isObject(source[propertyKey])
                    && !(source[propertyKey] instanceof Map)
                    && !(source[propertyKey] instanceof Set)
                    && !(source[propertyKey] instanceof Date)
                    && !(source[propertyKey] instanceof Buffer)) {
                    if (!target[key])
                        Object.assign(target, (_a = {}, _a[key] = Object.create(Object.getPrototypeOf(source[propertyKey])), _a));
                    this.mergeDeep(target[key], source[propertyKey]);
                }
                else {
                    Object.assign(target, (_b = {}, _b[key] = source[propertyKey], _b));
                }
            }
        }
        return this.mergeDeep.apply(this, __spread([target], sources));
        var _a, _b;
    };
    /**
     * Deep compare objects.
     *
     * @see http://stackoverflow.com/a/1144249
     */
    OrmUtils.deepCompare = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var i, l, leftChain, rightChain;
        if (arguments.length < 1) {
            return true; // Die silently? Don't know how to handle such case, please help...
            // throw "Need two or more arguments to compare";
        }
        for (i = 1, l = arguments.length; i < l; i++) {
            leftChain = []; // Todo: this can be cached
            rightChain = [];
            if (!this.compare2Objects(leftChain, rightChain, arguments[0], arguments[i])) {
                return false;
            }
        }
        return true;
    };
    /**
     * Transforms given value into boolean value.
     */
    OrmUtils.toBoolean = function (value) {
        if (typeof value === "boolean")
            return value;
        if (typeof value === "string")
            return value === "true" || value === "1";
        if (typeof value === "number")
            return value > 0;
        return false;
    };
    /**
     * Composes an object from the given array of keys and values.
     */
    OrmUtils.zipObject = function (keys, values) {
        return keys.reduce(function (object, column, index) {
            object[column] = values[index];
            return object;
        }, {});
    };
    /**
     * Compares two arrays.
     */
    OrmUtils.isArraysEqual = function (arr1, arr2) {
        if (arr1.length !== arr2.length)
            return false;
        return arr1.every(function (element) {
            return arr2.indexOf(element) !== -1;
        });
    };
    // -------------------------------------------------------------------------
    // Private methods
    // -------------------------------------------------------------------------
    OrmUtils.compare2Objects = function (leftChain, rightChain, x, y) {
        var p;
        // remember that NaN === NaN returns false
        // and isNaN(undefined) returns true
        if (isNaN(x) && isNaN(y) && typeof x === "number" && typeof y === "number")
            return true;
        // Compare primitives and functions.
        // Check if both arguments link to the same object.
        // Especially useful on the step where we compare prototypes
        if (x === y)
            return true;
        if (x.equals instanceof Function && x.equals(y))
            return true;
        // Works in case when functions are created in constructor.
        // Comparing dates is a common scenario. Another built-ins?
        // We can even handle functions passed across iframes
        if ((typeof x === "function" && typeof y === "function") ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number))
            return x.toString() === y.toString();
        // At last checking prototypes as good as we can
        if (!(x instanceof Object && y instanceof Object))
            return false;
        if (x.isPrototypeOf(y) || y.isPrototypeOf(x))
            return false;
        if (x.constructor !== y.constructor)
            return false;
        if (x.prototype !== y.prototype)
            return false;
        // Check for infinitive linking loops
        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1)
            return false;
        // Quick checking of one object being a subset of another.
        // todo: cache the structure of arguments[0] for performance
        for (p in y) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
        }
        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
            switch (typeof (x[p])) {
                case "object":
                case "function":
                    leftChain.push(x);
                    rightChain.push(y);
                    if (!this.compare2Objects(leftChain, rightChain, x[p], y[p])) {
                        return false;
                    }
                    leftChain.pop();
                    rightChain.pop();
                    break;
                default:
                    if (x[p] !== y[p]) {
                        return false;
                    }
                    break;
            }
        }
        return true;
    };
    return OrmUtils;
}());
exports.OrmUtils = OrmUtils;
//# sourceMappingURL=OrmUtils.js.map