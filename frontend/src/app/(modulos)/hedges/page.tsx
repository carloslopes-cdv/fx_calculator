"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";

import { client } from "@/utils/api";
import { formatCurrency, formatFxRate, formatDate } from "@/utils/formatters";
import type { Hedge } from "@/api-client";

type MappedHedge = {
  id: string;
  tradeDesc: string; // <-- Trocamos tradeId por uma descrição palpável
  volume: number;
  entryRate: number;
  hedgeDate: string;
};

export default function HedgesPage() {
  const [hedges, setHedges] = useState<MappedHedge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHedges = async () => {
      try {
        const res = await client.get({ url: "/api/hedges" });
        const hedgesList = (res.data as Hedge[]) || [];

        const mapped: MappedHedge[] = hedgesList.map((h) => {
          const obj = h as Record<string, unknown>;
          const tradeObj = (obj.trade as Record<string, unknown>) || {};

          // Montando uma descrição amigável para o Trade Pai
          const side =
            tradeObj.side === "BUY"
              ? "Compra"
              : tradeObj.side === "SELL"
                ? "Venda"
                : "";
          const pair = tradeObj.currencyPair || "";
          const tradeDesc =
            side && pair
              ? `Boleta de ${side} ${pair}`
              : `Operação Desconhecida`;

          return {
            id: String(obj.id || ""),
            tradeDesc,
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
    };

    void fetchHedges();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: "primary.light" }}
        >
          Proteções Cambiais (Hedges)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitoramento de coberturas vinculadas para mitigação de risco cambial
        </Typography>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Data do Hedge</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Atrelado a</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Volume Coberto</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Taxa da Trava (NDF)
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Carregando proteções...
                  </TableCell>
                </TableRow>
              ) : hedges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhum Hedge registrado até o momento.
                  </TableCell>
                </TableRow>
              ) : (
                hedges.map((h) => (
                  <TableRow key={h.id} hover>
                    <TableCell>{formatDate(h.hedgeDate)}</TableCell>
                    <TableCell
                      sx={{ fontWeight: 500, color: "text.secondary" }}
                    >
                      {h.tradeDesc}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {formatCurrency(h.volume, "USD")}
                    </TableCell>
                    <TableCell>R$ {formatFxRate(h.entryRate)}</TableCell>
                    <TableCell>
                      <Chip
                        icon={<ShieldIcon />}
                        label="PROTEGIDO"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}
