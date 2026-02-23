"use client";

import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import ColorModeIconDropdown from "@/components/theme/ColorModeIconDropdown";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  position: "relative",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage: "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage: "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

function BrandRow() {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Avatar
        sx={(theme) => ({
          width: 40,
          height: 40,
          borderRadius: theme.shape.borderRadius,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          color: "text.primary",
        })}
      >
        <DashboardRoundedIcon fontSize="small" />
      </Avatar>

      <Typography variant="h6" fontWeight={700} noWrap>
        OrdersApp
      </Typography>
    </Stack>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
    router.push("/orders");
  };

  return (
    <>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="center">
        <Box sx={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 10 }}>
          <ColorModeIconDropdown />
        </Box>

        <Card variant="outlined">
          <BrandRow />

          <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
            Sign in
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Box
            component="form"
            onSubmit={onSubmit}
            noValidate
            sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
          >
            <TextField
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              autoFocus
              required
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              id="password"
              name="password"
              placeholder="••••••"
              type="password"
              autoComplete="current-password"
              required
              fullWidth
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" fullWidth variant="contained">
              Sign in
            </Button>

            <Divider>or</Divider>

            <Typography sx={{ textAlign: "center" }}>
              Don&apos;t have an account?{" "}
              <Link
                component="button"
                type="button"
                onClick={() => router.push("/auth/register")}
                variant="body2"
                sx={{ alignSelf: "center" }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </>
  );
}