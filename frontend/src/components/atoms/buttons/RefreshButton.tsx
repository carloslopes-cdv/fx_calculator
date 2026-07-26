"use client";

import React from "react";
import { Button, ButtonProps, CircularProgress } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

interface RefreshButtonProps extends Omit<ButtonProps, "onClick"> {
  onRefresh: () => void;
  loading?: boolean;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  loading = false,
  sx,
  ...props
}) => {
  return (
    <Button
      variant="outlined"
      color="inherit"
      startIcon={
        loading ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <RefreshIcon fontSize="small" />
        )
      }
      onClick={onRefresh}
      disabled={loading}
      sx={{
        fontWeight: 600,
        borderRadius: 2,
        borderColor: "rgba(255, 255, 255, 0.2)",
        "&:hover": {
          borderColor: "rgba(255, 255, 255, 0.4)",
        },
        ...sx,
      }}
      {...props}
    >
      Atualizar
    </Button>
  );
};
