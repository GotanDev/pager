/** @copyright Gotan */


function pager(cssSelector, options = {}) {
    class Pager {
        /** Pager container DOM Element
         */
        public container: HTMLElement;

        private _self: Pager;


        private colorThemes = {
            // Thanks https://coolors.co/
            'default': {
                odd: {background: '#333333', foreground: "#FFFFFF"},
                even: {background: '#999999', foreground: '#FFFFFF'}
            },
            'cyan': {
                odd: {background: '#19647E', foreground: "#FFFFFF"},
                even: {background: '#28AFB0', foreground: '#FFFFFF'}
            },
            'rainbow': [
                {background: '#1F271B', foreground: '#FAFAFA'},
                {background: '#19647E', foreground: '#FAFAFA'},
                {background: '#28AFB0', foreground: '#FAFAFA'},
                {background: '#F4D35E', foreground: '#1F271B'},
                {background: '#EE964B', foreground: '#1F271B'}
            ]
        };


        private defaultOptions = {
            // Color theme
            theme: 'default',
            // Enable keyboard navigation
            keyboard: false,
            // Global map enabled
            zoom: false,
            infinite: { // Infinite navigation
                // Loop vertical navigation
                section: false,
                // Loop horizontal navigation
                slide: true
            },
            arrows: {
                // Display arrows for vertical navigation
                section: false,
                // Display arrows for horizontal navigation
                slide: true
            },
            debug: false
        };


        private options: any;


        constructor(cssSelector: string, options: any = {}) {
            this._self = this;
            this.options = {
                ...this.defaultOptions,
                ...options
            }
            this.init(cssSelector);
            this.loadColorTheme();
        }

        /** Initiate pager
         *
         * @param cssSelector CSS Selector.
         * Will be run with document.querySelector vanilla feature
         */
        init(cssSelector: string) {
            this.container = document.querySelector(cssSelector);
            if (this.container == null) {
                throw new Error(`Element not found from selector '${cssSelector}' while initiating Wake.Page`);
            }

            (window as any).pagerInstance = this;
            (this.container as any).options = this.options;

            // CSS classes, id & position init
            this.container.classList.add('pager');
            if (this.options.debug) {
                this.container.classList.add('debug');
            }

            let sectionCount = 0;
            const sections = this.container.querySelectorAll('section, .section');
            sections.forEach(section => {
                (section as HTMLElement).classList.add('section');
                (section as HTMLElement).dataset.sectionId = "" + (sectionCount);
                if (section.id == '') {
                    section.id = `section-${sectionCount}`;
                }

                if (section.querySelector('.slide, slide') == null) { // Only one slide & forgotten slide tag
                    this.addIntermediateContainer(section, 'slide');
                }
                this.addIntermediateContainer(section);


                if (this.options.arrows.section && sections.length > 1) {
                    if (section.previousElementSibling != null || this.options.infinite.section) {
                        const arrow = document.createElement('arrow');
                        arrow.classList.add('prev', 'arrow');
                        arrow.onclick = this.previousSection;
                        section.appendChild(arrow);
                    }
                    if (section.nextElementSibling != null || this.options.infinite.section) {
                        const arrow = document.createElement('arrow');
                        arrow.classList.add('next', 'arrow');
                        arrow.onclick = this.nextSection;
                        section.appendChild(arrow);
                    }
                }
                const slides = section.querySelectorAll('.slide, slide');
                if (slides.length > 1) {
                    // Define global with for multi slides section
                    (section.querySelector('.container') as HTMLElement).style.width = (100 * slides.length) + 'vw';
                    section.classList.add('slides');
                }
                let slideCount = 0;
                slides.forEach(slide => {
                    (slide as HTMLElement).classList.add('slide');
                    (slide as HTMLElement).dataset.sectionId = "" + (sectionCount);
                    (slide as HTMLElement).dataset.slideId = "" + (slideCount);
                    if (slide.id == '') {
                        slide.id = `slide-${sectionCount}-${slideCount}`;
                    }
                    // Add intermediate container in each level to allow scrolling
                    this.addIntermediateContainer(slide);

                    if (slides.length > 1 && this.options.arrows.slide && (slide.previousElementSibling != null || this.options.infinite.slide)) {
                        let arrow = document.createElement('arrow');
                        arrow.classList.add('prev', 'arrow');
                        arrow.onclick = this.previousSlide;
                        slide.appendChild(arrow);
                    }
                    if (slides.length > 1 && this.options.arrows.slide && (slide.nextElementSibling != null || this.options.infinite.slide)) {
                        let arrow = document.createElement('arrow');
                        arrow.classList.add('next', 'arrow');
                        arrow.onclick = this.nextSlide;
                        slide.appendChild(arrow);
                    }
                    slideCount++;
                });
                sectionCount++;
            });
            // Construct required DOM structure
            this.container.querySelectorAll('.section').forEach(section => {


            });

            // Copy main functions to DOM
            (this.container as any).toggleZoom = this.toggleZoom;
            (this.container as any).goto = this.goto;
            (this.container as any).gotoElement = this.gotoElement;
            (this.container as any).nextSlide = this.nextSlide;
            (this.container as any).previousSlide = this.previousSlide;
            (this.container as any).nextSection = this.nextSection;
            (this.container as any).previousSection = this.previousSection;


            if (this.options.keyboard) {
                document.onkeydown = this.keyboardShortcuts;
            }

            // Zoom management
            if (this.options.zoom) {
                /* On click on thumbnail in zoom mode, dezoom */
                this.container.querySelectorAll('.slide, .section:not(.slides)')
                    .forEach(s => {
                        s.addEventListener('click', function () {
                            const pager = this.closest('.pager');
                            if (pager.classList.contains('zoom')) {
                                pager.querySelectorAll('.active').forEach(a => a.classList.remove('active'));
                                pager.toggleZoom();
                                setTimeout(function (pager, element) {
                                    pager.gotoElement(element);
                                }, 750, pager, this)

                            }
                        });
                    });
            }


            // Activate Hash
            window.addEventListener('hashchange', this.hashManagement)
            if (document.location.hash != '') {
                this.hashManagement();
            } else {
                this.goto(0, 0);
            }

        }

        /** Ajoute un conteneur intermédiaire à l'emplacement où il y a du contenu
         *
         * @param section
         * @param tagName Tag name for intermediate container
         * @private
         */
        private addIntermediateContainer(section: Element, tagName = 'container') {
            const container = document.createElement(tagName);
            container.classList.add(tagName);
            container.innerHTML = section.innerHTML;
            section.innerHTML = '';
            section.appendChild(container);
        }


        private hashManagement() {
            if ((window as any).nohashtrigger) {
                delete (window as any).nohashtrigger;
                return;
            }
            const hash = document.location.hash.substring(1);
            const element = document.getElementById(hash);

            if (element != null && (element.classList.contains('slide') || element.classList.contains('section'))) {
                const sectionId = parseInt(element.dataset.sectionId);
                const slideId = element.dataset.slideId == null ? null : parseInt(element.dataset.slideId);
                (document.querySelector('.pager') as any).goto(sectionId, slideId);
            }

        }


        /** Shortcuts for keyboard navigation
         *
         * @private
         * @param event KeyboardEvent
         */
        private keyboardShortcuts(event: KeyboardEvent): void {
            const container = (document.querySelector('.pager') as any);
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
        }

        /** Switch l'état du zoom arrière */
        private toggleZoom(focus) {
            const container = (document.querySelector('.pager') as any);
            if (!container.options.zoom) {
                return;
            }

            container.querySelectorAll('.section').forEach(s => s.scrollTo(0, 0));

            container.dispatchEvent(new CustomEvent("zoom"));
            if (container.classList.contains('zoom')) {
                container.classList.remove('zoom');
                container.style.transform = '';
            } else {
                (window as any).scrollBy({
                    left: -window.scrollX,
                    top: -window.scrollY,
                    behavior: 'smooth'
                });
                container.classList.add('zoom');
                let maxCell = container.querySelectorAll('.section').length;
                container.querySelectorAll('.section').forEach(s => maxCell = Math.max(maxCell, s.querySelectorAll('.slide').length))
                container.style.transform = 'scale(' + (1 / maxCell) + ')';
            }
        }

        /** Va directement à la position indiquée.
         *
         * @param sectionId Numéro de section souhaitée
         * @param slideId Numéro de slide souhaitée (optionnel: si non précisé, on ira sur la première)
         */
        public goto(sectionId: number, slideId: number = null, scrollBehavior = 'smooth') {
            const container = (document.querySelector('.pager') as any);
            container.querySelectorAll('.active').forEach(a => a.classList.remove('active'));

            if (container.classList.contains('zoom')) {
                container.toggleZoom();
            }

            let activeElement;
            if (slideId == null) {
                activeElement = container.querySelector(` .section[data-section-id="${sectionId}"]`)
                if (activeElement.querySelectorAll('.slide').length > 0) {
                    activeElement = activeElement.querySelector('.slide');
                    slideId = activeElement.dataset.slideId;
                }
            } else {
                activeElement = container.querySelector(` .section[data-section-id="${sectionId}"] .slide[data-slide-id="${slideId}"]`);
            }
            if (this.options.debug) console.log(`Goto [${sectionId},${slideId}]`);
            if (activeElement == null) {
                throw new Error(`No slide '${sectionId}.${slideId}' available`);
            }

            activeElement.classList.add('active');

            const top = activeElement?.closest('.section') != null ? activeElement?.closest('.section')?.offsetTop - window.scrollY : 0;
            if (top !== 0) {
                if (this.options.debug) {
                    console.log('Vertical offset scroll: ' + top + 'px');
                }
                (window as any).scrollBy({
                    left: 0,
                    top: top,
                    behavior: scrollBehavior
                });
            }

            if (activeElement.classList.contains('slide')) {
                const section = activeElement.closest('.section')
                const left = activeElement.offsetLeft - (isNaN(section.scrollLeft) ? 0 : section.scrollLeft);
                if (left > 0) {
                    if (this.options.debug) {
                        console.log('Horizontal offset scroll: ' + left + 'px');
                    }
                    section.scrollBy({
                        left: left,
                        top: 0,
                        behavior: scrollBehavior
                    });
                }

            }

            (window as any).nohashtrigger = true
            window.location.hash = '#' + activeElement.id;
        }

        public gotoElement(element: HTMLElement) {
            const pager = (element.closest('.pager') as any);
            pager.goto(element.dataset.sectionId, element.dataset.slideId ?? null);
        }

        /** Go to next horizontal slide.
         */
        public nextSlide() {
            const pager = (document.querySelector('.pager') as any);
            const activeElement = (pager.querySelector('.active') as HTMLElement);
            let targetElement = null;
            if (activeElement.classList.contains('section')) {
                targetElement = activeElement.querySelector('.slide');
            } else if (activeElement.classList.contains('slide')) {
                const slideId = parseInt(activeElement.dataset.slideId);
                if (activeElement.nextElementSibling == null) {
                    if (pager.options.infinite.slide) {
                        targetElement = (activeElement.parentElement.firstElementChild as HTMLElement);
                    }
                } else {
                    targetElement = (activeElement.nextElementSibling as HTMLElement);
                }
            }

            if (targetElement != null) {
                pager.gotoElement(targetElement);
            }

        }

        /** Go to previous horizontal slide.
         */
        public previousSlide() {
            const pager = (document.querySelector('.pager') as any);
            const activeElement = (pager.querySelector('.active') as HTMLElement);
            const sectionId = parseInt(activeElement.dataset.sectionId)

            let targetElement = null;
            if (activeElement.classList.contains('section')) {
                targetElement = activeElement.querySelector('.slide');
            } else {
                const slideId = parseInt(activeElement.dataset.slideId);
                if (activeElement.previousElementSibling == null) {
                    if (pager.options.infinite.slide) {
                        targetElement = ((activeElement.parentElement.lastElementChild as HTMLElement));
                    }
                } else {
                    targetElement = (activeElement.previousElementSibling as HTMLElement);
                }
            }
            if (targetElement != null) {
                pager.gotoElement(targetElement);
            }
        }


        /** Go to next vertical section
         */
        public nextSection() {
            const pager = (document.querySelector('.pager') as any);
            let activeElement = (pager.querySelector('.active') as HTMLElement);
            if (activeElement.classList.contains('slide')) {
                activeElement = activeElement.closest('.section');
            }
            const sectionId = parseInt(activeElement.dataset.sectionId)
            let targetElement = null;
            if (activeElement.nextElementSibling == null) {
                if (pager.options.infinite.section) {
                    targetElement = (activeElement.parentElement.firstElementChild as HTMLElement);
                }
            } else {
                targetElement = (activeElement.nextElementSibling as HTMLElement);
            }
            if (targetElement != null) {
                pager.gotoElement(targetElement);
            }
        }

        /** Go to previous horizontal section
         */
        public previousSection() {
            const pager = (document.querySelector('.pager') as any);
            let activeElement = (pager.querySelector('.active') as HTMLElement);
            if (activeElement.classList.contains('slide')) {
                activeElement = activeElement.closest('.section');
            }
            const sectionId = parseInt(activeElement.dataset.sectionId)
            let targetElement = null;
            if (activeElement.previousElementSibling == null) {
                if (pager.options.infinite.section) {
                    targetElement = (activeElement.parentElement.lastElementChild as HTMLElement);
                }
            } else {
                targetElement = (activeElement.previousElementSibling as HTMLElement);
            }
            if (targetElement != null) {
                pager.gotoElement(targetElement);
            }
        }

        /** Load color theme
         *
         * Will use options.theme variable.
         * Can be
         * - either a *themeName* (picked in colorThemes array)
         * - either an odd/even model : {odd: {background: '#hexCode', foreground: '#hexCode'}, even: {backgorund:'', 'foreground:''}}
         * - or a color tuples array [{background: '#hexCode', foreground: '#hexCode'}, ...]
         * @private
         */
        private loadColorTheme() {
            if (typeof this.options.theme === 'string') {
                if (this.colorThemes[this.options.theme] == null) {
                    if (this.options.debug) {
                        console.log("Fallback color theme to default");
                    }
                    this.options.theme = 'default';
                }
                this.options.theme = this.colorThemes[this.options.theme];
            }
            if (this.options.theme instanceof Array) {
                this.container.querySelectorAll('.section').forEach((section: HTMLElement, idx) => {
                    const activeColorTuple = this.options.theme[idx % this.options.theme.length];
                    section.querySelectorAll('.slide').forEach((slide: HTMLElement) => {
                        slide.style.backgroundColor = activeColorTuple.background;
                        slide.style.color = activeColorTuple.foreground;
                    });
                });
            } else {
                if (this.options.theme.odd == null || this.options.theme.even == null) {
                    throw new Error('You must defined odd and even properties in color theme');
                }
                this.container.style.setProperty('--backgroundColor1', this.options.theme.odd.background);
                this.container.style.setProperty('--foreground1', this.options.theme.odd.foreground);
                this.container.style.setProperty('--backgroundColor2', this.options.theme.even.background);
                this.container.style.setProperty('--foreground2', this.options.theme.even.foreground);
            }
        }
    }

    return function () {
        const pager = new Pager(cssSelector, options);
        return {
            container: this.container
        };
    }();


}
