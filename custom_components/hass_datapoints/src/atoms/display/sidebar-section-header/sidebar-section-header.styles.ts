import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }
  .sidebar-section-header {
    display: grid;
    gap: var(--dp-spacing-xs);
  }
  .sidebar-section-header.is-collapsible {
    cursor: pointer;
    user-select: none;
  }
  .sidebar-section-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
  }
  .sidebar-section-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--primary-text-color);
  }
  .sidebar-section-subtitle {
    font-size: 0.82rem;
    color: var(--secondary-text-color);
  }
  .sidebar-section-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: var(--secondary-text-color);
    cursor: pointer;
    border-radius: 4px;
    flex-shrink: 0;
    transition: background-color 120ms ease;
  }
  .sidebar-section-toggle:hover,
  .sidebar-section-toggle:focus-visible {
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 8%,
      transparent
    );
  }
  .sidebar-section-toggle ha-icon {
    --mdc-icon-size: 18px;
    display: block;
    transition: transform 140ms ease;
  }
  .sidebar-section-toggle.is-open ha-icon {
    transform: rotate(180deg);
  }
`;
