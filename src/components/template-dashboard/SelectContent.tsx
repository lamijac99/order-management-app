"use client";

import * as React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiAvatar from "@mui/material/Avatar";
import { styled } from "@mui/material/styles";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";

const Avatar = styled(MuiAvatar)(({ theme }) => ({
  width: 28,
  height: 28,
  backgroundColor: (theme.vars || theme).palette.background.paper,
  color: (theme.vars || theme).palette.text.secondary,
  border: `1px solid ${(theme.vars || theme).palette.divider}`,
}));

export default function SelectContent() {
  return (
    <Box
      component={Link}
      href="/orders"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        px: 1,
        py: 0.75,
        borderRadius: 2,
        textDecoration: "none",
        cursor: "pointer",
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
    >
      <Avatar>
        <DashboardRoundedIcon sx={{ fontSize: "1rem" }} />
      </Avatar>

      <Typography
        sx={{
          fontWeight: 700,
          color: "text.primary",
          fontSize: 14,
        }}
      >
        OrdersApp
      </Typography>
    </Box>
  );
}