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
var Subject_1 = require("../Subject");
/**
 * Finds all cascade operations of the given subject and cascade operations of the found cascaded subjects,
 * e.g. builds a cascade tree and creates a subjects for them.
 */
var CascadesSubjectBuilder = /** @class */ (function () {
    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------
    function CascadesSubjectBuilder(allSubjects) {
        this.allSubjects = allSubjects;
    }
    // ---------------------------------------------------------------------
    // Public Methods
    // ---------------------------------------------------------------------
    /**
     * Builds a cascade subjects tree and pushes them in into the given array of subjects.
     */
    CascadesSubjectBuilder.prototype.build = function (subject) {
        var _this = this;
        subject.metadata
            .extractRelationValuesFromEntity(subject.entity, subject.metadata.relations) // todo: we can create EntityMetadata.cascadeRelations
            .forEach(function (_a) {
            var _b = __read(_a, 3), relation = _b[0], relationEntity = _b[1], relationEntityMetadata = _b[2];
            // we need only defined values and insert or update cascades of the relation should be set
            if (relationEntity === undefined ||
                relationEntity === null ||
                (!relation.isCascadeInsert && !relation.isCascadeUpdate))
                return;
            // if relation entity is just a relation id set (for example post.tag = 1)
            // then we don't really need to check cascades since there is no object to insert or update
            if (!(relationEntity instanceof Object))
                return;
            // if we already has this entity in list of operated subjects then skip it to avoid recursion
            var alreadyExistRelationEntitySubject = _this.findByPersistEntityLike(relationEntityMetadata.target, relationEntity);
            if (alreadyExistRelationEntitySubject) {
                if (alreadyExistRelationEntitySubject.canBeInserted === false) // if its not marked for insertion yet
                    alreadyExistRelationEntitySubject.canBeInserted = relation.isCascadeInsert === true;
                if (alreadyExistRelationEntitySubject.canBeUpdated === false) // if its not marked for update yet
                    alreadyExistRelationEntitySubject.canBeUpdated = relation.isCascadeUpdate === true;
                return;
            }
            // mark subject with what we can do with it
            // and add to the array of subjects to load only if there is no same entity there already
            var relationEntitySubject = new Subject_1.Subject({
                metadata: relationEntityMetadata,
                parentSubject: subject,
                entity: relationEntity,
                canBeInserted: relation.isCascadeInsert === true,
                canBeUpdated: relation.isCascadeUpdate === true
            });
            _this.allSubjects.push(relationEntitySubject);
            // go recursively and find other entities we need to insert/update
            _this.build(relationEntitySubject);
        });
    };
    // ---------------------------------------------------------------------
    // Protected Methods
    // ---------------------------------------------------------------------
    /**
     * Finds subject where entity like given subject's entity.
     * Comparision made by entity id.
     */
    CascadesSubjectBuilder.prototype.findByPersistEntityLike = function (entityTarget, entity) {
        return this.allSubjects.find(function (subject) {
            if (!subject.entity)
                return false;
            if (subject.entity === entity)
                return true;
            return subject.metadata.target === entityTarget && subject.metadata.compareEntities(subject.entityWithFulfilledIds, entity);
        });
    };
    return CascadesSubjectBuilder;
}());
exports.CascadesSubjectBuilder = CascadesSubjectBuilder;
//# sourceMappingURL=CascadesSubjectBuilder.js.map