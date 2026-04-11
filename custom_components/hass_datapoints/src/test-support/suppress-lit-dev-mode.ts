const LIT_DEV_MODE_SNIPPETS = [
  "Lit is in dev mode. Not recommended for production!",
  "https://lit.dev/msg/dev-mode",
];

function matchesLitDevModeMessage(args: unknown[]): boolean {
  return args.some((arg) => {
    const value = typeof arg === "string" ? arg : String(arg ?? "");
    return LIT_DEV_MODE_SNIPPETS.some((snippet) => value.includes(snippet));
  });
}

function wrapConsoleMethod(methodName: "warn" | "error"): void {
  const consoleWithPatchedFlag = console as Console & {
    __hassDatapointsPatchedLitDevModeWarn?: boolean;
    __hassDatapointsPatchedLitDevModeError?: boolean;
  };
  const flagName =
    methodName === "warn"
      ? "__hassDatapointsPatchedLitDevModeWarn"
      : "__hassDatapointsPatchedLitDevModeError";

  if (consoleWithPatchedFlag[flagName]) {
    return;
  }

  // eslint-disable-next-line no-console
  const originalMethod = console[methodName].bind(console);
  // eslint-disable-next-line no-console
  console[methodName] = ((...args: unknown[]) => {
    if (matchesLitDevModeMessage(args)) {
      return;
    }
    originalMethod(...args);
  }) as Console["warn"];

  consoleWithPatchedFlag[flagName] = true;
}

wrapConsoleMethod("warn");
wrapConsoleMethod("error");
