"use client";

import * as React from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import CssBaseline from "@mui/material/CssBaseline";
import { CssVarsProvider, extendTheme, type ThemeOptions } from "@mui/material/styles";

import { inputsCustomizations } from "@/shared-theme/customizations/inputs";
import { dataDisplayCustomizations } from "@/shared-theme/customizations/dataDisplay";
import { feedbackCustomizations } from "@/shared-theme/customizations/feedback";
import { navigationCustomizations } from "@/shared-theme/customizations/navigation";
import { surfacesCustomizations } from "@/shared-theme/customizations/surfaces";
import { dataGridCustomizations } from "@/shared-theme/customizations/dataGrid";
import { colorSchemes, typography, shadows, shape } from "@/shared-theme/themePrimitives";

const extraComponents: ThemeOptions["components"] = {};

const theme = extendTheme({
  cssVarPrefix: "template",
  colorSchemeSelector: "data-mui-color-scheme",

  colorSchemes,
  typography: {
    ...typography,
    fontFamily: "var(--font-geist-sans), Inter, sans-serif",
  },
  shadows,
  shape,

  components: {
    ...inputsCustomizations,
    ...dataDisplayCustomizations,
    ...feedbackCustomizations,
    ...navigationCustomizations,
    ...surfacesCustomizations,
    ...dataGridCustomizations,
    ...extraComponents,
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache({ key: "mui" });
    cache.compat = true;

    let inserted: string[] = [];
    const prevInsert = cache.insert;

    cache.insert = (...args: Parameters<typeof prevInsert>) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) inserted.push(serialized.name);
      return prevInsert(...args);
    };

    const flush = () => {
      const prev = inserted;
      inserted = [];
      return prev;
    };

    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;

    let styles = "";
    for (const name of names) styles += cache.inserted[name];

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <CssVarsProvider theme={theme} defaultMode="system" disableTransitionOnChange>
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </CacheProvider>
  );
}