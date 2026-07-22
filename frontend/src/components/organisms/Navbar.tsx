"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ShieldIcon from "@mui/icons-material/Shield";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", path: "/", icon: <DashboardIcon fontSize="small" /> },
    {
      label: "Books",
      path: "/books",
      icon: <AccountBalanceIcon fontSize="small" />,
    },
    {
      label: "Operations",
      path: "/trades",
      icon: <SwapHorizIcon fontSize="small" />,
    },
    { label: "Hedges", path: "/hedges", icon: <ShieldIcon fontSize="small" /> },
  ];

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)" }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ justifyContent: "space-between", minHeight: 64 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="h6"
              color="primary"
              sx={{ fontWeight: 800, letterSpacing: -0.5 }}
            >
              🏛️ FX Treasury
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Button
                  key={item.path}
                  component={Link}
                  href={item.path}
                  startIcon={item.icon}
                  variant={isActive ? "contained" : "text"}
                  color={isActive ? "primary" : "inherit"}
                  size="small"
                  sx={{ fontWeight: isActive ? 700 : 500, borderRadius: 2 }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
