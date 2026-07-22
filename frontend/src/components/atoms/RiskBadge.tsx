"use client";

import React from "react";
import { Chip, ChipProps } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";

export type RiskHealthStatus = "HEALTHY" | "WARNING" | "CRITICAL";

interface RiskBadgeProps extends Omit<ChipProps, "color"> {
  status: RiskHealthStatus | string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ status, ...props }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case "HEALTHY":
        return {
          label: "Saudável (>= 80%)",
          color: "success" as const,
          icon: <CheckCircleIcon fontSize="small" />,
        };
      case "WARNING":
        return {
          label: "Alerta (50% - 79%)",
          color: "warning" as const,
          icon: <WarningIcon fontSize="small" />,
        };
      case "CRITICAL":
        return {
          label: "Crítico (<50%)",
          color: "error" as const,
          icon: <ErrorIcon fontSize="small" />,
        };
      default:
        return {
          label: status,
          color: "default" as const,
          icon: undefined,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size="small"
      variant="outlined"
      sx={{ fontWeigth: 600, borderRadius: "6px" }}
      {...props}
    />
  );
};
