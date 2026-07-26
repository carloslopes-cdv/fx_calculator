"use client";

import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";

interface TradeCoverageBarProps {
  volume: number;
  hedgedVolume: number;
}

export const TradeCoverageBar: React.FC<TradeCoverageBarProps> = ({
  volume,
  hedgedVolume,
}) => {
  const pct = volume > 0 ? (hedgedVolume / volume) * 100 : 0;
  const clampedPct = Math.min(pct, 100);

  // Semáforo de cor da barra
  let color: "error" | "warning" | "success" = "error";
  if (pct >= 100) color = "success";
  else if (pct >= 50) color = "warning";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        width: "100%",
        maxWidth: 120,
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <LinearProgress
          variant="determinate"
          value={clampedPct}
          color={color}
          sx={{ borderRadius: 1, height: 6 }}
        />
      </Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, minWidth: 35, color: `${color}.main` }}
      >
        {Math.round(pct)}%
      </Typography>
    </Box>
  );
};
