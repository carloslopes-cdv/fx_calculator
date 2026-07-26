"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Container, Box, Typography, Snackbar, Alert } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ShieldIcon from "@mui/icons-material/Shield";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { client } from "@/utils/api";
import { formatCurrency } from "@/utils/formatters";

import type { Book, Trade, RiskReportResponseDto } from "@/api-client";

import { FormattedCurrency } from "@/components/atoms/FormattedCurrency";
import { MetricCard } from "@/components/molecules/MetricCard";
import { FxRateSimulatorBar } from "@/components/molecules/FxRateSimulatorBar";
import { RiskReportCard } from "@/components/organisms/RiskReportCard";
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
import { PrimaryActionButton } from "@/components/atoms/buttons/PrimaryActionButton";
import { RefreshButton } from "@/components/atoms/buttons/RefreshButton";

export default function DashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [currentBookId, setCurrentBookId] = useState<string>("");
  const [availableBooks, setAvailableBooks] = useState<
    { id: string; name: string }[]
  >([]);

  const [currentFxRate, setCurrentFxRate] = useState<number>(5.2);
  const [simulatedRate, setSimulatedRate] = useState<number | undefined>(
    undefined,
  );

  const [metrics, setMetrics] = useState({
    totalVolume: 0,
    hedgedVolume: 0,
    netExposure: 0,
    unrealizedPnL: 0,
    coverageRatio: 0,
    health: "HEALTHY" as "HEALTHY" | "WARNING" | "CRITICAL",
  });

  const [suggestedAction, setSuggestedAction] = useState<{
    action: "BUY" | "SELL" | "HOLD" | string;
    targetCurrency: string;
    amount: number;
  } | null>(null);

  const [trades, setTrades] = useState<TradeItem[]>([]);

  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);
  const [isHedgeModalOpen, setIsHedgeModalOpen] = useState<boolean>(false);
  const [selectedTradeForHedge, setSelectedTradeForHedge] =
    useState<TradeItem | null>(null);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const showToast = useCallback(
    (message: string, severity: "success" | "error" | "info") => {
      setToast({ open: true, message, severity });
    },
    [],
  );

  const fetchDashboardData = useCallback(
    async (rateOverride?: number) => {
      setLoading(true);
      try {
        // A. Busca ou Cria Carteira (Tipado como Book[])
        const booksResponse = await client.get({ url: "/api/books" });
        const booksList = (booksResponse.data as Book[]) || [];

        setAvailableBooks(
          booksList.map((b) => {
            const obj = b as Record<string, unknown>;
            return { id: String(obj.id || ""), name: String(obj.name || "") };
          }),
        );

        let book = booksList[0];

        if (!book) {
          const newBook = await client.post({
            url: "/api/books",
            body: { name: "Carteira Principal de Tesouraria" },
          });
          book = newBook.data as Book;
        }

        const bookId = (book as Record<string, unknown>)?.id as
          string | undefined;

        if (bookId) {
          setCurrentBookId(bookId);

          // B. Consulta o Relatório de Risco
          const riskUrl = `/api/risk/books/${bookId}`;

          const riskResponse = await client.get({
            url: riskUrl,
            query: rateOverride ? { usdbrl: rateOverride } : undefined,
          });

          const riskData = riskResponse.data as RiskReportResponseDto;

          if (riskData) {
            setMetrics({
              totalVolume: riskData.totalExposedVolume, // (No backend isso é o Vol. Bruto)
              hedgedVolume: riskData.totalHedgedVolume,
              netExposure: riskData.netExposure || 0, // <-- LENDO A MÉTRICA NOVA DO BACKEND
              unrealizedPnL: riskData.totalUnrealizedPnl,
              coverageRatio: riskData.overallHedgeRatioPercent,
              health: riskData.healthStatus,
            });

            const activeRate =
              rateOverride || riskData.tradesDetails?.[0]?.marketRate || 5.2;
            setCurrentFxRate(activeRate);

            setSuggestedAction(riskData.suggestedAction || null);
          }

          // C. Busca Operações (Tipado como Trade[])
          const tradesResponse = await client.get({ url: "/api/trades" });
          const tradesList = (tradesResponse.data as Trade[]) || [];

          if (Array.isArray(tradesList)) {
            const activeRate = rateOverride || currentFxRate || 5.2;

            const mappedTrades: TradeItem[] = tradesList.map((t) => {
              // Cast seguro para acessar as propriedades sem usar 'any'
              const tradeObj = t as Record<string, unknown>;
              const bookObj = (tradeObj.book as Record<string, unknown>) || {};
              const volume = Number(tradeObj.volume || 0);
              const entryRate = Number(tradeObj.entryRate || 0);

              let calculatedPnL = Number(tradeObj.unrealizedPnL || 0);
              if (!calculatedPnL && volume > 0) {
                calculatedPnL =
                  tradeObj.side === "BUY"
                    ? (activeRate - entryRate) * volume
                    : (entryRate - activeRate) * volume;
              }

              // Trata o volume do array de hedges
              const hedgesArray =
                (tradeObj.hedges as Record<string, unknown>[]) || [];
              const hedgedVolume = hedgesArray.reduce(
                (sum, h) => sum + Number(h.volume || 0),
                0,
              );

              return {
                id: String(tradeObj.id || ""),
                bookName: String(bookObj.name || "Carteira não informada"),
                side: (tradeObj.side as "BUY" | "SELL") || "BUY",
                currencyPair: String(tradeObj.currencyPair || "USDBRL"),
                volume,
                entryRate,
                currentRate: activeRate,
                unrealizedPnL: calculatedPnL,
                tradeDate: String(
                  tradeObj.tradeDate || tradeObj.createdAt || "",
                ),
                hedgedVolume,
              };
            });

            setTrades(mappedTrades);
          }
        }
      } catch (error: unknown) {
        console.error("Erro ao carregar dados da tesouraria:", error);
        showToast("Erro ao conectar com a API de Risco Cambial.", "error");
      } finally {
        setLoading(false);
        setSimulating(false);
      }
    },
    [showToast, currentFxRate],
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchDashboardData(simulatedRate);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData, simulatedRate]);

  const handleSimulateFx = (rate: number | undefined) => {
    setSimulating(true);
    setSimulatedRate(rate);
  };

  const handleCreateTrade = async (data: CreateTradeFormData) => {
    try {
      await client.post({
        url: "/api/trades",
        body: data,
      });
      showToast("Operação cambial boletada com sucesso!", "success");
      fetchDashboardData(simulatedRate);
    } catch (error: unknown) {
      const err = error as { body?: { message?: string } };
      showToast(
        err?.body?.message || "Falha ao registrar a operação cambial.",
        "error",
      );
    }
  };

  const handleCreateHedge = async (data: CreateHedgeFormData) => {
    try {
      await client.post({
        url: "/api/hedges",
        body: data,
      });
      showToast("Proteção cambial (Hedge) vinculada com sucesso!", "success");
      fetchDashboardData(simulatedRate);
    } catch (error: unknown) {
      const err = error as { body?: { message?: string } };
      showToast(
        err?.body?.message || "Erro na Trava Anti-Overhedging da API.",
        "error",
      );
    }
  };

  const handleOpenHedgeModal = (trade: TradeItem) => {
    setSelectedTradeForHedge(trade);
    setIsHedgeModalOpen(true);
  };

  const handleExecuteSuggestedAction = () => {
    document
      .getElementById("trades-grid-section")
      ?.scrollIntoView({ behavior: "smooth" });
    showToast(
      "Selecione uma operação (Trade) desprotegida na tabela e clique no botão 'Hedge' para adicionar cobertura.",
      "info",
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 1. CABEÇALHO DO DASHBOARD */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "primary.light" }}
          >
            Gestão de Risco Cambial
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <RefreshButton
            onRefresh={() => fetchDashboardData(simulatedRate)}
            loading={loading}
          />
          <PrimaryActionButton
            onClick={() => setIsTradeModalOpen(true)}
            disabled={loading || !currentBookId}
          >
            Novo Trade
          </PrimaryActionButton>
        </Box>
      </Box>

      {/* 2. BARRA DE SIMULAÇÃO DE CÂMBIO */}
      <Box sx={{ mb: 3 }}>
        <FxRateSimulatorBar
          currentRate={currentFxRate}
          onSimulate={handleSimulateFx}
          loading={simulating || loading}
        />
      </Box>

      {/* 3. CARDS DE MÉTRICAS & PnL */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, // <-- Mudou para 4 colunas
          gap: 2.5,
          mb: 3,
        }}
      >
        <MetricCard
          title="Volume Bruto Total"
          value={formatCurrency(metrics.totalVolume, "USD")}
          subtitle="Soma de todas as operações abertas"
          icon={<AccountBalanceWalletIcon />}
          loading={loading}
        />
        <MetricCard
          title="Volume de Hedges"
          value={formatCurrency(metrics.hedgedVolume, "USD")}
          subtitle="Proteção ativa no mercado"
          icon={<ShieldIcon />}
          loading={loading}
        />

        {/* NOVO CARD: Exposição Líquida */}
        <MetricCard
          title="Exposição Líquida"
          value={formatCurrency(metrics.netExposure, "USD")}
          subtitle="Volume desprotegido a mercado"
          icon={<WarningAmberIcon color="warning" />}
          loading={loading}
        />

        <MetricCard
          title="Marcação a Mercado (MTM)"
          value={
            <FormattedCurrency
              value={metrics.unrealizedPnL}
              currency="BRL"
              highlightPnL
              sx={{ fontSize: "1.5rem" }}
            />
          }
          subtitle={
            simulatedRate
              ? `Resultado não realizado (Simulação R$ ${simulatedRate.toFixed(4)})`
              : "Resultado não realizado (Cotação de Mercado)"
          }
          icon={<TrendingUpIcon />}
          loading={loading}
        />
      </Box>
      {/* 4. RELATÓRIO DO MOTOR DE RISCO (SEMÁFORO) */}
      <Box sx={{ mb: 3 }}>
        <RiskReportCard
          health={metrics.health}
          coverageRatio={metrics.coverageRatio}
          suggestedAction={suggestedAction}
          loading={loading}
          onExecuteSuggestedAction={handleExecuteSuggestedAction}
        />
      </Box>

      {/* 5. TABELA DE OPERAÇÕES (TRADES DATA GRID) */}
      <Box id="trades-grid-section" sx={{ mb: 3 }}>
        <TradesDataGrid
          trades={trades}
          loading={loading}
          onOpenHedgeModal={handleOpenHedgeModal}
        />
      </Box>

      {/* --- MODAIS DE AÇÃO --- */}
      <TradeFormModal
        open={isTradeModalOpen}
        books={availableBooks}
        defaultBookId={currentBookId}
        onClose={() => setIsTradeModalOpen(false)}
        onSubmit={handleCreateTrade}
      />

      <HedgeFormModal
        open={isHedgeModalOpen}
        trade={selectedTradeForHedge}
        onClose={() => setIsHedgeModalOpen(false)}
        onSubmit={handleCreateHedge}
      />

      {/* SNACKBAR DE FEEDBACK */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
