"use client";

import React, { useState } from "react";
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
  bookId: string;
  onClose: () => void;
  onSubmit: (data: CreateTradeFormData) => Promise<void>;
  loading?: boolean;
}

export const TradeFormModal: React.FC<TradeFormModalProps> = ({
  open,
  bookId,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [currencyPair, setCurrencyPair] = useState<string>("USDBRL");
  const [volume, setVolume] = useState<string>("");
  const [entryRate, setEntryRate] = useState<string>("");
  const [tradeDate, setTradeDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsedVolume = parseFloat(volume);
    const parsedRate = parseFloat(entryRate.replace(",", "."));

    if (parsedVolume > 0 && parsedRate > 0) {
      await onSubmit({
        bookId,
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
      <DialogTitle sx={{ fontWeight: 700 }}>
        Nova Operação Cambial (Trade)
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            select
            label="Direção da Operação"
            value={side}
            onChange={(e) => setSide(e.target.value as "BUY" | "SELL")}
            fullWidth
          >
            <MenuItem value="BUY">COMPRA (BUY)</MenuItem>
            <MenuItem value="SELL">VENDA (SELL)</MenuItem>
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
            label="Volume (Moeda Estrangeira)"
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
