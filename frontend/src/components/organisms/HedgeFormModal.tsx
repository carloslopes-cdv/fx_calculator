"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  InputAdornment,
} from "@mui/material";
import { TradeItem } from "./TradesDataGrid";
import { formatCurrency } from "@/utils/formatters";

export interface CreateHedgeFormData {
  tradeId: string;
  volume: number;
  entryRate: number;
  hedgeDate: string;
}

interface HedgeFormModalProps {
  open: boolean;
  trade: TradeItem | null;
  onClose: () => void;
  onSubmit: (data: CreateHedgeFormData) => Promise<void>;
  loading?: boolean;
}

export const HedgeFormModal: React.FC<HedgeFormModalProps> = ({
  open,
  trade,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [volume, setVolume] = useState<string>("");
  const [entryRate, setEntryRate] = useState<string>("");
  const [hedgeDate, setHedgeDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  if (!trade) return null;

  // Trava Anti-Overhedging (Client Side Calculation)
  const currentHedged = trade.hedgedVolume || 0;
  const maxAvailableHedge = trade.volume - currentHedged;
  const inputVolume = parseFloat(volume) || 0;
  const isOverhedging = inputVolume > maxAvailableHedge;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsedRate = parseFloat(entryRate.replace(",", "."));

    if (inputVolume > 0 && !isOverhedging && parsedRate > 0) {
      await onSubmit({
        tradeId: trade.id,
        volume: inputVolume,
        entryRate: parsedRate,
        hedgeDate: new Date(hedgeDate).toISOString(),
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Vincular Hedge de Proteção
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Box sx={{ p: 2, borderRadius: 1, bgcolor: "background.default" }}>
            <Typography variant="caption" color="text.secondary">
              Trade Vinculado: #{trade.id.slice(0, 8)} ({trade.currencyPair})
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Volume do Trade: {formatCurrency(trade.volume, "USD")} | Já
              Protegido: {formatCurrency(currentHedged, "USD")}
            </Typography>
            <Typography
              variant="body2"
              color="primary.main"
              sx={{ fontWeight: 700, mt: 0.5 }}
            >
              Saldo Máximo Permitido para Hedge:{" "}
              {formatCurrency(maxAvailableHedge, "USD")}
            </Typography>
          </Box>

          {isOverhedging && (
            <Alert severity="error">
              <strong>Trava Anti-Overhedging Ativada!</strong> O volume digitado
              ({formatCurrency(inputVolume, "USD")}) ultrapassa o saldo
              disponível do Trade ({formatCurrency(maxAvailableHedge, "USD")}).
            </Alert>
          )}

          <TextField
            label="Volume do Hedge"
            type="number"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            required
            fullWidth
            error={isOverhedging}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Taxa do Hedge"
            value={entryRate}
            onChange={(e) => setEntryRate(e.target.value)}
            placeholder="Ex: 5.2000"
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
            label="Data do Hedge"
            type="date"
            value={hedgeDate}
            onChange={(e) => setHedgeDate(e.target.value)}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit" disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={loading || isOverhedging || inputVolume <= 0}
          >
            {loading ? "Processando..." : "Confirmar Hedge"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
