import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .no-anomalies-notice {
    margin: 0;
    padding: 8px 10px;
    border-radius: 8px;
    background: color-mix(
      in srgb,
      var(--primary-color, #03a9f4) 8%,
      transparent
    );
    border: 1px solid
      color-mix(in srgb, var(--primary-color, #03a9f4) 20%, transparent);
    color: var(--secondary-text-color);
    font-size: 0.8rem;
    line-height: 1.45;
  }

  .no-anomalies-notice strong {
    color: var(--primary-text-color);
    font-weight: 600;
  }
`;
