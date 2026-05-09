import { useCallback } from 'react';

/**
 * Get the pixel coordinates of a specific position in a textarea.
 * Returns {top, left} relative to the textarea element.
 */
export function useCaretPosition() {
  const getPosition = useCallback((element: HTMLTextAreaElement, position: number) => {
    const style = getComputedStyle(element);

    const div = document.createElement('div');
    const copyProps = [
      'boxSizing',
      'width',
      'height',
      'overflowX',
      'overflowY',
      'borderTopWidth',
      'borderRightWidth',
      'borderBottomWidth',
      'borderLeftWidth',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'fontStyle',
      'fontVariant',
      'fontWeight',
      'fontStretch',
      'fontSize',
      'lineHeight',
      'fontFamily',
      'textAlign',
      'textTransform',
      'textIndent',
      'textDecoration',
      'letterSpacing',
      'wordSpacing',
      'whiteSpace',
      'wordWrap',
      'wordBreak',
      'tabSize',
    ] as const;

    copyProps.forEach((prop) => {
      (div.style as any)[prop] = (style as any)[prop];
    });

    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.overflow = 'hidden';

    // Replace newlines with <br/> for the mirror div
    const textBefore = element.value.substring(0, position);
    const textAfter = element.value.substring(position) || '\u00a0';

    div.textContent = textBefore;
    const span = document.createElement('span');
    span.textContent = textAfter;
    div.appendChild(span);

    document.body.appendChild(div);

    const spanRect = span.getBoundingClientRect();
    const parentRect = element.getBoundingClientRect();

    document.body.removeChild(div);

    return {
      top: spanRect.top - parentRect.top + element.scrollTop,
      left: spanRect.left - parentRect.left + element.scrollLeft,
    };
  }, []);

  return getPosition;
}
