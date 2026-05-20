/**
 * Shared popup positioning and dismiss-handler utilities.
 *
 * Used by collapsed-sidebar popups in the datapoints panel.
 */

// ── Positioning ───��───────────────────────────��──────────────────────────

export interface PopupPosition {
  top: number;
  left: number;
  maxHeight: number;
}

/**
 * Compute absolute position for a popup anchored to the right of an element.
 *
 * Keeps the popup within the viewport with 8px margin on all sides.
 */
export function computePopupPosition(
  anchorRect: { top: number; right: number },
  popupHeight: number,
  viewportHeight: number,
  gap = 8
): PopupPosition {
  const margin = gap;
  const top = Math.max(
    margin,
    Math.min(anchorRect.top, viewportHeight - popupHeight - margin * 2)
  );
  return {
    top,
    left: anchorRect.right + gap,
    maxHeight: viewportHeight - top - margin * 2,
  };
}

// ── Dismiss handlers ─────────────────────────────────────────────────────

export interface DismissCleanup {
  destroy: () => void;
}

/**
 * Attach outside-click and Escape-key dismiss handlers for a popup.
 *
 * Returns a cleanup object whose `destroy()` removes all listeners.
 *
 * @param popupEl     The popup container element.
 * @param anchorEl    The element that triggered the popup (excluded from outside-click).
 * @param onDismiss   Called when the user clicks outside or presses Escape.
 * @param focusOnEscape  Element to focus after Escape (defaults to anchorEl).
 */
export function attachPopupDismissListeners(
  popupEl: HTMLElement,
  anchorEl: HTMLElement,
  onDismiss: () => void,
  focusOnEscape?: HTMLElement | null
): DismissCleanup {
  const outsideClickHandler = (ev: Event) => {
    const path = ev.composedPath();
    if (!path.includes(popupEl) && !path.includes(anchorEl)) {
      onDismiss();
    }
  };

  const keyHandler = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") {
      onDismiss();
      (focusOnEscape ?? anchorEl).focus();
    }
  };

  document.addEventListener("click", outsideClickHandler, true);
  document.addEventListener("keydown", keyHandler);

  return {
    destroy() {
      document.removeEventListener("click", outsideClickHandler, true);
      document.removeEventListener("keydown", keyHandler);
    },
  };
}
