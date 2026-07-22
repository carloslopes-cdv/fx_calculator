"use-client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Paper,
} from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import RefreshIcon from "@mui/icons-material/Refresh";

interface FxRateSimulatorBarProps {
  currentRate: number;
  onSimulate: (simulatedRate: number | undefined) => void;
  loading?: boolean;
}

export const FxRateSimulatorBar: React.FC<FxRateSimulatorBarProps> = ({
  currentRate,
  onSimulate,
  loading = false,
}) => {
  const [simulatedRateInput, setSimulatedRateInput] = useState<string>("");

  const handleApplySimulation = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = parseFloat(simulatedRateInput.replace(",", "."));
    if (!isNaN(parsed) && parsed > 0) {
      onSimulate(parsed);
    }
  };

  const handleReset = () => {
    setSimulatedRateInput("");
    onSimulate(undefined);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        borderColor: "primary.dark",
        backgroundColor: "rgba(2, 132, 199, 0.05)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <ShowChartIcon color="primary" />
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            Cotação USDBRL (Mercado / Live)
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            R$ {currentRate ? currentRate.toFixed(4) : "---"}
          </Typography>
        </Box>
      </Box>

      <Box
        component="form"
        onSubmit={handleApplySimulation}
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <TextField
          size="small"
          label="Simular Câmbio"
          placeholder="Ex: 5.2500"
          value={simulatedRateInput}
          onChange={(e) => setSimulatedRateInput(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">R$</InputAdornment>
              ),
            },
          }}
          sx={{ width: 160 }}
        />
        <Button
          variant="contained"
          size="medium"
          type="submit"
          disabled={loading || !simulatedRateInput}
        >
          Simular
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          size="medium"
          onClick={handleReset}
          startIcon={<RefreshIcon />}
          disabled={loading}
        >
          Resetar
        </Button>
      </Box>
    </Paper>
  );
};
