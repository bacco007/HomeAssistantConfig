import { css } from "lit";

export const styles = css`
  :host {
    position: absolute;
    top: 43px;
    left: 0;
    transform: translate(-50%, 0);
    padding: calc(var(--dp-spacing-sm) + 2px) calc(var(--dp-spacing-md) + 2px);
    border-radius: 10px;
    background: color-mix(in srgb, #0f1218 96%, transparent);
    color: rgba(255, 255, 255, 0.96);
    border: 1px solid color-mix(in srgb, #ffffff 14%, transparent);
    font-size: 0.86rem;
    line-height: 1.1;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 120ms ease,
      visibility 120ms ease;
    z-index: 8;
  }

  :host([visible]) {
    opacity: 1;
    visibility: visible;
  }

  :host([side="end"]) {
    z-index: 9;
  }

  :host::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    width: 10px;
    height: 10px;
    background: inherit;
    transform: translate(-50%, -50%) rotate(45deg);
    border-radius: 2px;
  }

  .live-hint {
    display: block;
    font-size: 0.78rem;
    opacity: 0.72;
    margin-top: 4px;
  }
`;
