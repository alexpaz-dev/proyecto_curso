# Gestor de Tareas ICE

Aplicación de una sola página para crear tareas y priorizarlas con el modelo ICE: `ICE = (impacto × confianza) / esfuerzo`. Gemini puede sugerir los tres valores a partir del título y la descripción, y el usuario siempre puede ajustarlos a mano. No hay backend: todo ocurre en el navegador.

Stack: React + TypeScript estricto + Vite + Material UI (con Emotion). El estado se gestiona con hooks de React y las peticiones HTTP con `fetch` nativo.

## Comandos

- Instalar: `npm install` y `cp .env.example .env`. Rellena `VITE_GEMINI_API_KEY` solo si necesitas la sugerencia de IA; sin clave la app funciona y el servicio devuelve un error controlado.
- Arrancar: `npm run dev`.
- Verificar antes de dar un cambio por terminado: `npm run check` (tipos + ESLint + Prettier en modo comprobación).
- Corregir lint y formato: `npm run lint:fix` y `npm run format`.
- Compilar: `npm run build` (comprueba tipos y genera `dist/`).
- No hay tests ni runner de tests: no existe `npm test`.

## Flujo de Git

Repo: `alexpaz-dev/proyecto_curso`. Se sigue git flow con dos ramas permanentes:

- `main`: versiones publicadas. Solo recibe PRs desde `dev`.
- `dev`: integración y rama por defecto en GitHub. Todo el trabajo entra aquí.

Para trabajar en una issue:

1. Parte de `dev` actualizada (`git switch dev && git pull`) y crea una rama `issue-<número>-<descripción-corta>`, como `issue-12-filtro-por-estado` o `issue-15-ice-nulo`. El tipo del cambio va en los commits, no en la rama.
2. Haz commits con Conventional Commits (`feat: …`, `fix: …`, `docs: …`). commitlint los valida en el hook `commit-msg` de Husky.
3. Abre el PR siempre contra `dev` (`gh pr create --base dev`) y pon `Closes #<número>` en la descripción. Como `dev` es la rama por defecto, la issue se cierra al mergear.

`main` y `dev` están protegidas: no admiten push directo, force push ni borrado. Solo se mergea por PR, con todos los hilos de conversación resueltos y sin conflictos con la rama base.

## Arquitectura

`src/` se organiza por tipo de código, en carpetas planas:

- `types/`: tipos de dominio compartidos (`Task`, `NewTask`, `TaskUpdate`, `IceScore`, `IceScoreDraft`, `IceLevel`). Sin lógica.
- `utils/`: funciones puras de dominio (cálculo, validación y nivel ICE) y sus constantes (`MIN_ICE_VALUE`, `MAX_ICE_VALUE`, `HIGH_ICE_THRESHOLD`).
- `services/`: I/O externo. `aiIceService.ts` llama a Gemini, parsea la respuesta y la valida. Sin estado de React.
- `hooks/`: estado y lógica de React. `useTaskManager` gestiona el CRUD y la lista ordenada; `useTaskForm`, los valores del formulario, el ICE calculado y la tarea lista para guardar; `useIceSuggestion`, la petición a la IA con `loading`, `error` y `suggestion`.
- `components/`: UI con MUI. Reciben datos y callbacks por props.
- `App.tsx`: raíz. Llama a `useTaskManager` y solo guarda el estado del diálogo (si está abierto y qué tarea se edita).
- `main.tsx`: monta React con el tema MUI (`createTheme`) y `CssBaseline`.

### Reglas de dependencia

- Cada capa importa solo de las anteriores: `types` ← `utils` ← `services` ← `hooks` ← `components` ← `App.tsx`.
- Los componentes nunca importan de `services/`: acceden a la IA a través de un hook.
- `types/` no importa de ninguna otra capa.
- Solo `App.tsx` llama a `useTaskManager`; el resto recibe las tareas y las acciones por props.

### Flujo de datos

- Listado: `useTaskManager` guarda `tasks` y deriva `sortedTasks` (ICE descendente) con `useMemo`. `App` muestra `EmptyState` si no hay tareas y, si las hay, `TaskList`, que pinta un `TaskItem` por tarea.
- Acciones sobre una tarea: `TaskItem` llama a `onToggleStatus`, `onEdit` u `onDelete`, que suben por `TaskList` hasta `App`. Editar no abre el diálogo desde `TaskItem`: lo abre `App`.
- Crear o editar: `App` monta `TaskFormDialog` con `task = null` (nueva) o con la tarea a editar. Al guardar, `App` llama a `createTask` o `updateTask` y cierra el diálogo.
- Sugerencia de IA: `TaskFormDialog` → `useIceSuggestion().requestSuggestion(taskText)` → `getIceSuggestion` → Gemini. Si llega un `IceScore` válido, el diálogo lo aplica con `applyIceScore`. `IceSuggestionPanel` solo muestra el botón, la carga, el error y la sugerencia.

## Dónde va el código nuevo

- Componente visual: `src/components/<Nombre>.tsx`, en PascalCase, uno por archivo y con `export default`.
- Lógica con estado de React: `src/hooks/use<Nombre>.ts`, con export nombrado.
- Llamada a una API o cualquier otro I/O externo: `src/services/<nombre>Service.ts`, con export nombrado.
- Cálculo o validación pura: `src/utils/<verbo><Nombre>.ts` (como `calculateIce.ts`), con export nombrado.
- Constantes de dominio: en el archivo de `utils/` que las usa, en `UPPER_SNAKE_CASE`.
- Tipos compartidos entre capas: `src/types/<Entidad>.ts`. Los tipos locales (props, acciones del reducer, forma de la respuesta de la API) se quedan en su archivo.
- Variable de entorno nueva: usa el prefijo `VITE_`, declárala en `ImportMetaEnv` de `src/vite-env.d.ts` y añádela a `.env.example`.
- Colores y tema: en `createTheme` de `src/main.tsx`. En los componentes, usa los tokens del tema (`primary.main`, `text.secondary`, `grey.400`) dentro de `sx`.
- Mantén `src/` plano: no crees subcarpetas sin que se pida.

## Reglas de dominio ICE

- Impacto, confianza y esfuerzo son enteros de 1 a 10. Valídalos con `isValidIceValue` o `getValidIceScore` de `utils/validateIceScore.ts`; no repitas el rango a mano.
- En el formulario, `null` significa «sin valor todavía» (`IceScoreDraft`). Mientras falte alguno, el ICE calculado es `null` y se muestra `ICE —`.
- Para guardar una tarea hace falta un título no vacío tras `trim()` y los tres valores válidos. Si falta algo, `useTaskForm` devuelve `taskToSave = null` y el botón Guardar se deshabilita.
- No guardes la puntuación ICE en `Task`: calcúlala con `calculateIce` cada vez que haga falta.
- El orden depende solo del ICE (descendente). Las tareas completadas no bajan al final: se muestran atenuadas y tachadas.
- Las tareas nuevas se crean con `status: 'pending'`.

## Convenciones

- Declara componentes, hooks, funciones auxiliares y manejadores con `function`. Usa funciones flecha solo para callbacks en línea (props de JSX, `map`, `filter`, `setState`).
- Define las props con `interface <Componente>Props` justo encima del componente y desestructúralas en la firma. Pon primero los datos y después los callbacks.
- Llama `on<Acción>` a las props de tipo callback y `handle<Acción>` a los manejadores internos de un componente.
- Encima de cada función y componente, escribe un comentario de una línea en español que empiece por su nombre, como `// deleteTask elimina una tarea del estado local.`
- Ordena alfabéticamente las props de JSX y las claves de los objetos que devuelven los hooks.
- Las funciones auxiliares de un componente (formateo, etiquetas) van en el mismo archivo, encima del componente; no metas esa lógica en el JSX.
- Indica el tipo de retorno de las funciones auxiliares y de los manejadores; en componentes y hooks se infiere.
- Actualiza el estado de forma inmutable y con la forma funcional (`setTasks((currentTasks) => ...)`).
- Usa `useState` para estado simple y `useReducer` cuando varios campos cambian juntos, como en `useTaskForm`.
- Deriva los datos (lista ordenada, ICE, validez del formulario) en el render o con `useMemo`; no los copies a estado ni los calcules con `useEffect`.
- Los textos de la interfaz y los mensajes para el usuario van en español; los identificadores, en inglés.
- Trata los datos externos como `unknown` y valídalos antes de tiparlos. Usa `as` solo después de validar o para el nodo raíz del DOM.

## Errores y estados de carga

- Los servicios lanzan `AiIceServiceError` con un mensaje listo para mostrar al usuario. No dejes escapar errores técnicos (de red, de `JSON.parse` o de HTTP).
- El hook que llama al servicio expone juntos `loading` y `error: string | null`, limpia `error` al empezar cada petición y cambia cualquier error que no sea `AiIceServiceError` por un mensaje genérico.
- Los componentes muestran la carga con `CircularProgress` y los errores con `Alert`. Si la IA falla, los valores se pueden seguir editando a mano.
- No uses `console.*` para tratar errores.

## Trampas y decisiones poco evidentes

- `VITE_GEMINI_API_KEY` acaba dentro del JavaScript compilado: no publiques un build hecho con una clave real ni pongas otros secretos en variables `VITE_`.
- No hay persistencia: las tareas viven en memoria y se pierden al recargar. Es intencionado (MVP); no añadas `localStorage` ni backend sin que se pida.
- `App` monta `TaskFormDialog` solo mientras está abierto (`isFormOpen && …`) para que `useTaskForm` se reinicie en cada apertura, porque su `useReducer` solo lee la tarea al montarse. No lo sustituyas por un `Dialog` siempre montado con `open={isFormOpen}`.
- En `IceFields`, un `Slider` sin valor muestra el mínimo y no emite `onChange` si se pulsa justo ahí; por eso también escucha `onChangeCommitted`. No quites ninguno de los dos.
- La petición a Gemini fija un `responseSchema` con enteros, pero `parseIceScore` vuelve a validar la respuesta: no quites esa validación.
- Si cambias el prompt de `buildIcePrompt`, mantén `responseSchema` y la validación coherentes con él (mismas claves, enteros de 1 a 10).
- `npm run check` ejecuta `prettier . --check`, que también revisa este archivo y cualquier Markdown nuevo.

## Qué no hacer

- No llames a `fetch` fuera de `src/services/`.
- No añadas dependencias (rutas, estado global, formularios, tests…) sin que se pida: la app se resuelve con React, MUI y `fetch`.
- No crees contexto de React ni estado global: las tareas bajan por props desde `App`.
