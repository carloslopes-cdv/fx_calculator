"use client";

import React from "react";
import { Button, ButtonProps, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface PrimaryActionButtonProps extends ButtonProps {
  loading?: boolean;
}

export const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  children,
  loading = false,
  startIcon = <AddIcon />,
  disabled,
  sx,
  ...props
}) => {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={
        loading ? <CircularProgress size={18} color="inherit" /> : startIcon
      }
      disabled={disabled || loading}
      sx={{
        fontWeight: 700,
        borderRadius: 2,
        boxShadow: "none",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};
