"use client";

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
          ? "rgba(16, 185, 129, 0.15)" // Fundo verde suave
          : "rgba(239, 68, 68, 0.15)", // Fundo vermelho suave
        color: isBuy ? "#10b981" : "#ef4444",
        fontWeight: 700,
        borderRadius: 1, // Bordas um pouco mais quadradas como na página de trades
        border: "none",
        "& .MuiChip-icon": {
          color: "inherit", // Faz o ícone herdar a cor do texto
        },
      }}
    />
  );
};
