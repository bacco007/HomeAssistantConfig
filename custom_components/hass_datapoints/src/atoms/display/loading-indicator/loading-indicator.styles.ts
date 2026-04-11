import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    pointer-events: none;
  }
  .wrapper {
    display: none;
    align-items: center;
    justify-content: center;
    width: calc(var(--spacing, 8px) * 3);
    height: calc(var(--spacing, 8px) * 3);
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--card-background-color, #fff) 92%,
      transparent
    );
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }
  .wrapper.active {
    display: inline-flex;
  }
  .spinner {
    width: calc(var(--spacing, 8px) * 2);
    height: calc(var(--spacing, 8px) * 2);
    border-radius: 50%;
    border: 2px solid
      color-mix(in srgb, var(--primary-color, #03a9f4) 22%, transparent);
    border-top-color: var(--primary-color, #03a9f4);
    animation: spin 0.9s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
