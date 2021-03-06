"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PlatformTools_1 = require("../../platform/PlatformTools");
var OrmUtils_1 = require("../../util/OrmUtils");
/**
 * Reads connection options from environment variables.
 * Environment variables can have only a single connection.
 * Its strongly required to define TYPEORM_CONNECTION env variable.
 */
var ConnectionOptionsEnvReader = /** @class */ (function () {
    function ConnectionOptionsEnvReader() {
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Reads connection options from environment variables.
     */
    ConnectionOptionsEnvReader.prototype.read = function () {
        return {
            type: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_CONNECTION") || (PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_URL") ? PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_URL").split("://")[0] : undefined),
            url: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_URL"),
            host: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_HOST"),
            port: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_PORT"),
            username: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_USERNAME"),
            password: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_PASSWORD"),
            database: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_DATABASE"),
            sid: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_SID"),
            schema: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_SCHEMA"),
            extra: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_DRIVER_EXTRA") ? JSON.parse(PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_DRIVER_EXTRA")) : undefined,
            synchronize: OrmUtils_1.OrmUtils.toBoolean(PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_SYNCHRONIZE")),
            dropSchema: OrmUtils_1.OrmUtils.toBoolean(PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_DROP_SCHEMA")),
            migrationsRun: OrmUtils_1.OrmUtils.toBoolean(PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_MIGRATIONS_RUN")),
            entities: this.stringToArray(PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_ENTITIES")),
            migrations: this.stringToArray(PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_MIGRATIONS")),
            subscribers: this.stringToArray(PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_SUBSCRIBERS")),
            logging: this.transformLogging(PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_LOGGING")),
            logger: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_LOGGER"),
            entityPrefix: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_ENTITY_PREFIX"),
            maxQueryExecutionTime: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_MAX_QUERY_EXECUTION_TIME"),
            cli: {
                entitiesDir: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_ENTITIES_DIR"),
                migrationsDir: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_MIGRATIONS_DIR"),
                subscribersDir: PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_SUBSCRIBERS_DIR"),
            }
        };
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Transforms logging string into real logging value connection requires.
     */
    ConnectionOptionsEnvReader.prototype.transformLogging = function (logging) {
        if (logging === "true" || logging === "TRUE" || logging === "1")
            return true;
        if (logging === "all")
            return "all";
        return this.stringToArray(logging);
    };
    /**
     * Converts a string which contains multiple elements split by comma into a string array of strings.
     */
    ConnectionOptionsEnvReader.prototype.stringToArray = function (variable) {
        if (!variable)
            return [];
        return variable.split(",").map(function (str) { return str.trim(); });
    };
    return ConnectionOptionsEnvReader;
}());
exports.ConnectionOptionsEnvReader = ConnectionOptionsEnvReader;
//# sourceMappingURL=ConnectionOptionsEnvReader.js.map