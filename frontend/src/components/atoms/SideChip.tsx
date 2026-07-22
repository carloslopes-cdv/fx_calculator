"use-client";

import React from "react";
import { Chip } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

interface SideChipProps {
  side: "BUY" | "SELL" | string;
}

export const SideChip: React.FC<SideChipProps> = ({ side }) => {
  const isBuy = side === "BUY";

  return (
    <Chip
      icon={
        isBuy ? (
          <ArrowUpwardIcon fontSize="small" />
        ) : (
          <ArrowDownwardIcon fontSize="small" />
        )
      }
      label={isBuy ? "COMPRA" : "VENDA"}
      size="small"
      sx={{
        backgroundColor: isBuy
          ? "rgba(16, 185, 129, 0.15)"
          : "rgba(239, 68, 68, 0.15)",
        color: isBuy ? "#10b981" : "#ef4444",
        borderColor: isBuy ? "#10b981" : "#ef4444",
        fontWeight: 700,
        fontSize: "0.75rem",
      }}
      variant="outlined"
    />
  );
};
