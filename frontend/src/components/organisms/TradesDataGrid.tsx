"use client";

import React from "react";
import { SideChip } from "../atoms/SideChip";
import { FormattedCurrency } from "../atoms/FormattedCurrency";
import { formatFxRate, formatDate } from "@/utils/formatters";
import { TradeCoverageBar } from "../molecules/TradeCoverageBar";
import { HedgeActionButton } from "../atoms/buttons/HedgeActionButton";
import { AppDataTable } from "./AppDataTable";
import { Typography, Tooltip, IconButton, Box } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

export interface TradeItem {
  id: string;
  side: "BUY" | "SELL" | string;
  currencyPair: string;
  volume: number;
  bookName?: string;
  entryRate: number;
  currentRate?: number;
  unrealizedPnL?: number;
  tradeDate: string;
  hedgedVolume?: number;
}

interface TradesDataGridProps {
  trades: TradeItem[];
  loading?: boolean;
  onOpenHedgeModal: (trade: TradeItem) => void;
  onDeleteTrade?: (id: string) => void;
}

export const TradesDataGrid: React.FC<TradesDataGridProps> = ({
  trades,
  loading = false,
  onOpenHedgeModal,
  onDeleteTrade,
}) => {
  const columns: GridColDef<TradeItem>[] = [
    {
      field: "id",
      headerName: "ID Operação", // <-- NOME DO CABEÇALHO CORRIGIDO
      flex: 0.9,
      renderCell: (params: GridRenderCellParams<TradeItem, string>) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: "monospace", color: "text.secondary" }}
        >
          #{params.value?.slice(0, 6)}
        </Typography>
      ),
    },
    {
      field: "bookName",
      headerName: "Carteira (Book)",
      flex: 1.2,
      renderCell: (params: GridRenderCellParams<TradeItem, string>) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value || "Principal"}
        </Typography>
      ),
    },
    {
      field: "side",
      headerName: "Direção",
      flex: 0.8,
      renderCell: (params: GridRenderCellParams<TradeItem, string>) => (
        <SideChip side={params.value || "BUY"} />
      ),
    },
    {
      field: "currencyPair",
      headerName: "Par",
      flex: 0.8,
      renderCell: (params: GridRenderCellParams<TradeItem, string>) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "volume",
      headerName: "Vol. (Notional)",
      flex: 1.1,
      renderCell: (params: GridRenderCellParams<TradeItem, number>) => (
        <FormattedCurrency value={params.value || 0} currency="USD" />
      ),
    },
    {
      field: "entryRate",
      headerName: "Taxa Entry",
      flex: 0.9,
      renderCell: (params: GridRenderCellParams<TradeItem, number>) => (
        <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
          R$ {formatFxRate(params.value)}
        </Typography>
      ),
    },
    {
      field: "unrealizedPnL",
      headerName: "MTM",
      flex: 1.2,
      renderCell: (params: GridRenderCellParams<TradeItem, number>) => {
        const val = params.value || 0;
        let textColor = "text.primary";
        if (val > 0) textColor = "success.main";
        if (val < 0) textColor = "error.main";

        return (
          <Box
            sx={{
              color: textColor,
              fontWeight: 700,
            }}
          >
            <FormattedCurrency value={val} currency="BRL" />
          </Box>
        );
      },
    },

    {
      field: "tradeDate",
      headerName: "Data",
      flex: 0.7,
      renderCell: (params: GridRenderCellParams<TradeItem, string>) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(params.value)}
        </Typography>
      ),
    },
    // 📊 BARRINHA DE COBERTURA (HEDGE)
    {
      field: "hedgeStatus",
      headerName: "Cobertura (Hedge)",
      flex: 1.3,
      type: "number",
      valueGetter: (value, row) => {
        const volume = row.volume || 0;
        const hedged = row.hedgedVolume || 0;
        return volume > 0 ? (hedged / volume) * 100 : 0;
      },
      renderCell: (params: GridRenderCellParams<TradeItem>) => (
        <TradeCoverageBar
          volume={params.row.volume}
          hedgedVolume={params.row.hedgedVolume || 0}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Ações",
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: (params: GridRenderCellParams<TradeItem>) => {
        const isFullyHedged =
          (params.row.hedgedVolume || 0) >= params.row.volume;

        return (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip
              title={
                isFullyHedged
                  ? "Operação 100% protegida"
                  : "Vincular operação de Hedge para travar risco"
              }
            >
              <span>
                <HedgeActionButton
                  isFullyHedged={isFullyHedged}
                  onClick={() => onOpenHedgeModal(params.row)}
                >
                  Proteger
                </HedgeActionButton>
              </span>
            </Tooltip>

            {onDeleteTrade && (
              <Tooltip title="Excluir Operação">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDeleteTrade(params.row.id)}
                  sx={{
                    border: "1px solid rgba(244, 67, 54, 0.4)",
                    backgroundColor: "rgba(244, 67, 54, 0.04)",
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <AppDataTable
      rows={trades}
      columns={columns}
      loading={loading}
      initialState={{
        pagination: { paginationModel: { pageSize: 5 } }, // Sobrescrevemos para o padrão de 5 itens no Dash
      }}
    />
  );
};
