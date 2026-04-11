/**
 * Vitest setup file — runs before all tests.
 *
 * Registers HA stub custom elements so that components
 * can be tested without a real Home Assistant environment.
 */
import "./suppress-lit-dev-mode";
import "./ha-stubs";
