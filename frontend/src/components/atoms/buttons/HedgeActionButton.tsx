"use client";

import React from "react";
import { Button, ButtonProps, CircularProgress } from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";

interface HedgeActionButtonProps extends ButtonProps {
  loading?: boolean;
  isFullyHedged?: boolean;
}

export const HedgeActionButton: React.FC<HedgeActionButtonProps> = ({
  children,
  loading = false,
  isFullyHedged = false,
  disabled,
  sx,
  ...props
}) => {
  return (
    <Button
      variant="outlined"
      size="small"
      color={isFullyHedged ? "success" : "primary"}
      startIcon={
        loading ? (
          <CircularProgress size={14} color="inherit" />
        ) : (
          <ShieldIcon fontSize="small" />
        )
      }
      disabled={disabled || loading || isFullyHedged}
      sx={{
        textTransform: "none",
        fontSize: "0.75rem",
        fontWeight: 600,
        borderRadius: 1.5,
        ...sx,
      }}
      {...props}
    >
      {isFullyHedged ? "OK" : children || "Proteger"}
    </Button>
  );
};
