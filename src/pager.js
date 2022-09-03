"use strict";
/** @copyright Gotan */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pager = void 0;
function pager(cssSelector) {
    var Pager = /** @class */ (function () {
        function Pager(cssSelector) {
            this.init();
        }
        Pager.prototype.init = function () {
            window.onresize = this.sizeSections;
        };
        Pager.prototype.sizeSections = function () {
        };
        return Pager;
    }());
    return function () {
        this.container = document.querySelector(cssSelector);
        this.init();
        if (this.container == null) {
            throw new Error("Element not found from selector '".concat(cssSelector, "' while initiating Wake.Page"));
        }
        console.debug("Initiate Page for ".concat(cssSelector));
        var r = {
            container: this.container
        };
        this.container.pager = r;
        return r;
    }();
}
exports.pager = pager;
//# sourceMappingURL=pager.js.map