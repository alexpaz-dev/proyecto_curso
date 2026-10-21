---
name: revisar-pr
description: Revisa y valida una pull request de alexpaz-dev/proyecto_curso cuando se pida revisarla, validarla o darle el visto bueno. Comprueba los criterios de aceptación de la issue que cierra, las reglas de CLAUDE.md, el flujo de Git y la CI, y devuelve un informe con veredicto. No la uses para explicar código, revisar cambios que no estén en una PR ni resolver issues.
argument-hint: '[numero-pr]'
context: fork
allowed-tools: Read, Grep, Glob, Bash(git diff *), Bash(git log *), Bash(npx commitlint *), mcp__github__pull_request_read, mcp__github__list_pull_requests, mcp__github__search_pull_requests, mcp__github__issue_read, mcp__github__search_issues, mcp__github__list_commits, mcp__github__get_commit, mcp__github__get_file_contents, mcp__github__search_code, mcp__github__actions_list, mcp__github__actions_get, mcp__github__get_job_logs
---

Revisa una pull request de `alexpaz-dev/proyecto_curso` y devuelve un informe. Argumento: `$ARGUMENTS`.

## Límites

Solo lees e informas. No comentes en la PR, no la apruebes, no pidas cambios, no la mergees, no edites archivos, no hagas commit ni push y no relances la CI. Si algo merece publicarse en GitHub, propónlo en el informe: lo decide el usuario en la conversación principal.

## Procedimiento

1. Localiza la PR y recoge sus datos por MCP.
   - Si el argumento es un número, esa es la PR. Si está vacío, saca la rama actual de `git log -1 --format=%D` (el nombre que sigue a `HEAD -> `) y busca su PR abierta con `list_pull_requests` (`head: alexpaz-dev:<rama>`). Si no hay exactamente una, para y responde que necesitas el número.
   - Lee la PR con `pull_request_read`: `get` (título, descripción, ramas base y head, SHA del último commit), `get_commits`, `get_files` y `get_diff`.
   - Lee con `issue_read` (`get` y `get_comments`) la issue que cierra con `Closes #<n>`. Si la descripción no lo incluye, busca la issue por el número de la rama.
   - Lee la CI del último commit con `pull_request_read` (`get_check_runs` y `get_status`). Si algún job falla, saca solo el final de su log con `get_job_logs` (el `job_id` está en la URL del check; usa `return_content` y `tail_lines`).
   - Para citar `archivo:línea`, lee el archivo en la versión de la PR con `get_file_contents` (`ref: refs/pull/<n>/head`). La copia local puede estar en otra rama: no cites sus líneas como si fueran de la PR.
2. Lee `.claude/CLAUDE.md` en la rama base (`get_file_contents` con `ref` = rama base) y aplica las reglas que afecten a los archivos cambiados. Cita cada regla por su sección.
3. Para cada criterio de aceptación de la issue, decide si se cumple, no se cumple o no se puede verificar, con evidencia: `archivo:línea`, salida de la CI o SHA del commit. Si un criterio depende de algo que no puedes leer (ejecutar la app, la configuración de GitHub), márcalo como no verificable y di cómo comprobarlo.
4. Comprueba el proceso según «Flujo de Git» de `.claude/CLAUDE.md`:
   - La PR va contra `dev`.
   - La rama sigue el formato de esa sección y su número es el de la issue.
   - La descripción incluye `Closes #<n>`.
   - Cada mensaje de commit pasa `npx commitlint`. Pasa el mensaje completo de `get_commits` por la entrada estándar con un heredoc entre comillas (`npx commitlint <<'EOF'` … `EOF`) y anota el código de salida y las reglas que fallan.
   - La CI del último commit está en verde. Si no hay checks ni estados, escribe «sin CI» y no la des por verde.
5. Señala los cambios que quedan fuera del alcance de la issue: archivos o cambios que ningún criterio pide, como refactors, formateo de otros archivos o dependencias nuevas.
6. Separa los errores demostrados (con evidencia que se puede comprobar) de los riesgos sin demostrar (qué podría fallar y cómo comprobarlo). No inventes hallazgos ni conviertas en error una preferencia que CLAUDE.md no recoja. Si no hay defectos, dilo.
7. Devuelve el informe con la plantilla de [formato-informe.md](formato-informe.md). Es tu respuesta final: no incluyas el diff ni los logs completos.
