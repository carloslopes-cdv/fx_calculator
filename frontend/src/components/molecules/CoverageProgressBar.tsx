"use client";

import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";

interface CoverageProgressBarProps {
  percentage: number;
}

export const CoverageProgressBar: React.FC<CoverageProgressBarProps> = ({
  percentage = 0,
}) => {
  // Lógica para cor dinâmica baseada na saúde da cobertura
  const getColor = (val: number) => {
    if (val >= 80) return "success.main";
    if (val >= 50) return "warning.main";
    return "error.main";
  };

  const safePercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Cabeçalho da Barra com o Valor em Grande Destaque */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: "text.secondary" }}
        >
          Índice de Cobertura
        </Typography>

        {/* 🚀 VALOR PERCENTUAL GRANDE E DESTACADO */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: getColor(safePercentage),
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {safePercentage.toFixed(1)}%
        </Typography>
      </Box>

      {/* Barra visual de progresso */}
      <LinearProgress
        variant="determinate"
        value={safePercentage}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          "& .MuiLinearProgress-bar": {
            backgroundColor: getColor(safePercentage),
            borderRadius: 5,
          },
        }}
      />
    </Box>
  );
};
