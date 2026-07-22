"use client";

import React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  linearProgressClasses,
} from "@mui/material";
import { formatPercent } from "@/utils/formatters";

interface CoverageProgressBarProps {
  percentage: number;
  target?: number;
}

export const CoverageProgressBar: React.FC<CoverageProgressBarProps> = ({
  percentage,
  target = 80,
}) => {
  const clampedValue = Math.min(Math.max(percentage, 0), 100);

  const getProgressColor = () => {
    if (percentage >= target) return "#10b981";
    if (percentage >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const progressColor = getProgressColor();

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.5,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          Índice de Cobertura (Hedge Ratio)
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: progressColor, fontWeight: 700 }}
        >
          {formatPercent(percentage)} (Meta: {target}%)
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={clampedValue}
        sx={{
          height: 10,
          borderRadius: 5,
          [`&.${linearProgressClasses.colorPrimary}`]: {
            backgroundColor: "rgba(255, 255, 255, 0.08)",
          },
          [`& .${linearProgressClasses.bar}`]: {
            backgroundColor: progressColor,
            borderRadius: 5,
          },
        }}
      />
    </Box>
  );
};
