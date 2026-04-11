import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    pointer-events: none;
  }
  .message {
    position: absolute;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--secondary-text-color);
    font-size: 0.95rem;
    z-index: 2;
  }
  .message.visible {
    display: flex;
  }
`;
