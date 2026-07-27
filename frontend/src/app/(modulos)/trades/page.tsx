"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Container, Box, Typography } from "@mui/material";

import { client } from "@/utils/api";
import type { Trade } from "@/api-client";

// Nossos Componentes Isolados
import { PrimaryActionButton } from "@/components/atoms/buttons/PrimaryActionButton";
import { RefreshButton } from "@/components/atoms/buttons/RefreshButton";

// Organismos
import {
  TradesDataGrid,
  TradeItem,
} from "@/components/organisms/TradesDataGrid";
import {
  TradeFormModal,
  CreateTradeFormData,
} from "@/components/organisms/TradeFormModal";
import {
  HedgeFormModal,
  CreateHedgeFormData,
} from "@/components/organisms/HedgeFormModal";
import { ConfirmDeleteDialog } from "@/components/molecules/ConfirmDeleteDialog";

// Taxa spot de referência do mercado para o cálculo do MtM (Mark-to-Market)
const CURRENT_MARKET_RATE = 5.2;

export default function TradesPage() {
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteTradeId, setDeleteTradeId] = useState<string | null>(null);
  const [isDeletingTrade, setIsDeletingTrade] = useState(false);

  // Modais
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [booksList, setBooksList] = useState<{ id: string; name: string }[]>(
    [],
  );

  const [isHedgeModalOpen, setIsHedgeModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeItem | null>(null);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const [resTrades, resBooks] = await Promise.all([
        client.get({ url: "/api/trades" }),
        client.get({ url: "/api/books" }),
      ]);

      const rawBooks = (resBooks.data as Record<string, unknown>[]) || [];
      setBooksList(
        rawBooks.map((b) => ({
          id: String(b.id || ""),
          name: String(b.name || ""),
        })),
      );

      // 1. Declaramos explicitamente a tradesList
      const tradesList = (resTrades.data as Trade[]) || [];

      // 2. Mapeamos calculando o MtM (PnL) com base na taxa spot de mercado
      const mapped: TradeItem[] = tradesList.map((t) => {
        const obj = t as Record<string, unknown>;
        const bookObj = (obj.book as Record<string, unknown>) || {};
        const hedgesArray = (obj.hedges as Record<string, unknown>[]) || [];

        const volume = Number(obj.volume || 0);
        const entryRate = Number(obj.entryRate || 0);
        const side = (obj.side as "BUY" | "SELL") || "BUY";

        // 📈 CÁLCULO DO MtM:
        // Se COMPRA: (Taxa Atual - Taxa Entry) * Volume
        // Se VENDA:  (Taxa Entry - Taxa Atual) * Volume
        const calculatedPnL =
          side === "BUY"
            ? (CURRENT_MARKET_RATE - entryRate) * volume
            : (entryRate - CURRENT_MARKET_RATE) * volume;

        const hedgedVolume = hedgesArray.reduce(
          (sum, h) => sum + ((h.volume as number) || 0),
          0,
        );

        return {
          id: String(obj.id || ""),
          bookName: String(bookObj.name || "Carteira não informada"),
          side,
          currencyPair: String(obj.currencyPair || "USDBRL"),
          volume,
          entryRate,
          currentRate: CURRENT_MARKET_RATE,
          tradeDate: String(obj.tradeDate || new Date().toISOString()),
          // Se o backend enviar um PnL válido usa ele, caso contrário usa o PnL calculado
          unrealizedPnL:
            obj.unrealizedPnL !== undefined && obj.unrealizedPnL !== null
              ? Number(obj.unrealizedPnL)
              : calculatedPnL,
          hedgedVolume,
        };
      });

      setTrades(mapped);
    } catch (err) {
      console.error("Erro ao carregar trades:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchTrades();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchTrades]);

  const handleCreateTrade = async (data: CreateTradeFormData) => {
    try {
      await client.post({ url: "/api/trades", body: data });
      void fetchTrades();
    } catch (err) {
      console.error("Erro ao boletar trade:", err);
    }
  };

  const handleCreateHedge = async (data: CreateHedgeFormData) => {
    try {
      await client.post({ url: "/api/hedges", body: data });
      void fetchTrades();
    } catch (err) {
      console.error("Erro ao vincular hedge:", err);
    }
  };

  const handleOpenHedgeModal = (trade: TradeItem) => {
    setSelectedTrade(trade);
    setIsHedgeModalOpen(true);
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setDeleteTradeId(id);
  };

  const handleConfirmDeleteTrade = async () => {
    if (!deleteTradeId) return;

    setIsDeletingTrade(true);
    try {
      await client.delete({ url: `/api/trades/${deleteTradeId}` });
      void fetchTrades(); // Atualiza a tela automaticamente
    } catch (error) {
      console.error("Erro ao excluir trade:", error);
    } finally {
      setIsDeletingTrade(false);
      setDeleteTradeId(null); // Esconde o modal ao finalizar
    }
  };

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
            Registro de Operações
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <RefreshButton onRefresh={fetchTrades} loading={loading} />
          <PrimaryActionButton
            onClick={() => setIsTradeModalOpen(true)}
            disabled={loading}
          >
            Novo Trade
          </PrimaryActionButton>
        </Box>
      </Box>

      <TradesDataGrid
        trades={trades}
        loading={loading}
        onOpenHedgeModal={handleOpenHedgeModal}
        onDeleteTrade={handleOpenDeleteConfirm}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTradeId)}
        title="Excluir Carteira"
        description="Deseja realmente excluir esta operação de câmbio? A exclusão impactará os relatórios de exposição da tesouraria."
        loading={isDeletingTrade}
        onClose={() => setDeleteTradeId(null)}
        onConfirm={handleConfirmDeleteTrade}
      />

      <TradeFormModal
        open={isTradeModalOpen}
        books={booksList}
        defaultBookId={booksList[0]?.id || ""}
        onClose={() => setIsTradeModalOpen(false)}
        onSubmit={handleCreateTrade}
      />

      <HedgeFormModal
        open={isHedgeModalOpen}
        trade={selectedTrade}
        onClose={() => setIsHedgeModalOpen(false)}
        onSubmit={handleCreateHedge}
      />
    </Container>
  );
}
