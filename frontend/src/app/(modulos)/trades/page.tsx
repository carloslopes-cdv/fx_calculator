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
  LinearProgress,
} from "@mui/material";

import { client } from "@/utils/api";
import { formatCurrency, formatFxRate, formatDate } from "@/utils/formatters";
import type { Trade } from "@/api-client";

type MappedTrade = {
  id: string;
  bookName: string;
  side: "Compra" | "Venda"; // <-- Traduzido para o português
  currencyPair: string;
  volume: number;
  entryRate: number;
  tradeDate: string;
  unrealizedPnL: number;
  hedgedVolume: number;
};

export default function TradesPage() {
  const [trades, setTrades] = useState<MappedTrade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await client.get({ url: "/api/trades" });
        const tradesList = (res.data as Trade[]) || [];

        const mapped: MappedTrade[] = tradesList.map((t) => {
          const obj = t as Record<string, unknown>;
          const bookObj = (obj.book as Record<string, unknown>) || {};

          const volume = (obj.volume as number) || 0;
          const entryRate = (obj.entryRate as number) || 0;
          const unrealizedPnL = (obj.unrealizedPnL as number) || 0;

          const hedgesArray = (obj.hedges as Record<string, unknown>[]) || [];
          const hedgedVolume = hedgesArray.reduce(
            (sum, h) => sum + ((h.volume as number) || 0),
            0,
          );

          return {
            id: String(obj.id || ""),
            bookName: String(bookObj.name || "Carteira não informada"),
            // Mapeia o Side para português
            side: obj.side === "SELL" ? "Venda" : "Compra",
            currencyPair: String(obj.currencyPair || ""),
            volume,
            entryRate,
            tradeDate: String(obj.tradeDate || new Date().toISOString()),
            unrealizedPnL,
            hedgedVolume,
          };
        });

        setTrades(mapped);
      } catch (err) {
        console.error("Erro ao carregar trades:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchTrades();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: "primary.dark" }}
        >
          Registro de Trades (Boletas)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Acompanhamento das operações cambiais executadas e status de cobertura
        </Typography>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Carteira (Book)</TableCell>
                {/* Colunas separadas para Posição e Par */}
                <TableCell sx={{ fontWeight: 700 }}>Posição</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Par</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Volume Notional</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Taxa (Entry)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Data / Hora</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Status de Proteção
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  MtM (PnL)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Carregando operações...
                  </TableCell>
                </TableRow>
              ) : trades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Nenhum Trade registrado até o momento.
                  </TableCell>
                </TableRow>
              ) : (
                trades.map((t) => {
                  const isHedged = t.hedgedVolume >= t.volume;
                  const isPartiallyHedged =
                    t.hedgedVolume > 0 && t.hedgedVolume < t.volume;
                  const hedgePct =
                    t.volume > 0 ? (t.hedgedVolume / t.volume) * 100 : 0;

                  return (
                    <TableRow key={t.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {t.bookName}
                      </TableCell>

                      {/* Célula 1: Posição (Compra/Venda) com cores de baixa saturação */}
                      <TableCell>
                        <Chip
                          label={t.side}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            borderRadius: 1,
                            backgroundColor:
                              t.side === "Compra"
                                ? "rgba(101, 165, 108, 0.51)" // Verde claro/transparente
                                : "rgba(161, 72, 72, 0.27)", // Vermelho claro/transparente
                            color:
                              t.side === "Compra"
                                ? "success.white"
                                : "success.black",
                          }}
                        />
                      </TableCell>

                      {/* Célula 2: Par de moedas */}
                      <TableCell
                        sx={{ fontWeight: 600, color: "text.secondary" }}
                      >
                        {t.currencyPair}
                      </TableCell>

                      <TableCell sx={{ fontWeight: 700 }}>
                        {formatCurrency(
                          t.volume,
                          t.currencyPair.substring(0, 3),
                        )}
                      </TableCell>
                      <TableCell>R$ {formatFxRate(t.entryRate)}</TableCell>
                      <TableCell>{formatDate(t.tradeDate)}</TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box sx={{ width: "100%", maxWidth: 80 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(hedgePct, 100)}
                              color={
                                isHedged
                                  ? "success"
                                  : isPartiallyHedged
                                    ? "warning"
                                    : "error"
                              }
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(hedgePct)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color:
                            t.unrealizedPnL >= 0
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        {t.unrealizedPnL >= 0 ? "+" : ""}
                        {formatCurrency(t.unrealizedPnL, "BRL")}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}
