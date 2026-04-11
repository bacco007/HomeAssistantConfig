import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .feedback {
    font-size: 0.82em;
    margin-top: var(--dp-feedback-margin-top, 8px);
    padding: var(--dp-feedback-padding, 6px 10px);
    border-radius: var(--dp-feedback-radius, 6px);
    display: none;
  }

  .feedback.visible {
    display: block;
  }

  .feedback.ok {
    background: rgba(76, 175, 80, 0.12);
    color: var(--success-color, #4caf50);
  }

  .feedback.err {
    background: rgba(244, 67, 54, 0.12);
    color: var(--error-color, #f44336);
  }
`;
