/**
 * Copyright (c) 2020-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 *
 * The **ResizeObserver** interface reports changes to the dimensions of an
 * [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element)'s content
 * or border box, or the bounding box of an
 * [SVGElement](https://developer.mozilla.org/en-US/docs/Web/API/SVGElement).
 *
 * > **Note**: The content box is the box in which content can be placed,
 * > meaning the border box minus the padding and border width. The border box
 * > encompasses the content, padding, and border. See
 * > [The box model](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model)
 * > for further explanation.
 *
 * `ResizeObserver` avoids infinite callback loops and cyclic dependencies that
 * are often created when resizing via a callback function. It does this by only
 * processing elements deeper in the DOM in subsequent frames. Implementations
 * should, if they follow the specification, invoke resize events before paint
 * and after layout.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
 */

// Minimal ResizeObserver type definitions for ArkhamJS React Utils
interface ResizeObserverEntry {
  readonly contentRect: DOMRectReadOnly;
  readonly target: Element;
}

type ResizeObserverCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;

interface ResizeObserverObserveOptions {
  box?: 'content-box' | 'border-box';
}

declare class ResizeObserver {
  constructor(callback: ResizeObserverCallback);
  disconnect(): void;
  observe(target: Element, options?: ResizeObserverObserveOptions): void;
  unobserve(target: Element): void;
}

interface Window {
  ResizeObserver: typeof ResizeObserver;
}
