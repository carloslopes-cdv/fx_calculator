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

interface HedgeItem {
  id: string;
  tradeId: string;
  volume: number;
  entryRate: number;
  hedgeDate: string;
}

// Função auxiliar segura para truncar IDs de forma garantida
const safeSlice = (val: unknown, length = 8): string => {
  if (typeof val === "string" && val.length > 0) {
    return val.slice(0, length);
  }
  if (typeof val === "number") {
    return String(val).slice(0, length);
  }
  return "N/A";
};

export default function HedgesPage() {
  const [hedges, setHedges] = useState<HedgeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHedges = async () => {
      try {
        const res = await client.get({ url: "/api/hedges" });
        if (res.data && Array.isArray(res.data)) {
          type HedgeResponse = {
            id?: string | number;
            tradeId?: string | number;
            trade?: { id?: string | number };
            volume?: number | string;
            entryRate?: number | string;
            hedgeDate?: string;
          };

          const mapped: HedgeItem[] = res.data.map((h: HedgeResponse) => ({
            id: String(h?.id || ""),
            // Aceita h.tradeId ou h.trade?.id (se vier objeto aninhado do NestJS)
            tradeId: String(h?.tradeId || h?.trade?.id || ""),
            volume: Number(h?.volume || 0),
            entryRate: Number(h?.entryRate || 0),
            hedgeDate: h?.hedgeDate || new Date().toISOString(),
          }));
          setHedges(mapped);
        }
      } catch (err) {
        console.error("Erro ao carregar Hedges:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHedges();
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
                <TableCell sx={{ fontWeight: 700 }}>ID do Hedge</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ID do Trade Pai</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Volume Coberto</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Taxa da Trava</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Data do Hedge</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Carregando proteções...
                  </TableCell>
                </TableRow>
              ) : hedges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhum Hedge registrado até o momento.
                  </TableCell>
                </TableRow>
              ) : (
                hedges.map((h, index) => (
                  <TableRow key={h.id || index} hover>
                    <TableCell sx={{ fontFamily: "monospace" }}>
                      #{safeSlice(h.id)}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>
                      #{safeSlice(h.tradeId)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {formatCurrency(h.volume, "USD")}
                    </TableCell>
                    <TableCell>R$ {formatFxRate(h.entryRate)}</TableCell>
                    <TableCell>{formatDate(h.hedgeDate)}</TableCell>
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
