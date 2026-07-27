"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Container, Box, Typography, IconButton, Tooltip } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import { client } from "@/utils/api";
import { formatDate } from "@/utils/formatters";
import { PrimaryActionButton } from "@/components/atoms/buttons/PrimaryActionButton";
import { RefreshButton } from "@/components/atoms/buttons/RefreshButton";
import { FormattedCurrency } from "@/components/atoms/FormattedCurrency";
import {
  BookFormModal,
  CreateBookFormData,
} from "@/components/organisms/BookFormModal";
import { AppDataTable } from "@/components/organisms/AppDataTable";
import { ConfirmDeleteDialog } from "@/components/molecules/ConfirmDeleteDialog";

type MappedBook = {
  id: string;
  name: string;
  totalVolume: number;
  netExposure: number;
  createdAt: string;
};

export default function BooksPage() {
  const [books, setBooks] = useState<MappedBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para exclusão de carteira
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null);
  const [isDeletingBook, setIsDeletingBook] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get({ url: "/api/books" });
      const booksList = (res.data as Record<string, unknown>[]) || [];

      const mapped: MappedBook[] = booksList.map((b) => ({
        id: String(b.id || ""),
        name: String(b.name || ""),
        totalVolume: Number(b.totalVolume || 0),
        netExposure: Number(b.netExposure || 0),
        createdAt: String(
          b.createdAt || b.created_at || new Date().toISOString(),
        ),
      }));

      setBooks(mapped);
    } catch (err) {
      console.error("Erro ao carregar books:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchBooks();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchBooks]);

  const handleCreateBook = async (data: CreateBookFormData) => {
    try {
      await client.post({ url: "/api/books", body: data });
      void fetchBooks();
    } catch (error) {
      console.error("Erro ao criar book", error);
    }
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setDeleteBookId(id);
  };

  const handleConfirmDeleteBook = async () => {
    if (!deleteBookId) return;

    setIsDeletingBook(true);
    try {
      await client.delete({ url: `/api/books/${deleteBookId}` });
      void fetchBooks();
    } catch (error) {
      console.error("Erro ao excluir carteira:", error);
    } finally {
      setIsDeletingBook(false);
      setDeleteBookId(null);
    }
  };

  const columns: GridColDef<MappedBook>[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<MappedBook, string>) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: "monospace", color: "text.secondary" }}
        >
          #{params.value?.slice(0, 6)}
        </Typography>
      ),
    },
    {
      field: "name",
      headerName: "Nome da Carteira",
      flex: 1.5,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<MappedBook, string>) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "totalVolume",
      headerName: "Volume Total (USD)",
      flex: 1.2,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<MappedBook, number>) => (
        <FormattedCurrency value={params.value || 0} currency="USD" />
      ),
    },
    {
      field: "netExposure",
      headerName: "Exposição Desprotegida",
      flex: 1.2,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<MappedBook, number>) => (
        <Box
          sx={{
            color: (params.value || 0) > 0 ? "error.main" : "success.main",
            fontWeight: 700,
          }}
        >
          <FormattedCurrency value={params.value || 0} currency="USD" />
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Data de Criação",
      flex: 1,
      minWidth: 130,
      renderCell: (params: GridRenderCellParams<MappedBook, string>) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Ações",
      flex: 0.5,
      minWidth: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams<MappedBook>) => (
        <Tooltip title="Excluir Carteira">
          <IconButton
            size="small"
            color="error"
            onClick={() => handleOpenDeleteConfirm(params.row.id)}
            sx={{
              border: "1px solid rgba(244, 67, 54, 0.4)",
              backgroundColor: "rgba(244, 67, 54, 0.04)",
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

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
            Registro de Books
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <RefreshButton onRefresh={fetchBooks} loading={loading} />
          <PrimaryActionButton
            onClick={() => setIsModalOpen(true)}
            disabled={loading}
          >
            Nova Carteira
          </PrimaryActionButton>
        </Box>
      </Box>

      <AppDataTable rows={books} columns={columns} loading={loading} />

      <ConfirmDeleteDialog
        open={Boolean(deleteBookId)}
        title="Excluir Carteira"
        description="Deseja realmente excluir esta carteira de tesouraria? Certifique-se de que não existem operações ativas atreladas a ela."
        loading={isDeletingBook}
        onClose={() => setDeleteBookId(null)}
        onConfirm={handleConfirmDeleteBook}
      />

      <BookFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBook}
      />
    </Container>
  );
}
