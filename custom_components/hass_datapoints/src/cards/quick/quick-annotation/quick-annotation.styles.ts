import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .annotation-row {
    display: grid;
    gap: 6px;
  }

  .annotation-label {
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--secondary-text-color);
  }

  textarea {
    width: 100%;
    min-height: 92px;
    resize: vertical;
    box-sizing: border-box;
    padding: 10px 12px;
    border: 1px solid
      var(--input-outlined-idle-border-color, var(--divider-color, #9e9e9e));
    border-radius: 12px;
    background: var(
      --card-background-color,
      var(--primary-background-color, #fff)
    );
    color: var(--primary-text-color);
    font: inherit;
    line-height: 1.45;
  }
`;
