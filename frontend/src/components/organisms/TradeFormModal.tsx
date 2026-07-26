"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  InputAdornment,
} from "@mui/material";

export interface CreateTradeFormData {
  bookId: string;
  side: "BUY" | "SELL";
  currencyPair: string;
  volume: number;
  entryRate: number;
  tradeDate: string;
}

interface TradeFormModalProps {
  open: boolean;
  books: { id: string; name: string }[]; // <-- Nova prop com a lista de carteiras
  defaultBookId: string; // <-- Prop renomeada
  onClose: () => void;
  onSubmit: (data: CreateTradeFormData) => Promise<void>;
  loading?: boolean;
}

export const TradeFormModal: React.FC<TradeFormModalProps> = ({
  open,
  books,
  defaultBookId,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>(
    defaultBookId || "",
  );
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [currencyPair, setCurrencyPair] = useState<string>("USDBRL");
  const [volume, setVolume] = useState<string>("");
  const [entryRate, setEntryRate] = useState<string>("");
  const [tradeDate, setTradeDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setSelectedBookId(defaultBookId), 0);
    return () => clearTimeout(t);
  }, [open, defaultBookId]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsedVolume = parseFloat(volume);
    const parsedRate = parseFloat(entryRate.replace(",", "."));

    if (parsedVolume > 0 && parsedRate > 0 && selectedBookId) {
      await onSubmit({
        bookId: selectedBookId,
        side,
        currencyPair,
        volume: parsedVolume,
        entryRate: parsedRate,
        tradeDate: new Date(tradeDate).toISOString(),
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: "primary.light" }}>
        Novo Trade
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* NOVO CAMPO: Seleção da Carteira */}
          <TextField
            select
            label="Carteira (Book)"
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            fullWidth
            required
          >
            {books.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Direção da Operação"
            value={side}
            onChange={(e) => setSide(e.target.value as "BUY" | "SELL")}
            fullWidth
          >
            <MenuItem value="BUY">Compra</MenuItem>
            <MenuItem value="SELL">Venda</MenuItem>
          </TextField>

          <TextField
            select
            label="Par de Moedas"
            value={currencyPair}
            onChange={(e) => setCurrencyPair(e.target.value)}
            fullWidth
          >
            <MenuItem value="USDBRL">USD / BRL</MenuItem>
            <MenuItem value="EURBRL">EUR / BRL</MenuItem>
          </TextField>

          <TextField
            label="Volume (Moeda Base)"
            type="number"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            placeholder="Ex: 100000"
            required
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Taxa de Câmbio de Entrada"
            value={entryRate}
            onChange={(e) => setEntryRate(e.target.value)}
            placeholder="Ex: 5.2050"
            required
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">R$</InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Data da Operação"
            type="date"
            value={tradeDate}
            onChange={(e) => setTradeDate(e.target.value)}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit" disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Salvando..." : "Boletar Operação"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
