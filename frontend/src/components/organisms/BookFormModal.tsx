"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

export interface CreateBookFormData {
  name: string;
}

interface BookFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBookFormData) => Promise<void>;
}

export const BookFormModal: React.FC<BookFormModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ name });
      setName(""); // Limpa o formulário após o sucesso
      onClose(); // Fecha o modal
    } catch (error) {
      console.error("Erro ao salvar carteira", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName(""); // Reseta o estado ao cancelar
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 2 },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 800, color: "primary.light" }}>
          Nova Carteira
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            id="name"
            label="Nome da Carteira"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
            placeholder="Ex: Mesa de Commodities"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting || !name.trim()}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
            sx={{ fontWeight: 700 }}
          >
            Criar Carteira
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
