"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { client } from "@/utils/api";

interface BookItem {
  id: string;
  name: string;
  createdAt?: string;
}

export default function BooksPage() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newBookName, setNewBookName] = useState<string>("");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await client.get({ url: "/api/books" });
      if (response.data) {
        setBooks(response.data as BookItem[]);
      }
    } catch {
      setToast({
        open: true,
        message: "Erro ao carregar carteiras.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchBooks();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchBooks]);

  const handleCreateBook = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newBookName.trim()) return;

    try {
      await client.post({
        url: "/api/books",
        body: { name: newBookName },
      });
      setToast({
        open: true,
        message: "Carteira criada com sucesso!",
        severity: "success",
      });
      setNewBookName("");
      setIsModalOpen(false);
      fetchBooks();
    } catch {
      setToast({
        open: true,
        message: "Erro ao criar carteira.",
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
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "primary.light" }}
          >
            Carteiras de Tesouraria (Books)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerenciamento de unidades de alocação de risco e limites
            operacionais
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{ fontWeight: 700 }}
        >
          Nova Carteira
        </Button>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID da Carteira</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nome da Carteira</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Data de Criação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Carregando carteiras...
                  </TableCell>
                </TableRow>
              ) : books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Nenhuma carteira encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                books.map((b) => (
                  <TableRow key={b.id} hover>
                    <TableCell sx={{ fontFamily: "monospace" }}>
                      #{b.id.slice(0, 8)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{b.name}</TableCell>
                    <TableCell color="text.secondary">
                      {b.createdAt
                        ? new Date(b.createdAt).toLocaleDateString("pt-BR")
                        : "---"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal de Criação */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Nova Carteira de Tesouraria
        </DialogTitle>
        <Box component="form" onSubmit={handleCreateBook}>
          <DialogContent>
            <TextField
              label="Nome da Carteira"
              placeholder="Ex: Book de Derivativos USD"
              value={newBookName}
              onChange={(e) => setNewBookName(e.target.value)}
              fullWidth
              required
              autoFocus
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsModalOpen(false)} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              Criar Book
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

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
