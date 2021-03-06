"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("../../");
/**
 * Classes decorated with this decorator will listen to ORM events and their methods will be triggered when event
 * occurs. Those classes must implement EventSubscriberInterface interface.
 */
function EventSubscriber() {
    return function (target) {
        _1.getMetadataArgsStorage().entitySubscribers.push({
            target: target
        });
    };
}
exports.EventSubscriber = EventSubscriber;
//# sourceMappingURL=EventSubscriber.js.map