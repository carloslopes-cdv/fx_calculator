"use client";

import React from "react";
import { Typography, TypographyProps } from "@mui/material";
import { formatCurrency } from "@/utils/formatters";

interface FormattedCurrencyProps extends TypographyProps {
  value: number;
  currency?: string;
  highlightPnL?: boolean; // Se true: Lucros ficam verdes (> 0) e prejuízos ficam vermelhos (< 0)
}

export const FormattedCurrency: React.FC<FormattedCurrencyProps> = ({
  value,
  currency = "BRL",
  highlightPnL = false,
  sx,
  ...props
}) => {
  let textColor = "inherit";

  if (highlightPnL) {
    if (value > 0) textColor = "success.main";
    else if (value < 0) textColor = "error.main";
  }

  return (
    <Typography
      component="span"
      sx={{
        fontVariantNumeric: "tabular-nums", // Garante que os números tenham a mesma largura para facilitar alinhamento
        fontWeight: highlightPnL ? 700 : 500,
        color: textColor,
        ...sx,
      }}
      {...props}
    >
      {formatCurrency(value, currency)}
    </Typography>
  );
};
