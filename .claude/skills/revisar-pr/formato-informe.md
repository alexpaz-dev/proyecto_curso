# Formato del informe

Escribe el informe en español, con estas secciones y en este orden. Cita solo la evidencia justa (`archivo:línea`, una línea de log, un SHA): no pegues el diff ni los logs completos.

## Veredicto

Una de estas tres opciones, seguida de una o dos frases que la justifiquen:

- **Aprobable**: se cumplen todos los criterios, el proceso es correcto y no hay errores demostrados. Que no haya CI no impide este veredicto: anótalo en «Pendientes de verificar».
- **Aprobable con cambios**: hay errores de gravedad media o baja, fallos de proceso que se corrigen sin rehacer el trabajo o criterios que no se han podido verificar.
- **No aprobable**: algún criterio no se cumple, hay un error demostrado de gravedad alta o la CI está en rojo.

## Criterios de aceptación

| Criterio                       | Estado                                    | Evidencia                                       |
| ------------------------------ | ----------------------------------------- | ----------------------------------------------- |
| Texto del criterio en la issue | Se cumple / No se cumple / No verificable | `src/archivo.ts:42`, check `<nombre>` o `<sha>` |

## Hallazgos

De mayor a menor gravedad. A igual gravedad, primero los errores demostrados, después los riesgos sin demostrar y al final los cambios fuera de alcance. Si no hay ninguno, escribe «Sin hallazgos».

- **Alta**: incumple un criterio, rompe la build o la CI, o causa un fallo visible para el usuario.
- **Media**: incumple una regla de CLAUDE.md o el flujo de Git sin romper lo que pide la issue.
- **Baja**: detalles de nombres, comentarios o documentación.

### Alta · Error demostrado: título corto

- **Evidencia**: `archivo:línea`, salida de un comando o de la CI.
- **Impacto**: qué falla y en qué caso.
- **Comprobación sugerida**: cómo reproducirlo o confirmar que está corregido.

## CI y commits

CI del último commit (`<sha>`): estado de cada check, o «sin CI» si no hay ninguno.

| Comprobación      | Estado                                    | Evidencia |
| ----------------- | ----------------------------------------- | --------- |
| PR contra `dev`   | Se cumple / No se cumple / No verificable |           |
| Nombre de la rama |                                           |           |
| `Closes #<n>`     |                                           |           |
| CI en verde       |                                           |           |

| Commit  | Mensaje   | commitlint              |
| ------- | --------- | ----------------------- |
| `<sha>` | `feat: …` | Pasa / Falla: `<regla>` |

## Pendientes de verificar

Lo que no has podido comprobar y cómo hacerlo (ejecutar la app, revisar las reglas de protección en GitHub…). Si no hay CI, incluye ejecutar `npm run check` y `npm run build` en la rama de la PR. Si no queda nada, escribe «Nada pendiente».
