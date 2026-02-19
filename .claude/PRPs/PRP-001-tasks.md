# PRP-001: Tasks (Kanban Board)

> **Estado**: Reference Documentation
> **Fecha**: 2026-02-19
> **Proyecto**: Amigo Mission Control
> **Prioridad**: High - Core Feature

---

## Objetivo

Tablero Kanban de gestion de tareas con tres columnas (To Do, In Progress, Done) que permite asignar tareas a Carlos o Amigo, establecer prioridades, vincular documentos y expandir tarjetas para ver detalles completos.

## Por Que

| Problema | Solucion |
|----------|----------|
| No hay visibilidad de tareas pendientes entre humano e IA | Tablero compartido con estado en tiempo real |
| Tareas se pierden en conversaciones | Persistencia en Supabase con fallback localStorage |

**Valor de negocio**: Productividad del equipo humano-IA, trazabilidad de trabajo asignado.

## Que

### Criterios de Exito
- [ ] Tres columnas (To Do, In Progress, Done) con conteo de tareas
- [ ] Crear tarea con titulo, descripcion, prioridad y asignado
- [ ] Cambiar status, prioridad y asignado desde la tarjeta
- [ ] Eliminar tarea con confirmacion
- [ ] Expandir/colapsar tarjeta para ver detalles
- [ ] Vincular documentos desde Supabase Storage
- [ ] Fallback a localStorage cuando Supabase no disponible
- [ ] Sincronizacion automatica cuando reconecta

### Comportamiento Esperado

1. Usuario ve tablero con 3 columnas
2. Formulario en parte superior para crear nueva tarea
3. Cada tarjeta muestra: titulo, badge de prioridad, asignado, enlace a documento
4. Click en tarjeta expande detalles (descripcion, notas)
5. Dropdowns en tarjeta permiten cambiar status/prioridad/asignado
6. Boton X elimina con confirmacion
7. Si Supabase falla, opera desde localStorage y sincroniza al reconectar

---

## Contexto

### Codigo Existente
- `src/features/tasks/types/index.ts` - Re-exporta tipos desde shared
- `src/features/tasks/services/taskService.ts` - CRUD basico con Supabase
- `src/features/tasks/hooks/useTasks.ts` - Hook con localStorage fallback y sync
- `src/shared/types/database.ts` - Interfaces Task, TaskStatus, Assignee, Priority

### Tipos Definidos (en `src/shared/types/database.ts`)
```typescript
export type TaskStatus = "todo" | "in-progress" | "done";
export type Assignee = "carlos" | "amigo";
export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee: Assignee;
  priority: Priority;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

### Arquitectura Propuesta (Feature-First)
```
src/features/tasks/
  components/
    TaskBoard.tsx        # Layout principal kanban (3 columnas)
    TaskCard.tsx          # Tarjeta individual expandible
    TaskForm.tsx          # Formulario de creacion
    TaskColumn.tsx        # Wrapper de columna con header + conteo
  hooks/
    useTasks.ts           # (ya existe) Hook con CRUD y offline fallback
  services/
    taskService.ts        # (ya existe) Operaciones Supabase
  types/
    index.ts              # (ya existe) Re-export de tipos shared
  store/
    taskStore.ts          # (opcional) Zustand store si se necesita estado global
```

## Modelo de Datos

### Supabase Table: `tasks`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| id | UUID | gen_random_uuid() | NOT NULL | Primary key |
| title | TEXT | - | NOT NULL | Titulo de la tarea |
| description | TEXT | NULL | YES | Descripcion opcional |
| status | TEXT | 'todo' | NOT NULL | todo, in-progress, done |
| assignee | TEXT | 'carlos' | NOT NULL | carlos o amigo |
| priority | TEXT | 'medium' | NOT NULL | low, medium, high |
| notes | TEXT | NULL | YES | Notas adicionales |
| created_at | TIMESTAMPTZ | NOW() | NOT NULL | Fecha de creacion |
| updated_at | TIMESTAMPTZ | NOW() | NOT NULL | Ultima actualizacion |

### SQL Migration
```sql
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
  assignee TEXT NOT NULL DEFAULT 'carlos' CHECK (assignee IN ('carlos', 'amigo')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tasks"
  ON tasks FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Index for status filtering
CREATE INDEX idx_tasks_status ON tasks(status);
```

---

## Blueprint (Assembly Line)

### Fase 1: Componentes UI
**Objetivo**: TaskBoard, TaskColumn, TaskCard, TaskForm renderizando con datos mock
**Validacion**: Componentes visibles en dashboard con layout kanban correcto

### Fase 2: Integracion con Hook
**Objetivo**: Conectar componentes al hook `useTasks` existente para CRUD real
**Validacion**: Crear, mover, editar y eliminar tareas persiste en Supabase

### Fase 3: Features Avanzadas
**Objetivo**: Expandir/colapsar tarjetas, vincular documentos, badges de prioridad
**Validacion**: Interacciones completas funcionando

### Fase 4: Validacion Final
**Objetivo**: Sistema funcionando end-to-end
**Validacion**:
- [ ] `npm run typecheck` pasa
- [ ] `npm run build` exitoso
- [ ] Playwright screenshot confirma UI
- [ ] Criterios de exito cumplidos

---

## Design System

| Elemento | Valor |
|----------|-------|
| Fondo principal | `bg-[#0b0c0e]` |
| Fondo tarjeta | `bg-[#16181a]` |
| Bordes | `border-[#272829]` |
| Columna To Do | `#272829` (header) |
| Columna In Progress | `#4c3fff` (header) |
| Columna Done | `#10b981` (header) |
| Prioridad High | `text-red-400` |
| Prioridad Medium | `text-yellow-400` |
| Prioridad Low | `text-zinc-400` |
| Acento principal | `#7c3aed` (purple) |
| Texto primario | `text-white` |
| Texto secundario | `text-gray-400` |

---

## Aprendizajes (Self-Annealing)

> Esta seccion CRECE con cada error encontrado durante la implementacion.

---

## Gotchas

- [ ] El hook `useTasks` usa `persistTasks` que borra TODAS las tareas y las re-inserta -- considerar migracion a operaciones individuales
- [ ] IDs generados como `task-${Date.now()}` en modo offline no son UUIDs validos -- puede causar conflictos al sincronizar
- [ ] localStorage tiene limite de 5-10MB -- suficiente para tareas pero vigilar

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan
- NO ignorar errores de TypeScript
- NO hardcodear valores (usar constantes)
- NO omitir validacion Zod en inputs de usuario
