"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ShieldIcon from "@mui/icons-material/Shield";

// 1. Imports de utilitários e clientes
import { client } from "@/utils/api";
import { formatCurrency } from "@/utils/formatters";

// 2. Componentes visuais
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

interface BookData {
  id: string;
  name: string;
}

interface RiskReportData {
  totalTradeVolume?: number | string;
  totalExposedVolume?: number | string;
  totalHedgeVolume?: number | string;
  totalHedgedVolume?: number | string;
  totalUnrealizedPnL?: number | string;
  totalUnrealizedPnl?: number | string;
  coverageRatio?: number | string;
  overallHedgeRatioPercent?: number | string;
  health?: "HEALTHY" | "WARNING" | "CRITICAL" | string;
  healthStatus?: "HEALTHY" | "WARNING" | "CRITICAL" | string;
  currentFxRate?: number | string;
  tradesDetails?: Array<{ marketRate?: number | string }>;
  suggestedAction?:
    { action: string; targetCurrency: string; amount: number } | string | null;
  suggestedAmount?: number | string;
  [key: string]: unknown;
}

interface TradeResponseItem {
  id?: string | number;
  side?: string;
  currencyPair?: string;
  volume?: number | string;
  entryRate?: number | string;
  unrealizedPnL?: number | string;
  tradeDate?: string;
  createdAt?: string;
  hedgedVolume?: number | string;
  [key: string]: unknown;
}

export default function DashboardPage() {
  // --- ESTADOS DA APLICAÇÃO ---
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [currentBookId, setCurrentBookId] = useState<string>("");

  // Cotação e Simulação
  const [currentFxRate, setCurrentFxRate] = useState<number>(5.2);
  const [simulatedRate, setSimulatedRate] = useState<number | undefined>(
    undefined,
  );

  // Métricas do Motor de Risco
  const [metrics, setMetrics] = useState({
    totalVolume: 0,
    hedgedVolume: 0,
    unrealizedPnL: 0,
    coverageRatio: 0,
    health: "HEALTHY" as "HEALTHY" | "WARNING" | "CRITICAL",
  });

  const [suggestedAction, setSuggestedAction] = useState<{
    action: "BUY" | "SELL" | string;
    targetCurrency: string;
    amount: number;
  } | null>(null);

  const [trades, setTrades] = useState<TradeItem[]>([]);

  // Modais de Ação
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);
  const [isHedgeModalOpen, setIsHedgeModalOpen] = useState<boolean>(false);
  const [selectedTradeForHedge, setSelectedTradeForHedge] =
    useState<TradeItem | null>(null);

  // Toast Notifications
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

  // --- CARREGAMENTO DE DADOS DA API ---
  const fetchDashboardData = useCallback(
    async (rateOverride?: number) => {
      setLoading(true);
      try {
        // A. Busca ou Cria Carteira (Book)
        const booksResponse = await client.get({ url: "/api/books" });
        const booksList = booksResponse.data as BookData[] | undefined;
        let book = Array.isArray(booksList) ? booksList[0] : undefined;

        if (!book) {
          const newBook = await client.post({
            url: "/api/books",
            body: { name: "Carteira Principal de Tesouraria" },
          });
          book = newBook.data as BookData;
        }

        if (book?.id) {
          setCurrentBookId(book.id);

          // B. Consulta o Relatório de Risco (com parâmetro de simulação)
          const riskUrl = rateOverride
            ? `/api/risk/report/${book.id}?usdbrl=${rateOverride}`
            : `/api/risk/report/${book.id}`;

          const riskResponse = await client.get({
            url: riskUrl,
            query: rateOverride ? { usdbrl: rateOverride } : undefined,
          });

          const rawRisk = riskResponse.data as RiskReportData | undefined;

          if (rawRisk) {
            // FIX: Leitura defensiva que suporta ambas as nomenclaturas do NestJS
            const totalVol = Number(
              rawRisk.totalTradeVolume ?? rawRisk.totalExposedVolume ?? 0,
            );
            const hedgedVol = Number(
              rawRisk.totalHedgeVolume ?? rawRisk.totalHedgedVolume ?? 0,
            );
            const pnl = Number(
              rawRisk.totalUnrealizedPnL ?? rawRisk.totalUnrealizedPnl ?? 0,
            );
            const ratio = Number(
              rawRisk.coverageRatio ?? rawRisk.overallHedgeRatioPercent ?? 0,
            );
            const healthStatus =
              rawRisk.health ?? rawRisk.healthStatus ?? "HEALTHY";

            setMetrics({
              totalVolume: totalVol,
              hedgedVolume: hedgedVol,
              unrealizedPnL: pnl,
              coverageRatio: ratio,
              health: healthStatus as "HEALTHY" | "WARNING" | "CRITICAL",
            });

            // Define cotação ativa
            const activeRate =
              rateOverride ||
              Number(rawRisk.currentFxRate) ||
              Number(rawRisk.tradesDetails?.[0]?.marketRate) ||
              5.2;

            setCurrentFxRate(activeRate);

            // Ação sugerida
            if (rawRisk.suggestedAction) {
              if (typeof rawRisk.suggestedAction === "object") {
                setSuggestedAction(rawRisk.suggestedAction);
              } else {
                setSuggestedAction({
                  action: healthStatus === "CRITICAL" ? "BUY" : "HOLD",
                  targetCurrency: "USD",
                  amount: Number(rawRisk.suggestedAmount || 0),
                });
              }
            } else {
              setSuggestedAction(null);
            }
          }

          // C. Busca Operações (Trades)
          const tradesResponse = await client.get({
            url: `/api/trades`,
          });

          const tradesList = Array.isArray(tradesResponse.data)
            ? tradesResponse.data
            : (tradesResponse.data as { trades?: unknown[] })?.trades || [];

          if (Array.isArray(tradesList)) {
            const activeRate = rateOverride || currentFxRate || 5.2;

            const mappedTrades: TradeItem[] = tradesList.map(
              (t: TradeResponseItem) => {
                const volume = Number(t.volume || 0);
                const entryRate = Number(t.entryRate || 0);

                // Cálculo dinâmico de PnL para a tabela
                let calculatedPnL = Number(t.unrealizedPnL || 0);
                if (!calculatedPnL && volume > 0) {
                  calculatedPnL =
                    t.side === "BUY"
                      ? (activeRate - entryRate) * volume
                      : (entryRate - activeRate) * volume;
                }

                return {
                  id: String(t.id),
                  side: t.side || "BUY",
                  currencyPair: t.currencyPair || "USDBRL",
                  volume,
                  entryRate,
                  currentRate: activeRate,
                  unrealizedPnL: calculatedPnL,
                  tradeDate: String(
                    t.tradeDate || t.createdAt || new Date().toISOString(),
                  ),
                  hedgedVolume: Number(t.hedgedVolume || 0),
                };
              },
            );

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
      showToast("Operação cambial (Trade) boletada com sucesso!", "success");
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
    setIsTradeModalOpen(true);
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
          <Typography variant="body2" color="text.secondary">
            Treasury FX Risk Dashboard & Mark-to-Market Engine
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={() => fetchDashboardData(simulatedRate)}
            disabled={loading}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsTradeModalOpen(true)}
            disabled={loading || !currentBookId}
            sx={{ fontWeight: 700 }}
          >
            Novo Trade
          </Button>
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
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2.5,
          mb: 3,
        }}
      >
        <MetricCard
          title="Volume Exposto Total"
          value={formatCurrency(metrics.totalVolume, "USD")}
          subtitle="Soma do volume das operações abertas"
          icon={<AccountBalanceWalletIcon />}
          loading={loading}
        />
        <MetricCard
          title="Volume Coberto (Hedge)"
          value={formatCurrency(metrics.hedgedVolume, "USD")}
          subtitle="Proteção ativa no mercado"
          icon={<ShieldIcon />}
          loading={loading}
        />
        <MetricCard
          title="Marcação a Mercado (MtM / PnL)"
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
      <Box sx={{ mb: 3 }}>
        <TradesDataGrid
          trades={trades}
          loading={loading}
          onOpenHedgeModal={handleOpenHedgeModal}
        />
      </Box>

      {/* --- MODAIS DE AÇÃO --- */}
      <TradeFormModal
        open={isTradeModalOpen}
        bookId={currentBookId}
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
