/**
 * Class representing a Preview Item (.preview__item)
 */
export class PreviewItem {
  // DOM elements
  DOM = {
    // main element (.preview__item)
    el: null as HTMLElement | null,
    // title (.preview__item-title)
    title: null as HTMLElement | null,
    // grid (.grid)
    grid: null as HTMLElement | null,
    // images (.cell__img)
    images: [] as HTMLElement[],
  };

  /**
   * Constructor.
   * @param {Element} DOM_el - main element (.preview__item)
   */
  constructor(DOM_el: HTMLElement) {
    this.DOM.el = DOM_el;
    this.DOM.title = this.DOM.el.querySelector('.preview__item-title > .oh__inner') as HTMLElement;
    this.DOM.grid = this.DOM.el.querySelector('.grid') as HTMLElement;
    this.DOM.images = [...(this.DOM.grid?.querySelectorAll('.cell__img') || [])] as HTMLElement[];
  }
}
