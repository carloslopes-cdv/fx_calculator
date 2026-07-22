"use client";

import React from "react";
import { Card, CardContent, Typography, Box, Skeleton } from "@mui/material";

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  loading = false,
}) => {
  return (
    <Card
      variant="outlined"
      sx={{ height: "100%", borderColor: "rgba(255, 255, 255, 0.12)" }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {title}
          </Typography>
          {icon && (
            <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
          )}
        </Box>

        {loading ? (
          <Skeleton variant="text" width="60%" height={40} />
        ) : (
          <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        )}

        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: "block" }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
