"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  AlertTitle,
  Skeleton,
  Button,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { RiskBadge, RiskHealthStatus } from "../atoms/RiskBadge";
import { CoverageProgressBar } from "../molecules/CoverageProgressBar";
import { formatCurrency } from "@/utils/formatters";

interface RiskReportCardProps {
  health: RiskHealthStatus | string;
  coverageRatio: number;
  suggestedAction?: {
    action: "BUY" | "SELL" | string;
    targetCurrency: string;
    amount: number;
  } | null;
  loading?: boolean;
  onExecuteSuggestedAction?: (amount: number) => void;
}

export const RiskReportCard: React.FC<RiskReportCardProps> = ({
  health,
  coverageRatio,
  suggestedAction,
  loading = false,
  onExecuteSuggestedAction,
}) => {
  if (loading) {
    return (
      <Card variant="outlined" sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={140} />
      </Card>
    );
  }

  const isHealthy = health === "HEALTHY";

  return (
    <Card variant="outlined" sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* Cabeçalho do Card */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Status de Risco da Carteira
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Motor de Risco em Tempo Real (Target: 80% Cobertura)
            </Typography>
          </Box>
          <RiskBadge status={health} />
        </Box>

        {/* Barra de Progresso do Hedge Ratio */}
        <CoverageProgressBar percentage={coverageRatio} />

        {/* Alerta de Ação Sugerida pelo Motor de Risco */}
        {!isHealthy && suggestedAction && suggestedAction.amount > 0 && (
          <Alert
            severity={health === "CRITICAL" ? "error" : "warning"}
            variant="filled"
            action={
              onExecuteSuggestedAction && (
                <Button
                  color="inherit"
                  size="small"
                  variant="outlined"
                  startIcon={<ShoppingCartIcon />}
                  onClick={() =>
                    onExecuteSuggestedAction(suggestedAction.amount)
                  }
                  sx={{
                    fontWeight: 700,
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  Comprar
                </Button>
              )
            }
            sx={{ borderRadius: 2 }}
          >
            <AlertTitle sx={{ fontWeight: 700 }}>
              Ação Sugerida de Rebalanceamento
            </AlertTitle>
            A carteira necessita de uma operação de{" "}
            <strong>
              {suggestedAction.action === "BUY" ? "COMPRA" : "VENDA"}
            </strong>{" "}
            de{" "}
            <strong>
              {formatCurrency(
                suggestedAction.amount,
                suggestedAction.targetCurrency || "USD",
              )}
            </strong>{" "}
            para atingir a cobertura mínima de segurança.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
