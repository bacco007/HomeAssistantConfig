import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 8px;
    padding: 4px var(--dp-spacing-lg, 16px) 8px;
    overflow-y: auto;
    max-height: calc((30px * 3) + 16px);
  }
`;
