import type { HassLike } from "@/lib/types";
import { createHistoryPageAppStateContext } from "./app-state-context";
import { createHistoryPageFetchContext } from "./fetch-context";
import { createHistoryPageNavigationContext } from "./navigation-context";
import { createHistoryPageOrchestrationContext } from "./orchestration-context";
import { createHistoryPagePersistenceContext } from "./persistence-context";
import type { HistoryPageContext } from "./types";

export function createHistoryPageContext(
  hass: Nullable<HassLike> = null
): HistoryPageContext {
  const context: HistoryPageContext = {
    hass,
    app: createHistoryPageAppStateContext(),
    fetch: createHistoryPageFetchContext(() => context.hass),
    persistence: createHistoryPagePersistenceContext(() => context.hass),
    orchestration: createHistoryPageOrchestrationContext(),
    navigation: createHistoryPageNavigationContext(),
  };

  return context;
}
