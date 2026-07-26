"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Container, Box, Typography } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
// import ShieldIcon from "@mui/icons-material/Shield";

import { client } from "@/utils/api";
import { formatFxRate, formatDate } from "@/utils/formatters";
import type { Hedge } from "@/api-client";
import { RefreshButton } from "@/components/atoms/buttons/RefreshButton";
import { FormattedCurrency } from "@/components/atoms/FormattedCurrency";
import { AppDataTable } from "@/components/organisms/AppDataTable";
import { SideChip } from "@/components/atoms/SideChip";

type MappedHedge = {
  id: string;
  tradeId: string;
  tradeSide: string;
  tradePair: string;
  volume: number;
  entryRate: number;
  hedgeDate: string;
};

export default function HedgesPage() {
  const [hedges, setHedges] = useState<MappedHedge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHedges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get({ url: "/api/hedges" });
      const hedgesList = (res.data as Hedge[]) || [];

      const mapped: MappedHedge[] = hedgesList.map((h) => {
        const obj = h as Record<string, unknown>;
        const tradeObj = (obj.trade as Record<string, unknown>) || {};

        return {
          id: String(obj.id || ""),
          tradeId: String(tradeObj.id || ""),
          tradeSide: String(tradeObj.side || ""),
          tradePair: String(tradeObj.currencyPair || ""),
          volume: (obj.volume as number) || 0,
          entryRate: (obj.entryRate as number) || 0,
          hedgeDate: String(obj.hedgeDate || new Date().toISOString()),
        };
      });

      setHedges(mapped);
    } catch (err) {
      console.error("Erro ao carregar Hedges:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchHedges();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchHedges]);

  // COLUNAS SEPARADAS E ALINHADAS COM O PADRÃO DO SISTEMA
  const columns: GridColDef<MappedHedge>[] = [
    {
      field: "tradeId",
      headerName: "Trade Atrelado",
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<MappedHedge, string>) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: "monospace", color: "text.secondary" }}
        >
          #{params.value ? params.value.slice(0, 6) : "------"}
        </Typography>
      ),
    },
    {
      field: "tradeSide",
      headerName: "Direção",
      flex: 1,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<MappedHedge, string>) => (
        <SideChip side={params.value || "BUY"} />
      ),
    },
    {
      field: "tradePair",
      headerName: "Par",
      flex: 1,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<MappedHedge, string>) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {params.value || "---"}
        </Typography>
      ),
    },
    {
      field: "volume",
      headerName: "Vol. Coberto",
      flex: 1.2,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams<MappedHedge, number>) => (
        <FormattedCurrency value={params.value || 0} currency="USD" />
      ),
    },
    {
      field: "entryRate",
      headerName: "Taxa NDF (Entry)",
      flex: 1.2,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams<MappedHedge, number>) => (
        <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
          R$ {formatFxRate(params.value)}
        </Typography>
      ),
    },
    {
      field: "hedgeDate",
      headerName: "Data",
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<MappedHedge, string>) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(params.value)}
        </Typography>
      ),
    },
    // {
    //   field: "status",
    //   headerName: "Status",
    //   flex: 1,
    //   minWidth: 120,
    //   sortable: false,
    //   renderCell: () => (
    //     <Chip
    //       icon={<ShieldIcon />}
    //       label="Protegido"
    //       color="success"
    //       size="small"
    //       variant="outlined"
    //     />
    //   ),
    // },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "primary.light" }}
          >
            Hedges
          </Typography>
        </Box>
        <RefreshButton onRefresh={fetchHedges} loading={loading} />
      </Box>

      <AppDataTable rows={hedges} columns={columns} loading={loading} />
    </Container>
  );
}
