import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    height: 100%;
  }

  ha-card {
    padding: 0;
    overflow: hidden;
    height: 100%;
  }

  .card-shell {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .card-body {
    pointer-events: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    flex: 0 0 auto;
    height: calc(
      (
          var(--hr-body-rows, var(--row-size, 1)) *
            (var(--row-height, 1px) + var(--row-gap, 0px))
        ) - var(--row-gap, 0px) - var(--hr-footer-height, 0px)
    );
    min-height: 0;
    position: relative;
    overflow: hidden;
    z-index: 1;
  }

  sensor-chart {
    position: absolute;
    width: 100%;
    z-index: 0;
    height: calc(
      (
          var(--hr-body-rows, var(--row-size, 1)) *
            (var(--row-height, 1px) + var(--row-gap, 0px))
        ) - var(--row-gap, 0px) - var(--hr-footer-height, 0px)
    );
    min-height: 0;
    overflow: hidden;
  }

  sensor-records {
    flex: 1 1 0;
    min-height: 0;
    position: relative;
  }
`;
