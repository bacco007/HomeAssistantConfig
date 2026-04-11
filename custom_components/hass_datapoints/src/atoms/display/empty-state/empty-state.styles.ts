import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--dp-spacing-lg);
    color: var(--secondary-text-color);
    font-size: 0.9rem;
  }
`;
