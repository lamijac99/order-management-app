"use client";

import * as React from "react";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import SelectContent from "./SelectContent";
import MenuContent from "./MenuContent";
import OptionsMenu from "./OptionsMenu";

import ColorModeIconDropdown from "@/components/theme/ColorModeIconDropdown";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
    backgroundColor: (theme.vars || theme).palette.background.paper,
    backgroundImage: "none",
    borderRight: "1px solid",
    borderColor: (theme.vars || theme).palette.divider,
  },
}));

export default function SideMenu({
  session,
  isAdmin,
}: {
  session: Session;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const email = session.user.email ?? "—";

  const logout = async () => {
    await fetch("/auth/signout", { method: "POST" });
    router.refresh();
    window.location.href = "/auth/login";
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          px: 1.5,
          py: 1.25,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SelectContent />
        </Box>

        <ColorModeIconDropdown
          size="small"
          sx={(theme) => ({
            borderRadius: "8px",
            border: "1px solid",
            borderColor: (theme.vars || theme).palette.divider,
          })}
        />
      </Box>

      <Divider />

      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent isAdmin={isAdmin} />
      </Box>

      <Stack
        direction="row"
        sx={(theme) => ({
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: (theme.vars || theme).palette.divider,
        })}
      >
        <Avatar sx={{ width: 36, height: 36 }}>
          {(email[0] ?? "U").toUpperCase()}
        </Avatar>

        <Box sx={{ mr: "auto", minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: "16px" }} noWrap>
            {isAdmin ? "Admin" : "User"}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
            {email}
          </Typography>
        </Box>

        <OptionsMenu onLogout={logout} />
      </Stack>
    </Drawer>
  );
}