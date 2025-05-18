import { PreviewItem } from './PreviewItem';

/**
 * Class representing a Row (.row)
 */
export class Row {
  // DOM elements
  DOM = {
    // main element (.row)
    el: null as HTMLElement | null,
    // title (.cell__title > .oh__inner)
    title: null as HTMLElement | null,
    // title wrap
    titleWrap: null as HTMLElement | null,
    // images wrap
    imagesWrap: null as HTMLElement | null,
    // images (.cell__img)
    images: [] as HTMLElement[],
  };

  previewItem: PreviewItem;

  /**
   * Constructor.
   * @param {Element} DOM_el - main element (.row)
   * @param {Element} DOM_previewItem - preview item element
   */
  constructor(DOM_el: HTMLElement, DOM_previewItem: HTMLElement) {
    this.DOM.el = DOM_el;
    this.previewItem = new PreviewItem(DOM_previewItem);
    this.DOM.titleWrap = this.DOM.el.querySelector('.cell__title') as HTMLElement;
    this.DOM.title = this.DOM.titleWrap?.querySelector('.oh__inner') as HTMLElement;
    this.DOM.imagesWrap = this.DOM.el.querySelector('.cell--images') as HTMLElement;
    this.DOM.images = [...(this.DOM.imagesWrap?.querySelectorAll('.cell__img') || [])] as HTMLElement[];
  }
}
