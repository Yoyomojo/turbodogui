import { router } from "../core/router";

export function onRouteChange(initFunction: () => void): () => void {
  return router.subscribe(initFunction);
}

