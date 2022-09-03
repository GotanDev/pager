/** @copyright Gotan */


function pager(cssSelector, options = {}) {
    class Pager {
        /** Pager container DOM Element
         */
        public container: HTMLElement;

        private _self: Pager;

        private defaultOptions = {
            // Enable keyboard navigation
            keyboard: false,
            // Global map enabled
            zoom: false,
            infinite: { // Infinite navigation
                // Loop vertical navigation
                section: false,
                // Loop horizontal navigation
                slide: true
            }

        };

        private options: any;


        constructor(cssSelector: string, options: any = {}) {
            this._self = this;
            this.options = {
                ...this.defaultOptions,
                ...options
            }
            this.init(cssSelector);
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
            let sectionCount = 0;
            this.container.querySelectorAll('section, .section').forEach(section => {
                (section as HTMLElement).classList.add('section');
                (section as HTMLElement).dataset.sectionId = "" + (sectionCount);
                if (section.id == '') {
                    section.id = `section-${sectionCount}`;
                }
                let slideCount = 0;
                section.querySelectorAll('slide, .slide').forEach(slide => {
                    (slide as HTMLElement).classList.add('slide');
                    (slide as HTMLElement).dataset.sectionId = "" + (sectionCount);
                    (slide as HTMLElement).dataset.slideId = "" + (slideCount);
                    if (slide.id == '') {
                        slide.id = `slide-${sectionCount}-${slideCount}`;
                    }
                    slideCount++;
                });
                sectionCount++;
            });


            // Copy main functions to DOM
            (this.container as any).toggleZoom = this.toggleZoom;
            (this.container as any).goto = this.goto;
            (this.container as any).gotoElement = this.gotoElement;
            (this.container as any).nextSlide = this.nextSlide;
            (this.container as any).previousSlide = this.previousSlide;
            (this.container as any).nextSection = this.nextSection;
            (this.container as any).previousSection = this.previousSection;


            // Construct required DOM structure
            this.container.querySelectorAll('.section').forEach(section => {
                this.addIntermediateContainer(section);
                const slidesCount = section.querySelectorAll('.slide').length;
                if (slidesCount > 1) {
                    // Define global with for multi slides section
                    (section.querySelector('.container') as HTMLElement).style.width = (100 * slidesCount) + 'vw';
                    section.classList.add('slides');
                    // Add intermediate container in each level to allow scrolling
                    section.querySelectorAll('.slide').forEach(this.addIntermediateContainer);
                }
            });


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
                                setTimeout(function(pager, element){
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
         * @private
         */
        private addIntermediateContainer(section: Element) {
            const container = document.createElement('container');
            container.classList.add('container');
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
         * @param KeyboardEvent Must contain .key attribute
         * @private
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

            container.querySelectorAll('.section').forEach(s => s.scrollTo(0,0));

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

            if(container.classList.contains('zoom')) {
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
            console.log(`Goto [${sectionId},${slideId}]`);
            if (activeElement == null) {
                throw new Error(`No slide '${sectionId}.${slideId}' available`);
            }

            activeElement.classList.add('active');
            (window as any).scrollBy({
                left: 0,
                top: activeElement.offsetTop - window.scrollY ?? 0,
                behavior: scrollBehavior
            });
            if (activeElement.classList.contains('slide')) {
                activeElement.closest('.section').scrollBy({
                    left:  activeElement.offsetLeft - (isNaN(activeElement.scrollX) ? 0 : activeElement.scrollX),
                    top: 0,
                    behavior: scrollBehavior
                });
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
            const sectionId = parseInt(activeElement.dataset.sectionId);
            let targetElement = null;
            if (activeElement.classList.contains('section')) {
                targetElement = activeElement.querySelector('.slide');
            } else if (activeElement.classList.contains('slide')) {
                const slideId = parseInt(activeElement.dataset.slideId);
                if (activeElement.nextElementSibling == null) {
                    if (this.options.infinite.slide) {
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
                    if (this.options.infinite.slide) {
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
                if (this.options.infinite.section) {
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
                if (this.options.infinite.section) {
                    targetElement = (activeElement.parentElement.lastElementChild as HTMLElement);
                }
            } else {
                targetElement = (activeElement.previousElementSibling as HTMLElement);
            }
            if (targetElement != null) {
                pager.gotoElement(targetElement);
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
