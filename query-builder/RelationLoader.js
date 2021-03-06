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
/**
 * Wraps entities and creates getters/setters for their relations
 * to be able to lazily load relations when accessing these relations.
 */
var RelationLoader = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function RelationLoader(connection) {
        this.connection = connection;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Loads relation data for the given entity and its relation.
     */
    RelationLoader.prototype.load = function (relation, entityOrEntities, queryRunner) {
        if (queryRunner && queryRunner.isReleased)
            queryRunner = undefined; // get new one if already closed
        if (relation.isManyToOne || relation.isOneToOneOwner) {
            return this.loadManyToOneOrOneToOneOwner(relation, entityOrEntities, queryRunner);
        }
        else if (relation.isOneToMany || relation.isOneToOneNotOwner) {
            return this.loadOneToManyOrOneToOneNotOwner(relation, entityOrEntities, queryRunner);
        }
        else if (relation.isManyToManyOwner) {
            return this.loadManyToManyOwner(relation, entityOrEntities, queryRunner);
        }
        else { // many-to-many non owner
            return this.loadManyToManyNotOwner(relation, entityOrEntities, queryRunner);
        }
    };
    /**
     * Loads data for many-to-one and one-to-one owner relations.
     *
     * (ow) post.category<=>category.post
     * loaded: category from post
     * example: SELECT category.id AS category_id, category.name AS category_name FROM category category
     *              INNER JOIN post Post ON Post.category=category.id WHERE Post.id=1
     */
    RelationLoader.prototype.loadManyToOneOrOneToOneOwner = function (relation, entityOrEntities, queryRunner) {
        var entities = entityOrEntities instanceof Array ? entityOrEntities : [entityOrEntities];
        var columns = relation.entityMetadata.primaryColumns;
        var joinColumns = relation.isOwning ? relation.joinColumns : relation.inverseRelation.joinColumns;
        var conditions = joinColumns.map(function (joinColumn) {
            return relation.entityMetadata.name + "." + joinColumn.propertyName + " = " + relation.propertyName + "." + joinColumn.referencedColumn.propertyName;
        }).join(" AND ");
        var joinAliasName = relation.entityMetadata.name;
        var qb = this.connection
            .createQueryBuilder(queryRunner)
            .select(relation.propertyName) // category
            .from(relation.type, relation.propertyName) // Category, category
            .innerJoin(relation.entityMetadata.target, joinAliasName, conditions);
        if (columns.length === 1) {
            qb.where(joinAliasName + "." + columns[0].propertyPath + " IN (:..." + (joinAliasName + "_" + columns[0].propertyName) + ")");
            qb.setParameter(joinAliasName + "_" + columns[0].propertyName, entities.map(function (entity) { return columns[0].getEntityValue(entity); }));
        }
        else {
            var condition = entities.map(function (entity, entityIndex) {
                return columns.map(function (column, columnIndex) {
                    var paramName = joinAliasName + "_entity_" + entityIndex + "_" + columnIndex;
                    qb.setParameter(paramName, column.getEntityValue(entity));
                    return joinAliasName + "." + column.propertyPath + " = :" + paramName;
                }).join(" AND ");
            }).map(function (condition) { return "(" + condition + ")"; }).join(" OR ");
            qb.where(condition);
        }
        return qb.getMany();
        // return qb.getOne(); todo: fix all usages
    };
    /**
     * Loads data for one-to-many and one-to-one not owner relations.
     *
     * SELECT post
     * FROM post post
     * WHERE post.[joinColumn.name] = entity[joinColumn.referencedColumn]
     */
    RelationLoader.prototype.loadOneToManyOrOneToOneNotOwner = function (relation, entityOrEntities, queryRunner) {
        var entities = entityOrEntities instanceof Array ? entityOrEntities : [entityOrEntities];
        var aliasName = relation.propertyName;
        var columns = relation.inverseRelation.joinColumns;
        var qb = this.connection
            .createQueryBuilder(queryRunner)
            .select(aliasName)
            .from(relation.inverseRelation.entityMetadata.target, aliasName);
        if (columns.length === 1) {
            qb.where(aliasName + "." + columns[0].propertyPath + " IN (:..." + (aliasName + "_" + columns[0].propertyName) + ")");
            qb.setParameter(aliasName + "_" + columns[0].propertyName, entities.map(function (entity) { return columns[0].referencedColumn.getEntityValue(entity); }));
        }
        else {
            var condition = entities.map(function (entity, entityIndex) {
                return columns.map(function (column, columnIndex) {
                    var paramName = aliasName + "_entity_" + entityIndex + "_" + columnIndex;
                    qb.setParameter(paramName, column.referencedColumn.getEntityValue(entity));
                    return aliasName + "." + column.propertyPath + " = :" + paramName;
                }).join(" AND ");
            }).map(function (condition) { return "(" + condition + ")"; }).join(" OR ");
            qb.where(condition);
        }
        return qb.getMany();
        // return relation.isOneToMany ? qb.getMany() : qb.getOne(); todo: fix all usages
    };
    /**
     * Loads data for many-to-many owner relations.
     *
     * SELECT category
     * FROM category category
     * INNER JOIN post_categories post_categories
     * ON post_categories.postId = :postId
     * AND post_categories.categoryId = category.id
     */
    RelationLoader.prototype.loadManyToManyOwner = function (relation, entityOrEntities, queryRunner) {
        var entities = entityOrEntities instanceof Array ? entityOrEntities : [entityOrEntities];
        var mainAlias = relation.propertyName;
        var joinAlias = relation.junctionEntityMetadata.tableName;
        var joinColumnConditions = relation.joinColumns.map(function (joinColumn) {
            return joinAlias + "." + joinColumn.propertyName + " IN (:..." + joinColumn.propertyName + ")";
        });
        var inverseJoinColumnConditions = relation.inverseJoinColumns.map(function (inverseJoinColumn) {
            return joinAlias + "." + inverseJoinColumn.propertyName + "=" + mainAlias + "." + inverseJoinColumn.referencedColumn.propertyName;
        });
        var parameters = relation.joinColumns.reduce(function (parameters, joinColumn) {
            parameters[joinColumn.propertyName] = entities.map(function (entity) { return joinColumn.referencedColumn.getEntityValue(entity); });
            return parameters;
        }, {});
        return this.connection
            .createQueryBuilder(queryRunner)
            .select(mainAlias)
            .from(relation.type, mainAlias)
            .innerJoin(joinAlias, joinAlias, __spread(joinColumnConditions, inverseJoinColumnConditions).join(" AND "))
            .setParameters(parameters)
            .getMany();
    };
    /**
     * Loads data for many-to-many not owner relations.
     *
     * SELECT post
     * FROM post post
     * INNER JOIN post_categories post_categories
     * ON post_categories.postId = post.id
     * AND post_categories.categoryId = post_categories.categoryId
     */
    RelationLoader.prototype.loadManyToManyNotOwner = function (relation, entityOrEntities, queryRunner) {
        var entities = entityOrEntities instanceof Array ? entityOrEntities : [entityOrEntities];
        var mainAlias = relation.propertyName;
        var joinAlias = relation.junctionEntityMetadata.tableName;
        var joinColumnConditions = relation.inverseRelation.joinColumns.map(function (joinColumn) {
            return joinAlias + "." + joinColumn.propertyName + " = " + mainAlias + "." + joinColumn.referencedColumn.propertyName;
        });
        var inverseJoinColumnConditions = relation.inverseRelation.inverseJoinColumns.map(function (inverseJoinColumn) {
            return joinAlias + "." + inverseJoinColumn.propertyName + " IN (:..." + inverseJoinColumn.propertyName + ")";
        });
        var parameters = relation.inverseRelation.inverseJoinColumns.reduce(function (parameters, joinColumn) {
            parameters[joinColumn.propertyName] = entities.map(function (entity) { return joinColumn.referencedColumn.getEntityValue(entity); });
            return parameters;
        }, {});
        return this.connection
            .createQueryBuilder(queryRunner)
            .select(mainAlias)
            .from(relation.type, mainAlias)
            .innerJoin(joinAlias, joinAlias, __spread(joinColumnConditions, inverseJoinColumnConditions).join(" AND "))
            .setParameters(parameters)
            .getMany();
    };
    /**
     * Wraps given entity and creates getters/setters for its given relation
     * to be able to lazily load data when accessing this relation.
     */
    RelationLoader.prototype.enableLazyLoad = function (relation, entity, queryRunner) {
        var relationLoader = this;
        var dataIndex = "__" + relation.propertyName + "__"; // in what property of the entity loaded data will be stored
        var promiseIndex = "__promise_" + relation.propertyName + "__"; // in what property of the entity loading promise will be stored
        var resolveIndex = "__has_" + relation.propertyName + "__"; // indicates if relation data already was loaded or not, we need this flag if loaded data is empty
        Object.defineProperty(entity, relation.propertyName, {
            get: function () {
                var _this = this;
                if (this[resolveIndex] === true) // if related data already was loaded then simply return it
                    return Promise.resolve(this[dataIndex]);
                if (this[promiseIndex]) // if related data is loading then return a promise relationLoader loads it
                    return this[promiseIndex];
                // nothing is loaded yet, load relation data and save it in the model once they are loaded
                this[promiseIndex] = relationLoader.load(relation, this, queryRunner).then(function (result) {
                    if (relation.isOneToOne || relation.isManyToOne)
                        result = result[0];
                    _this[dataIndex] = result;
                    _this[resolveIndex] = true;
                    delete _this[promiseIndex];
                    return _this[dataIndex];
                });
                return this[promiseIndex];
            },
            set: function (value) {
                var _this = this;
                if (value instanceof Promise) { // if set data is a promise then wait for its resolve and save in the object
                    value.then(function (result) {
                        _this[dataIndex] = result;
                        _this[resolveIndex] = true;
                    });
                }
                else { // if its direct data set (non promise, probably not safe-typed)
                    this[dataIndex] = value;
                    this[resolveIndex] = true;
                }
            },
            configurable: true
        });
    };
    return RelationLoader;
}());
exports.RelationLoader = RelationLoader;
//# sourceMappingURL=RelationLoader.js.map