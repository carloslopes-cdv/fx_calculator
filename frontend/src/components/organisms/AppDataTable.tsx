"use client";

import React from "react";
import { DataGrid, GridColDef, DataGridProps } from "@mui/x-data-grid";
import { Box, Paper, Typography } from "@mui/material";

interface AppDataTableProps extends Omit<DataGridProps, "rows" | "columns"> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: GridColDef<any>[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
}

export const AppDataTable: React.FC<AppDataTableProps> = ({
  rows,
  columns,
  loading = false,
  title,
  subtitle,
  ...props
}) => {
  return (
    <Paper
      variant="outlined"
      sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}
    >
      {(title || subtitle) && (
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
          }}
        >
          {title && (
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "primary.light" }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={[5, 10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        disableRowSelectionOnClick
        autoHeight
        // 🚀 O PULO DO GATO: Garante que a tabela ocupe 100% da largura disponível
        sx={{
          width: "100%",
          border: "none",

          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            borderBottom: "2px solid rgba(255, 255, 255, 0.12)",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 800,
            fontSize: "0.875rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "text.primary",
          },

          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            fontSize: "0.875rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          },

          "& .MuiDataGrid-row:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.03)",
          },

          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
          },
        }}
        {...props}
      />
    </Paper>
  );
};
