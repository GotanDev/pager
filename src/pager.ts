/** @copyright Gotan */

function pager(cssSelector) {
    class Pager {
        /** Pager container DOM Element
         */
        public container: HTMLElement;


        constructor(cssSelector: string) {
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
            console.debug(`Initiate Page for ${cssSelector}`);


            // CSS classes init
            this.container.classList.add('pager');
            document.querySelectorAll('section').forEach(s => s.classList.add('section'));
            document.querySelectorAll('slide').forEach(s => s.classList.add('slide'));

            document.querySelectorAll('.section').forEach(section => {

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

            // Event catching
            window.onresize = this.sizeSections;
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


        sizeSections() {

        }


    }

    return function () {
        const pager = new Pager(cssSelector);
        return {
            container: this.container
        };
    }();
}
