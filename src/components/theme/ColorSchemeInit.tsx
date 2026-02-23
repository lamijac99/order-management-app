"use client";

import * as React from "react";
import { getInitColorSchemeScript } from "@mui/material/styles";

export default function ColorSchemeInit() {
  return (
    <>
      {getInitColorSchemeScript({ attribute: "data-mui-color-scheme" })}
    </>
  );
}