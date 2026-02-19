# PRP-004: Memory

> **Estado**: Reference Documentation
> **Fecha**: 2026-02-19
> **Proyecto**: Amigo Mission Control
> **Prioridad**: Low

---

## Objetivo

Sistema de memoria persistente para almacenar interacciones con IA, decisiones importantes e informacion clave, categorizadas por tipo y mostradas cronologicamente.

## Por Que

| Problema | Solucion |
|----------|----------|
| Contexto de IA se pierde entre sesiones | Memorias persistentes en Supabase |
| No hay registro de decisiones importantes | Categorizacion y busqueda de memorias |

**Valor de negocio**: Continuidad de contexto entre sesiones de IA, base de conocimiento acumulativa del proyecto.

## Que

### Criterios de Exito
- [ ] Lista cronologica de memorias (mas recientes primero)
- [ ] Cada memoria muestra titulo, contenido, tipo y fecha
- [ ] Badge de tipo de memoria para categorizacion visual
- [ ] Crear nueva memoria con titulo, contenido y tipo
- [ ] Eliminar memoria
- [ ] Persistencia en Supabase

### Comportamiento Esperado

1. Usuario ve lista vertical de memorias ordenadas por fecha (mas reciente primero)
2. Cada tarjeta muestra: titulo, badge de tipo, fecha formateada, preview de contenido
3. Click en memoria expande para ver contenido completo
4. Formulario para crear nueva memoria con titulo, contenido (textarea) y tipo
5. Boton de eliminar en cada memoria

---

## Contexto

### Tipos Definidos (en `src/shared/types/database.ts`)
```typescript
export interface Memory {
  id: string;
  title: string;
  content: string;
  memory_type: string;
  timestamp: string;
}
```

### Arquitectura Propuesta (Feature-First)
```
src/features/memory/
  components/
    MemoryList.tsx         # Lista cronologica de memorias
    MemoryCard.tsx         # Tarjeta individual con tipo badge y fecha
    MemoryForm.tsx         # Formulario crear memoria
  hooks/
    useMemories.ts         # Hook CRUD con Supabase
  services/
    memoryService.ts       # Operaciones Supabase
  types/
    index.ts               # Re-export de tipos shared
```

## Modelo de Datos

### Supabase Table: `memories`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| id | UUID | gen_random_uuid() | NOT NULL | Primary key |
| title | TEXT | - | NOT NULL | Titulo de la memoria |
| content | TEXT | - | NOT NULL | Contenido completo |
| memory_type | TEXT | 'daily' | NOT NULL | Tipo/categoria de memoria |
| timestamp | TIMESTAMPTZ | NOW() | NOT NULL | Cuando se creo |

### SQL Migration
```sql
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  memory_type TEXT NOT NULL DEFAULT 'daily',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own memories"
  ON memories FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Index for chronological listing
CREATE INDEX idx_memories_timestamp ON memories(timestamp DESC);
```

### Tipos de Memoria Sugeridos
| Tipo | Descripcion | Badge Color |
|------|-------------|-------------|
| daily | Resumen diario | `bg-blue-500/20 text-blue-400` |
| decision | Decision importante | `bg-purple-500/20 text-purple-400` |
| learning | Aprendizaje/insight | `bg-green-500/20 text-green-400` |
| context | Contexto de proyecto | `bg-yellow-500/20 text-yellow-400` |
| error | Error/issue documentado | `bg-red-500/20 text-red-400` |
| idea | Idea para explorar | `bg-cyan-500/20 text-cyan-400` |

> Nota: `memory_type` es TEXT libre, no enum. Los tipos anteriores son sugerencias para UI pero el usuario puede crear cualquier tipo.

---

## Blueprint (Assembly Line)

### Fase 1: Service + Hook
**Objetivo**: Crear `memoryService.ts` y `useMemories.ts` con CRUD
**Validacion**: Operaciones CRUD funcionando contra Supabase

### Fase 2: Componentes UI
**Objetivo**: MemoryList, MemoryCard, MemoryForm
**Validacion**: Lista de memorias renderizando con datos reales

### Fase 3: Expand/Collapse + Tipo Badge
**Objetivo**: Expandir memorias largas, badges de tipo con color
**Validacion**: Interaccion completa de crear/ver/eliminar memorias

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
| Texto titulo | `text-white font-medium` |
| Texto contenido | `text-gray-300 text-sm` |
| Texto fecha | `text-gray-500 text-xs` |
| Preview contenido | Truncado a 2-3 lineas, expandible |

---

## Aprendizajes (Self-Annealing)

> Esta seccion CRECE con cada error encontrado durante la implementacion.

---

## Gotchas

- [ ] `memory_type` es TEXT libre, no enum -- UI debe manejar tipos desconocidos gracefully
- [ ] `content` puede ser muy largo -- truncar en vista lista, mostrar completo al expandir
- [ ] Timestamp debe formatearse relativo ("hace 2 horas") y absoluto ("2026-02-19 14:30")

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan
- NO ignorar errores de TypeScript
- NO hardcodear valores (usar constantes)
- NO omitir validacion Zod en inputs de usuario
