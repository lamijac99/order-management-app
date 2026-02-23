import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import MenuButton from "./MenuButton";
import MenuContent from "./MenuContent";
import CardAlert from "./CardAlert";

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
  session: Session;
  isAdmin: boolean;
}

export default function SideMenuMobile({
  open,
  toggleDrawer,
  session,
  isAdmin,
}: SideMenuMobileProps) {
  const router = useRouter();
  const email = session.user.email ?? "—";

  const logout = async () => {
    await fetch("/auth/signout", { method: "POST" });
    router.refresh();
    window.location.href = "/auth/login";
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: "none",
          backgroundColor: "background.paper",
          borderLeft: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <Stack sx={{ maxWidth: "70dvw", height: "100%" }}>
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack direction="row" sx={{ gap: 1, alignItems: "center", flexGrow: 1, p: 1 }}>
            <Avatar sx={{ width: 24, height: 24 }}>
              {(email[0] ?? "U").toUpperCase()}
            </Avatar>
            <Typography component="p" variant="h6" noWrap>
              {email}
            </Typography>
          </Stack>

          
        </Stack>

        <Divider />

        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent isAdmin={isAdmin} onNavigate={() => toggleDrawer(false)()} />
          <Divider />
        </Stack>

       

        <Stack sx={{ p: 2 }}>
          <Button variant="outlined" fullWidth startIcon={<LogoutRoundedIcon />} onClick={logout}>
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}