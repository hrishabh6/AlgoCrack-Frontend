/** Problem-solving workspace route (single problem editor), not lists or index. */
export function isProblemSolvingRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/problems/") &&
    !pathname.startsWith("/problems/lists") &&
    pathname.split("/").length > 2
  );
}

/** Hide global chrome only on the problem workspace while Focus Mode is active. */
export function shouldHideAppChrome(pathname: string, focusModeActive: boolean): boolean {
  return focusModeActive && isProblemSolvingRoute(pathname);
}
