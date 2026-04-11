import { createContext } from "@lit/context";
import type { HassLike } from "@/lib/types";

/**
 * Context key for providing the Home Assistant `hass` object
 * down the component tree without prop drilling.
 *
 * Usage in providers (cards, panels):
 *   import { provide } from "@lit/context";
 *   import { hassContext } from "../contexts/hass-context";
 *
 *   @provide({ context: hassContext })
 *   hass = null;
 *
 * Usage in consumers (atoms that need hass):
 *   import { consume } from "@lit/context";
 *   import { hassContext } from "../contexts/hass-context";
 *
 *   @consume({ context: hassContext, subscribe: true })
 *   hass = null;
 */
export const hassContext = createContext<Nullable<HassLike>>("hass");
