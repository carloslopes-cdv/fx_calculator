#!/bin/bash

# Captura o primeiro argumento passado no terminal
NAME="$1"

# Valida se o nome foi fornecido
if [[ -z "$NAME" ]]; then
  echo "Erro: Você precisa fornecer um nome para a migration."
  echo "Exemplo de uso: pnpm run migration:generate CreateUsersTable"
  exit 1
fi

echo "Gerando migration: $NAME..."

# Executa o TypeORM CLI apontando para o data-source atual
npx typeorm-ts-node-commonjs migration:generate "./src/database/migrations/$NAME" -d ./src/database/data-source.ts

echo "Comando finalizado!"