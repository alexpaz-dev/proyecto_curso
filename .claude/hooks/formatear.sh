#!/usr/bin/env bash
# formatear.sh formatea con Prettier el archivo que Claude Code acaba de crear o editar.
# Hook PostToolUse: recibe por la entrada estándar el JSON de la herramienta.

set -u

project_dir="${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"
if ! cd "$project_dir"; then
  echo "No se pudo entrar en el directorio del proyecto: $project_dir" >&2
  exit 2
fi

file_path="$(node -e '
try {
  const filePath = JSON.parse(require("fs").readFileSync(0, "utf8"))?.tool_input?.file_path;
  if (typeof filePath === "string") process.stdout.write(filePath);
} catch {}
')"

if [ -z "$file_path" ]; then
  exit 0
fi

if ! prettier_output="$(npx prettier --write --ignore-unknown "$file_path" 2>&1)"; then
  echo "Prettier no pudo formatear $file_path:" >&2
  echo "$prettier_output" >&2
  exit 2
fi
