function pager(cssSelector) {
    var Pager = (function () {
        function Pager(cssSelector) {
            this.init(cssSelector);
        }
        Pager.prototype.init = function (cssSelector) {
            var _this = this;
            this.container = document.querySelector(cssSelector);
            if (this.container == null) {
                throw new Error("Element not found from selector '".concat(cssSelector, "' while initiating Wake.Page"));
            }
            console.debug("Initiate Page for ".concat(cssSelector));
            this.container.classList.add('pager');
            document.querySelectorAll('section').forEach(function (s) { return s.classList.add('section'); });
            document.querySelectorAll('slide').forEach(function (s) { return s.classList.add('slide'); });
            document.querySelectorAll('.section').forEach(function (section) {
                _this.addIntermediateContainer(section);
                var slidesCount = section.querySelectorAll('.slide').length;
                if (slidesCount > 1) {
                    section.querySelector('.container').style.width = (100 * slidesCount) + 'vw';
                    section.classList.add('slides');
                    section.querySelectorAll('.slide').forEach(_this.addIntermediateContainer);
                }
            });
            window.onresize = this.sizeSections;
        };
        Pager.prototype.addIntermediateContainer = function (section) {
            var container = document.createElement('container');
            container.classList.add('container');
            container.innerHTML = section.innerHTML;
            section.innerHTML = '';
            section.appendChild(container);
        };
        Pager.prototype.sizeSections = function () {
        };
        return Pager;
    }());
    return function () {
        var pager = new Pager(cssSelector);
        return {
            container: this.container
        };
    }();
}
//# sourceMappingURL=pager.js.map