"use client";

import * as React from "react";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import Box from "@mui/material/Box";
import IconButton, { type IconButtonProps } from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { useColorScheme } from "@mui/material/styles";

type Props = IconButtonProps & {
  showLabels?: boolean; 
};

export default function ColorModeIconDropdown({ showLabels = true, ...props }: Props) {
  const { mode, systemMode, setMode } = useColorScheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const resolvedMode = (mode === "system" ? systemMode : mode) ?? "light";
  const icon = resolvedMode === "dark" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleMode = (target: "system" | "light" | "dark") => {
    setMode(target);
    handleClose();
  };

  if (!mode) {
    return (
      <Box
        data-screenshot="toggle-mode"
        sx={(theme) => ({
          display: "inline-flex",
          width: 36,
          height: 36,
          borderRadius: "8px",
          border: "1px solid",
          borderColor: (theme.vars || theme).palette.divider,
        })}
      />
    );
  }

  return (
    <>
      <Tooltip title="Theme">
        <IconButton
          data-screenshot="toggle-mode"
          onClick={handleClick}
          disableRipple
          size="small"
          aria-controls={open ? "color-scheme-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          sx={{
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "divider",
          }}
          {...props}
        >
          {icon}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="color-scheme-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            variant: "outlined",
            elevation: 0,
            sx: { my: 0.5, borderRadius: "10px" },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {showLabels && (
          <MenuItem selected={mode === "system"} onClick={() => handleMode("system")}>
            System
          </MenuItem>
        )}
        <MenuItem selected={mode === "light"} onClick={() => handleMode("light")}>
          Light
        </MenuItem>
        <MenuItem selected={mode === "dark"} onClick={() => handleMode("dark")}>
          Dark
        </MenuItem>
      </Menu>
    </>
  );
}