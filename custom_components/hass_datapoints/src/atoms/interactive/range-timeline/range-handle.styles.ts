import { css } from "lit";

export const styles = css`
  :host {
    position: absolute;
    top: 26px;
    left: 0;
    transform: translate(-50%, -50%);
    display: block;
    width: 20px;
    height: 20px;
  }

  .handle {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid var(--card-background-color, #fff);
    background: color-mix(
      in srgb,
      var(--primary-text-color, #111) 84%,
      transparent
    );
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    padding: 0;
    cursor: ew-resize;
    touch-action: none;
  }

  .handle:focus-visible {
    outline: 3px solid
      color-mix(in srgb, var(--primary-color, #03a9f4) 24%, transparent);
    outline-offset: 2px;
  }

  @keyframes dp-live-breathe {
    0%,
    100% {
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.18),
        0 0 0 0 rgba(239, 83, 80, 0);
    }
    50% {
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.18),
        0 0 0 5px rgba(239, 83, 80, 0.2);
    }
  }

  .handle.is-live {
    background: #ef5350;
    animation: dp-live-breathe 3s ease-in-out infinite;
  }
`;
