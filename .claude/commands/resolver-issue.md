---
description: Resuelve una issue de GitHub siguiendo el flujo del proyecto
argument-hint: '[numero-issue]'
disable-model-invocation: true
allowed-tools: Bash(git branch --show-current)
---

Rama actual: !`git branch --show-current`

Resuelve la issue #$ARGUMENTS de `alexpaz-dev/proyecto_curso` siguiendo «Flujo de Git» de `.claude/CLAUDE.md`. Si `$ARGUMENTS` no es un número de issue, para y pídemelo.

1. Lee la issue #$ARGUMENTS por MCP con `issue_read` (métodos `get` y `get_comments`). Busca sus dependencias en el cuerpo (como «Depende de #4») y en sus relaciones, y consulta el estado de cada una. Si alguna sigue abierta, para y dime cuál.
2. Parte de `dev` actualizada (`git switch dev && git pull`) y crea la rama `<tipo>/$ARGUMENTS-<descripción-corta>`. Propón un plan: qué archivos cambias y cómo cubres cada criterio de aceptación. Espera mi aprobación antes de tocar el código.
3. Haz el cambio y ejecuta `npm run check`. Si falla, corrígelo hasta que pase.
4. Comprueba los criterios de aceptación de la issue uno a uno y dime cómo has verificado cada uno. Si alguno no se cumple, vuelve al paso 3.
5. Valida el mensaje del commit pasándolo por la entrada estándar a `npx commitlint --extends @commitlint/config-conventional`. Cuando salga con 0, haz el commit con ese mismo mensaje.
6. Sube la rama y abre la PR contra `dev` (`gh pr create --base dev`). En la descripción pon `Closes #$ARGUMENTS` y la lista de criterios de aceptación. No la mergees.
