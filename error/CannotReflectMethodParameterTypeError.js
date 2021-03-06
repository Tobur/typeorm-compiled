"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Thrown when ORM cannot get method parameter's type.
 * Basically, when reflect-metadata is not available or tsconfig is not properly setup.
 */
var CannotReflectMethodParameterTypeError = /** @class */ (function (_super) {
    __extends(CannotReflectMethodParameterTypeError, _super);
    function CannotReflectMethodParameterTypeError(target, methodName) {
        var _this = _super.call(this) || this;
        _this.name = "CannotReflectMethodParameterTypeError";
        Object.setPrototypeOf(_this, CannotReflectMethodParameterTypeError.prototype);
        _this.message = "Cannot get reflected type for a \"" + methodName + "\" method's parameter of \"" + target.name + "\" class. " +
            "Make sure you have turned on an \"emitDecoratorMetadata\": true option in tsconfig.json. " +
            "Also make sure you have imported \"reflect-metadata\" on top of the main entry file in your application.";
        return _this;
    }
    return CannotReflectMethodParameterTypeError;
}(Error));
exports.CannotReflectMethodParameterTypeError = CannotReflectMethodParameterTypeError;
//# sourceMappingURL=CannotReflectMethodParameterTypeError.js.map