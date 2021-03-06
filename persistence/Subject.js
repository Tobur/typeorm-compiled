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
var OrmUtils_1 = require("../util/OrmUtils");
/**
 * Subject is a subject of persistence.
 * It holds information about each entity that needs to be persisted:
 * - what entity should be persisted
 * - what is database representation of the persisted entity
 * - what entity metadata of the persisted entity
 * - what is allowed to with persisted entity (insert/update/remove)
 *
 * Having this collection of subjects we can perform database queries.
 */
var Subject = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function Subject(options) {
        var _this = this;
        /**
         * Subject identifier.
         * This identifier is not limited to table entity primary columns.
         * This can be entity id or ids as well as some unique entity properties, like name or title.
         * Insert / Update / Remove operation will be executed by a given identifier.
         */
        this.identifier = undefined;
        /**
         * Copy of entity but with relational ids fulfilled.
         */
        this.entityWithFulfilledIds = undefined;
        /**
         * Changes needs to be applied in the database for the given subject.
         */
        this.changeMaps = [];
        /**
         * Indicates if this subject can be inserted into the database.
         * This means that this subject either is newly persisted, either can be inserted by cascades.
         */
        this.canBeInserted = false;
        /**
         * Indicates if this subject can be updated in the database.
         * This means that this subject either was persisted, either can be updated by cascades.
         */
        this.canBeUpdated = false;
        /**
         * Indicates if this subject MUST be removed from the database.
         * This means that this subject either was removed, either was removed by cascades.
         */
        this.mustBeRemoved = false;
        /**
         * Relations updated by the change maps.
         */
        this.updatedRelationMaps = [];
        /**
         * List of updated columns
         */
        this.diffColumns = [];
        /**
         * List of updated relations
         */
        this.diffRelations = [];
        this.metadata = options.metadata;
        this.entity = options.entity;
        this.databaseEntity = options.databaseEntity;
        this.parentSubject = options.parentSubject;
        if (options.canBeInserted !== undefined)
            this.canBeInserted = options.canBeInserted;
        if (options.canBeUpdated !== undefined)
            this.canBeUpdated = options.canBeUpdated;
        if (options.mustBeRemoved !== undefined)
            this.mustBeRemoved = options.mustBeRemoved;
        if (options.identifier !== undefined)
            this.identifier = options.identifier;
        if (options.changeMaps !== undefined)
            (_a = this.changeMaps).push.apply(_a, __spread(options.changeMaps));
        if (this.entity) {
            this.entityWithFulfilledIds = Object.assign({}, this.entity);
            if (this.parentSubject) {
                this.metadata.primaryColumns.forEach(function (primaryColumn) {
                    if (primaryColumn.relationMetadata && primaryColumn.relationMetadata.inverseEntityMetadata === _this.parentSubject.metadata) {
                        primaryColumn.setEntityValue(_this.entityWithFulfilledIds, _this.parentSubject.entity);
                    }
                });
            }
            this.identifier = this.metadata.getEntityIdMap(this.entityWithFulfilledIds);
        }
        else if (this.databaseEntity) {
            this.identifier = this.metadata.getEntityIdMap(this.databaseEntity);
        }
        var _a;
    }
    Object.defineProperty(Subject.prototype, "mustBeInserted", {
        // -------------------------------------------------------------------------
        // Accessors
        // -------------------------------------------------------------------------
        /**
         * Checks if this subject must be inserted into the database.
         * Subject can be inserted into the database if it is allowed to be inserted (explicitly persisted or by cascades)
         * and if it does not have database entity set.
         */
        get: function () {
            return this.canBeInserted && !this.databaseEntity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Subject.prototype, "mustBeUpdated", {
        /**
         * Checks if this subject must be updated into the database.
         * Subject can be updated in the database if it is allowed to be updated (explicitly persisted or by cascades)
         * and if it does have differentiated columns or relations.
         */
        get: function () {
            return this.canBeUpdated && this.identifier && (this.changeMaps.length > 0 || !!this.metadata.objectIdColumn); // for mongodb we do not compute changes - we always update entity
        },
        enumerable: true,
        configurable: true
    });
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates a value set needs to be inserted / updated in the database.
     * Value set is based on the entity and change maps of the subject.
     * Important note: this method pops data from this subject's change maps.
     */
    Subject.prototype.createValueSetAndPopChangeMap = function () {
        var _this = this;
        var changeMapsWithoutValues = [];
        var changeSet = this.changeMaps.reduce(function (updateMap, changeMap) {
            var value = changeMap.value;
            if (value instanceof Subject) {
                // referenced columns can refer on values both which were just inserted and which were present in the model
                // if entity was just inserted valueSets must contain all values from the entity and values just inserted in the database
                // so, here we check if we have a value set then we simply use it as value to get our reference column values
                // otherwise simply use an entity which cannot be just inserted at the moment and have all necessary data
                value = value.insertedValueSet ? value.insertedValueSet : value.entity;
            }
            // value = changeMap.valueFactory ? changeMap.valueFactory(value) : changeMap.column.createValueMap(value);
            var valueMap;
            if (_this.metadata.isJunction && changeMap.column) {
                valueMap = changeMap.column.createValueMap(changeMap.column.referencedColumn.getEntityValue(value));
            }
            else if (changeMap.column) {
                valueMap = changeMap.column.createValueMap(value);
            }
            else if (changeMap.relation) {
                // value can be a related object, for example: post.question = { id: 1 }
                // or value can be a null or direct relation id, e.g. post.question = 1
                // if its a direction relation id then we just set it to the valueMap,
                // however if its an object then we need to extract its relation id map and set it to the valueMap
                if (value instanceof Object) {
                    // get relation id, e.g. referenced column name and its value,
                    // for example: { id: 1 } which then will be set to relation, e.g. post.category = { id: 1 }
                    var relationId = changeMap.relation.getRelationIdMap(value);
                    // but relation id can be empty, for example in the case when you insert a new post with category
                    // and both post and category are newly inserted objects (by cascades) and in this case category will not have id
                    // this means we need to insert post without question id and update post's questionId once question be inserted
                    // that's why we create a new changeMap operation for future updation of the post entity
                    if (relationId === undefined) {
                        changeMapsWithoutValues.push(changeMap);
                        _this.canBeUpdated = true;
                        return updateMap;
                    }
                    valueMap = changeMap.relation.createValueMap(relationId);
                    _this.updatedRelationMaps.push({ relation: changeMap.relation, value: relationId });
                }
                else { // value can be "null" or direct relation id here
                    valueMap = changeMap.relation.createValueMap(value);
                    _this.updatedRelationMaps.push({ relation: changeMap.relation, value: value });
                }
            }
            OrmUtils_1.OrmUtils.mergeDeep(updateMap, valueMap);
            return updateMap;
        }, {});
        this.changeMaps = changeMapsWithoutValues;
        return changeSet;
    };
    return Subject;
}());
exports.Subject = Subject;
//# sourceMappingURL=Subject.js.map