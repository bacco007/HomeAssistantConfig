import { html } from "lit";
import "../pagination";

export default {
  title: "Atoms/Interactive/Pagination",
  component: "pagination-nav",
};

export const FirstPage = {
  render: () => html`
    <pagination-nav
      .page=${0}
      .totalPages=${5}
      .totalItems=${50}
      .label=${"records"}
    ></pagination-nav>
  `,
};

export const MiddlePage = {
  render: () => html`
    <pagination-nav
      .page=${2}
      .totalPages=${5}
      .totalItems=${50}
      .label=${"records"}
    ></pagination-nav>
  `,
};

export const LastPage = {
  render: () => html`
    <pagination-nav
      .page=${4}
      .totalPages=${5}
      .totalItems=${50}
      .label=${"records"}
    ></pagination-nav>
  `,
};

export const SinglePage = {
  render: () => html`
    <pagination-nav
      .page=${0}
      .totalPages=${1}
      .totalItems=${3}
      .label=${"events"}
    ></pagination-nav>
  `,
};
