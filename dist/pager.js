var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function pager(cssSelector, options) {
    if (options === void 0) { options = {}; }
    var Pager = (function () {
        function Pager(cssSelector, options) {
            if (options === void 0) { options = {}; }
            this.defaultOptions = {
                keyboard: false,
                zoom: false,
                infinite: {
                    section: false,
                    slide: true
                }
            };
            this._self = this;
            this.options = __assign(__assign({}, this.defaultOptions), options);
            this.init(cssSelector);
        }
        Pager.prototype.init = function (cssSelector) {
            var _this = this;
            this.container = document.querySelector(cssSelector);
            if (this.container == null) {
                throw new Error("Element not found from selector '".concat(cssSelector, "' while initiating Wake.Page"));
            }
            window.pagerInstance = this;
            this.container.options = this.options;
            this.container.classList.add('pager');
            var sectionCount = 0;
            this.container.querySelectorAll('section, .section').forEach(function (section) {
                section.classList.add('section');
                section.dataset.sectionId = "" + (sectionCount);
                if (section.id == '') {
                    section.id = "section-".concat(sectionCount);
                }
                var slideCount = 0;
                section.querySelectorAll('slide, .slide').forEach(function (slide) {
                    slide.classList.add('slide');
                    slide.dataset.sectionId = "" + (sectionCount);
                    slide.dataset.slideId = "" + (slideCount);
                    if (slide.id == '') {
                        slide.id = "slide-".concat(sectionCount, "-").concat(slideCount);
                    }
                    slideCount++;
                });
                sectionCount++;
            });
            this.container.toggleZoom = this.toggleZoom;
            this.container.goto = this.goto;
            this.container.gotoElement = this.gotoElement;
            this.container.nextSlide = this.nextSlide;
            this.container.previousSlide = this.previousSlide;
            this.container.nextSection = this.nextSection;
            this.container.previousSection = this.previousSection;
            this.container.querySelectorAll('.section').forEach(function (section) {
                _this.addIntermediateContainer(section);
                var slidesCount = section.querySelectorAll('.slide').length;
                if (slidesCount > 1) {
                    section.querySelector('.container').style.width = (100 * slidesCount) + 'vw';
                    section.classList.add('slides');
                    section.querySelectorAll('.slide').forEach(_this.addIntermediateContainer);
                }
            });
            if (this.options.keyboard) {
                document.onkeydown = this.keyboardShortcuts;
            }
            if (this.options.zoom) {
                this.container.querySelectorAll('.slide, .section:not(.slides)')
                    .forEach(function (s) {
                    s.addEventListener('click', function () {
                        var pager = this.closest('.pager');
                        if (pager.classList.contains('zoom')) {
                            pager.querySelectorAll('.active').forEach(function (a) { return a.classList.remove('active'); });
                            pager.toggleZoom();
                            setTimeout(function (pager, element) {
                                pager.gotoElement(element);
                            }, 750, pager, this);
                        }
                    });
                });
            }
            window.addEventListener('hashchange', this.hashManagement);
            if (document.location.hash != '') {
                this.hashManagement();
            }
            else {
                this.goto(0, 0);
            }
        };
        Pager.prototype.addIntermediateContainer = function (section) {
            var container = document.createElement('container');
            container.classList.add('container');
            container.innerHTML = section.innerHTML;
            section.innerHTML = '';
            section.appendChild(container);
        };
        Pager.prototype.hashManagement = function () {
            if (window.nohashtrigger) {
                delete window.nohashtrigger;
                return;
            }
            var hash = document.location.hash.substring(1);
            var element = document.getElementById(hash);
            if (element != null && (element.classList.contains('slide') || element.classList.contains('section'))) {
                var sectionId = parseInt(element.dataset.sectionId);
                var slideId = element.dataset.slideId == null ? null : parseInt(element.dataset.slideId);
                document.querySelector('.pager').goto(sectionId, slideId);
            }
        };
        Pager.prototype.keyboardShortcuts = function (event) {
            var container = document.querySelector('.pager');
            switch (event.key) {
                case 'Escape':
                    container.toggleZoom();
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    container.previousSection();
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    container.nextSection();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    container.previousSlide();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    container.nextSlide();
                    break;
            }
        };
        Pager.prototype.toggleZoom = function (focus) {
            var container = document.querySelector('.pager');
            if (!container.options.zoom) {
                return;
            }
            container.querySelectorAll('.section').forEach(function (s) { return s.scrollTo(0, 0); });
            container.dispatchEvent(new CustomEvent("zoom"));
            if (container.classList.contains('zoom')) {
                container.classList.remove('zoom');
                container.style.transform = '';
            }
            else {
                window.scrollBy({
                    left: -window.scrollX,
                    top: -window.scrollY,
                    behavior: 'smooth'
                });
                container.classList.add('zoom');
                var maxCell_1 = container.querySelectorAll('.section').length;
                container.querySelectorAll('.section').forEach(function (s) { return maxCell_1 = Math.max(maxCell_1, s.querySelectorAll('.slide').length); });
                container.style.transform = 'scale(' + (1 / maxCell_1) + ')';
            }
        };
        Pager.prototype.goto = function (sectionId, slideId, scrollBehavior) {
            var _a;
            if (slideId === void 0) { slideId = null; }
            if (scrollBehavior === void 0) { scrollBehavior = 'smooth'; }
            var container = document.querySelector('.pager');
            container.querySelectorAll('.active').forEach(function (a) { return a.classList.remove('active'); });
            if (container.classList.contains('zoom')) {
                container.toggleZoom();
            }
            var activeElement;
            if (slideId == null) {
                activeElement = container.querySelector(" .section[data-section-id=\"".concat(sectionId, "\"]"));
                if (activeElement.querySelectorAll('.slide').length > 0) {
                    activeElement = activeElement.querySelector('.slide');
                    slideId = activeElement.dataset.slideId;
                }
            }
            else {
                activeElement = container.querySelector(" .section[data-section-id=\"".concat(sectionId, "\"] .slide[data-slide-id=\"").concat(slideId, "\"]"));
            }
            console.log("Goto [".concat(sectionId, ",").concat(slideId, "]"));
            if (activeElement == null) {
                throw new Error("No slide '".concat(sectionId, ".").concat(slideId, "' available"));
            }
            activeElement.classList.add('active');
            window.scrollBy({
                left: 0,
                top: (_a = activeElement.offsetTop - window.scrollY) !== null && _a !== void 0 ? _a : 0,
                behavior: scrollBehavior
            });
            if (activeElement.classList.contains('slide')) {
                activeElement.closest('.section').scrollBy({
                    left: activeElement.offsetLeft - (isNaN(activeElement.scrollX) ? 0 : activeElement.scrollX),
                    top: 0,
                    behavior: scrollBehavior
                });
            }
            window.nohashtrigger = true;
            window.location.hash = '#' + activeElement.id;
        };
        Pager.prototype.gotoElement = function (element) {
            var _a;
            var pager = element.closest('.pager');
            pager.goto(element.dataset.sectionId, (_a = element.dataset.slideId) !== null && _a !== void 0 ? _a : null);
        };
        Pager.prototype.nextSlide = function () {
            var pager = document.querySelector('.pager');
            var activeElement = pager.querySelector('.active');
            var sectionId = parseInt(activeElement.dataset.sectionId);
            var targetElement = null;
            if (activeElement.classList.contains('section')) {
                targetElement = activeElement.querySelector('.slide');
            }
            else if (activeElement.classList.contains('slide')) {
                var slideId = parseInt(activeElement.dataset.slideId);
                if (activeElement.nextElementSibling == null) {
                    if (this.options.infinite.slide) {
                        targetElement = activeElement.parentElement.firstElementChild;
                    }
                }
                else {
                    targetElement = activeElement.nextElementSibling;
                }
            }
            if (targetElement != null) {
                pager.gotoElement(targetElement);
            }
        };
        Pager.prototype.previousSlide = function () {
            var pager = document.querySelector('.pager');
            var activeElement = pager.querySelector('.active');
            var sectionId = parseInt(activeElement.dataset.sectionId);
            var targetElement = null;
            if (activeElement.classList.contains('section')) {
                targetElement = activeElement.querySelector('.slide');
            }
            else {
                var slideId = parseInt(activeElement.dataset.slideId);
                if (activeElement.previousElementSibling == null) {
                    if (this.options.infinite.slide) {
                        targetElement = activeElement.parentElement.lastElementChild;
                    }
                }
                else {
                    targetElement = activeElement.previousElementSibling;
                }
            }
            if (targetElement != null) {
                pager.gotoElement(targetElement);
            }
        };
        Pager.prototype.nextSection = function () {
            var pager = document.querySelector('.pager');
            var activeElement = pager.querySelector('.active');
            if (activeElement.classList.contains('slide')) {
                activeElement = activeElement.closest('.section');
            }
            var sectionId = parseInt(activeElement.dataset.sectionId);
            var targetElement = null;
            if (activeElement.nextElementSibling == null) {
                if (this.options.infinite.section) {
                    targetElement = activeElement.parentElement.firstElementChild;
                }
            }
            else {
                targetElement = activeElement.nextElementSibling;
            }
            if (targetElement != null) {
                pager.gotoElement(targetElement);
            }
        };
        Pager.prototype.previousSection = function () {
            var pager = document.querySelector('.pager');
            var activeElement = pager.querySelector('.active');
            if (activeElement.classList.contains('slide')) {
                activeElement = activeElement.closest('.section');
            }
            var sectionId = parseInt(activeElement.dataset.sectionId);
            var targetElement = null;
            if (activeElement.previousElementSibling == null) {
                if (this.options.infinite.section) {
                    targetElement = activeElement.parentElement.lastElementChild;
                }
            }
            else {
                targetElement = activeElement.previousElementSibling;
            }
            if (targetElement != null) {
                pager.gotoElement(targetElement);
            }
        };
        return Pager;
    }());
    return function () {
        var pager = new Pager(cssSelector, options);
        return {
            container: this.container
        };
    }();
}
//# sourceMappingURL=pager.js.map