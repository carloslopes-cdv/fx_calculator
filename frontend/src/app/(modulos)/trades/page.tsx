"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  MenuItem,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { client } from "@/utils/api";
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

interface BookOption {
  id: string;
  name: string;
}

export default function TradesPage() {
  const [books, setBooks] = useState<BookOption[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modais
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);
  const [isHedgeModalOpen, setIsHedgeModalOpen] = useState<boolean>(false);
  const [selectedTradeForHedge, setSelectedTradeForHedge] =
    useState<TradeItem | null>(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // 1. Busca da lista de Books para o Select
  const fetchBooks = useCallback(async () => {
    try {
      const res = await client.get({ url: "/api/books" });
      const data = (res.data as BookOption[]) || [];
      setBooks(data);
    } catch (err) {
      console.error("Erro ao buscar books:", err);
    }
  }, []);

  // 2. Busca de Trades (por book selecionado ou TODOS)
  const fetchTrades = useCallback(async (bookId?: string) => {
    setLoading(true);
    try {
      // Se houver bookId, busca por book. Senão, busca a lista completa.
      const url = bookId ? `/api/trades/book/${bookId}` : "/api/trades";
      const res = await client.get({ url });

      // Trata possíveis estruturas de retorno do NestJS
      // Normalize response data safely without using `any`
      const data = res.data as unknown;
      let rawData: unknown[] = [];

      if (Array.isArray(data)) {
        rawData = data;
      } else if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        if (Array.isArray(obj.trades)) rawData = obj.trades as unknown[];
        else if (Array.isArray(obj.data)) rawData = obj.data as unknown[];
      }

      const toStr = (v: unknown, fallback = "") =>
        v === null || v === undefined ? fallback : String(v);
      const toNum = (v: unknown, fallback = 0) => {
        if (typeof v === "number") return v;
        if (typeof v === "string" && v.trim() !== "") return Number(v);
        return fallback;
      };

      const mapped: TradeItem[] = rawData.map((t) => {
        const obj =
          t && typeof t === "object" ? (t as Record<string, unknown>) : {};

        return {
          id: toStr(obj.id, ""),
          side: toStr(obj.side, "BUY") as TradeItem["side"],
          currencyPair: toStr(obj.currencyPair, "USDBRL"),
          volume: toNum(obj.volume, 0),
          entryRate: toNum(obj.entryRate, 0),
          unrealizedPnL: toNum(obj.unrealizedPnL, 0),
          tradeDate: toStr(
            obj.tradeDate,
            toStr(obj.createdAt, new Date().toISOString()),
          ),
          hedgedVolume: toNum(obj.hedgedVolume, 0),
        } as TradeItem;
      });

      setTrades(mapped);
    } catch (err) {
      console.error("Erro ao carregar trades:", err);
      setToast({
        open: true,
        message: "Erro ao conectar com a API de Trades.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchBooks();
      await fetchTrades();
    };

    loadInitialData();
  }, [fetchBooks, fetchTrades]);

  // Handler para mudança no filtro de Book
  const handleBookChange = (bookId: string) => {
    setSelectedBookId(bookId);
    fetchTrades(bookId);
  };

  const handleCreateTrade = async (data: CreateTradeFormData) => {
    try {
      await client.post({ url: "/api/trades", body: data });
      setToast({
        open: true,
        message: "Trade registrado com sucesso!",
        severity: "success",
      });
      fetchTrades(selectedBookId);
    } catch {
      setToast({
        open: true,
        message: "Erro ao registrar Trade.",
        severity: "error",
      });
    }
  };

  const handleCreateHedge = async (data: CreateHedgeFormData) => {
    try {
      await client.post({ url: "/api/hedges", body: data });
      setToast({
        open: true,
        message: "Hedge vinculado com sucesso!",
        severity: "success",
      });
      fetchTrades(selectedBookId);
    } catch {
      setToast({
        open: true,
        message: "Erro ao vincular Hedge.",
        severity: "error",
      });
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
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "primary.light" }}
          >
            Operações Cambiais (Trades)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Módulo de boletagem e acompanhamento das operações spot/derivatives
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            select
            size="small"
            label="Filtrar por Book"
            value={selectedBookId}
            onChange={(e) => handleBookChange(e.target.value)}
            sx={{ width: 240 }}
          >
            <MenuItem value="">Todas as Carteiras</MenuItem>
            {books.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsTradeModalOpen(true)}
            disabled={!books.length && !selectedBookId}
            sx={{ fontWeight: 700 }}
          >
            Novo Trade
          </Button>
        </Box>
      </Box>

      <TradesDataGrid
        trades={trades}
        loading={loading}
        onOpenHedgeModal={(trade) => {
          setSelectedTradeForHedge(trade);
          setIsHedgeModalOpen(true);
        }}
      />

      <TradeFormModal
        open={isTradeModalOpen}
        bookId={selectedBookId || (books[0]?.id ?? "")}
        onClose={() => setIsTradeModalOpen(false)}
        onSubmit={handleCreateTrade}
      />

      <HedgeFormModal
        open={isHedgeModalOpen}
        trade={selectedTradeForHedge}
        onClose={() => setIsHedgeModalOpen(false)}
        onSubmit={handleCreateHedge}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Container>
  );
}
