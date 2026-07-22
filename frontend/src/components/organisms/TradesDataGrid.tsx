"use client";

import React from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Paper, Typography, Button, Tooltip } from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import { SideChip } from "../atoms/SideChip";
import { FormattedCurrency } from "../atoms/FormattedCurrency";
import { formatFxRate, formatDate } from "@/utils/formatters";

export interface TradeItem {
  id: string;
  side: "BUY" | "SELL" | string;
  currencyPair: string;
  volume: number;
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
}

export const TradesDataGrid: React.FC<TradesDataGridProps> = ({
  trades,
  loading = false,
  onOpenHedgeModal,
}) => {
  const columns: GridColDef<TradeItem>[] = [
    {
      field: "id",
      headerName: "ID Operação",
      width: 130,
      renderCell: (params: GridRenderCellParams<TradeItem, string>) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: "monospace", color: "text.secondary" }}
        >
          #{params.value?.slice(0, 8)}
        </Typography>
      ),
    },
    {
      field: "side",
      headerName: "Direção",
      width: 120,
      renderCell: (params: GridRenderCellParams<TradeItem, string>) => (
        <SideChip side={params.value || "BUY"} />
      ),
    },
    {
      field: "currencyPair",
      headerName: "Par de Moeda",
      width: 130,
      renderCell: (params: GridRenderCellParams<TradeItem, string>) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "volume",
      headerName: "Volume (Moeda Base)",
      width: 180,
      renderCell: (params: GridRenderCellParams<TradeItem, number>) => (
        <FormattedCurrency value={params.value || 0} currency="USD" />
      ),
    },
    {
      field: "entryRate",
      headerName: "Taxa Entrada",
      width: 140,
      renderCell: (params: GridRenderCellParams<TradeItem, number>) => (
        <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
          R$ {formatFxRate(params.value)}
        </Typography>
      ),
    },
    {
      field: "unrealizedPnL",
      headerName: "Marcação a Mercado (MtM)",
      width: 200,
      renderCell: (params: GridRenderCellParams<TradeItem, number>) => (
        <FormattedCurrency
          value={params.value || 0}
          currency="BRL"
          highlightPnL
        />
      ),
    },
    {
      field: "tradeDate",
      headerName: "Data Operação",
      width: 130,
      renderCell: (params: GridRenderCellParams<TradeItem, string>) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Ações / Proteção",
      width: 160,
      sortable: false,
      renderCell: (params: GridRenderCellParams<TradeItem>) => (
        <Tooltip title="Vincular operação de Hedge para travar risco">
          <Button
            variant="outlined"
            size="small"
            color="primary"
            startIcon={<ShieldIcon />}
            onClick={() => onOpenHedgeModal(params.row)}
            sx={{ textTransform: "none", fontSize: "0.75rem" }}
          >
            Hedge
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Paper variant="outlined" sx={{ width: "100%", overflow: "hidden" }}>
      <Box sx={{ p: 2, borderBottom: "1px solid rgba(255, 255, 255, 0.12)" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Operações Registradas (Trades)
        </Typography>
      </Box>
      <DataGrid
        rows={trades}
        columns={columns}
        loading={loading}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          border: "none",
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
        }}
      />
    </Paper>
  );
};
