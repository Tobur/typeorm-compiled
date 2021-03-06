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
Object.defineProperty(exports, "__esModule", { value: true });
var QueryBuilderUtils_1 = require("../QueryBuilderUtils");
var ObjectUtils_1 = require("../../util/ObjectUtils");
var RelationCountAttribute = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function RelationCountAttribute(expressionMap, relationCountAttribute) {
        this.expressionMap = expressionMap;
        ObjectUtils_1.ObjectUtils.assign(this, relationCountAttribute || {});
    }
    Object.defineProperty(RelationCountAttribute.prototype, "joinInverseSideMetadata", {
        // -------------------------------------------------------------------------
        // Public Methods
        // -------------------------------------------------------------------------
        get: function () {
            return this.relation.inverseEntityMetadata;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationCountAttribute.prototype, "parentAlias", {
        /**
         * Alias of the parent of this join.
         * For example, if we join ("post.category", "categoryAlias") then "post" is a parent alias.
         * This value is extracted from entityOrProperty value.
         * This is available when join was made using "post.category" syntax.
         */
        get: function () {
            if (!QueryBuilderUtils_1.QueryBuilderUtils.isAliasProperty(this.relationName))
                throw new Error("Given value must be a string representation of alias property");
            return this.relationName.split(".")[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationCountAttribute.prototype, "relationProperty", {
        /**
         * Relation property name of the parent.
         * This is used to understand what is joined.
         * For example, if we join ("post.category", "categoryAlias") then "category" is a relation property.
         * This value is extracted from entityOrProperty value.
         * This is available when join was made using "post.category" syntax.
         */
        get: function () {
            if (!QueryBuilderUtils_1.QueryBuilderUtils.isAliasProperty(this.relationName))
                throw new Error("Given value is a string representation of alias property");
            return this.relationName.split(".")[1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationCountAttribute.prototype, "junctionAlias", {
        get: function () {
            var _a = __read(this.relationName.split("."), 2), parentAlias = _a[0], relationProperty = _a[1];
            return parentAlias + "_" + relationProperty + "_rc";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationCountAttribute.prototype, "relation", {
        /**
         * Relation of the parent.
         * This is used to understand what is joined.
         * This is available when join was made using "post.category" syntax.
         */
        get: function () {
            if (!QueryBuilderUtils_1.QueryBuilderUtils.isAliasProperty(this.relationName))
                throw new Error("Given value is a string representation of alias property");
            var _a = __read(this.relationName.split("."), 2), parentAlias = _a[0], propertyPath = _a[1];
            var relationOwnerSelection = this.expressionMap.findAliasByName(parentAlias);
            var relation = relationOwnerSelection.metadata.findRelationWithPropertyPath(propertyPath);
            if (!relation)
                throw new Error("Relation with property path " + propertyPath + " in entity was not found.");
            return relation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationCountAttribute.prototype, "metadata", {
        /**
         * Metadata of the joined entity.
         * If table without entity was joined, then it will return undefined.
         */
        get: function () {
            if (!QueryBuilderUtils_1.QueryBuilderUtils.isAliasProperty(this.relationName))
                throw new Error("Given value is a string representation of alias property");
            var parentAlias = this.relationName.split(".")[0];
            var selection = this.expressionMap.findAliasByName(parentAlias);
            return selection.metadata;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RelationCountAttribute.prototype, "mapToPropertyPropertyName", {
        get: function () {
            return this.mapToProperty.split(".")[1];
        },
        enumerable: true,
        configurable: true
    });
    return RelationCountAttribute;
}());
exports.RelationCountAttribute = RelationCountAttribute;
//# sourceMappingURL=RelationCountAttribute.js.map