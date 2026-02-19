# PRP-006: Virtual Office

> **Estado**: Reference Documentation
> **Fecha**: 2026-02-19
> **Proyecto**: Amigo Mission Control
> **Prioridad**: Low

---

## Objetivo

Oficina virtual que muestra agentes de IA organizados por zonas (desk, meeting, lobby). Cada agente tiene un estado (executing, planning, idle, reviewing), tarea actual y porcentaje de progreso, simulando un espacio de trabajo donde los agentes estan activos.

## Por Que

| Problema | Solucion |
|----------|----------|
| No se sabe que estan haciendo los agentes de IA | Vista de oficina con estado en tiempo real |
| Falta contexto de actividad de cada agente | Tarea actual + barra de progreso |

**Valor de negocio**: Visibilidad de la actividad del equipo de agentes IA, simulacion de oficina que facilita la gestion de multiples agentes.

## Que

### Criterios de Exito
- [ ] Vista con 3 zonas: Desk, Meeting, Lobby
- [ ] Cada zona contiene agentes asignados a ella
- [ ] Cada agente muestra: avatar, nombre, estado, tarea actual, progreso
- [ ] Estados con indicador visual: executing (verde pulsante), planning (azul), idle (gris), reviewing (amarillo)
- [ ] Barra de progreso cuando `task_progress` tiene valor
- [ ] Canal de comunicacion visible
- [ ] Persistencia en Supabase

### Comportamiento Esperado

1. Usuario ve 3 zonas distribuidas en grid
2. Cada zona tiene header con nombre e icono
3. Dentro de cada zona, cards de agentes
4. Cada agent card muestra:
   - Avatar emoji grande
   - Nombre y rol
   - Badge de estado con color (executing=verde, planning=azul, idle=gris, reviewing=amarillo)
   - Tarea actual (si tiene)
   - Barra de progreso (si `task_progress` no es null)
   - Ultimo tiempo de actividad ("hace X min")
5. Agentes en estado "executing" tienen indicador pulsante
6. Zona "meeting" sugiere que agentes estan colaborando

---

## Contexto

### Tipos Definidos (en `src/shared/types/database.ts`)
```typescript
export interface OfficeAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  color_hex?: string;
  agent_state: string;
  current_task?: string;
  task_progress?: number;
  zone: string;
  channel?: string;
  last_activity?: string;
  updated_at?: string;
}
```

### Arquitectura Propuesta (Feature-First)
```
src/features/office/
  components/
    OfficeView.tsx         # Layout principal con 3 zonas
    ZoneCard.tsx           # Contenedor de zona (desk/meeting/lobby)
    AgentCard.tsx          # Card individual de agente con estado
    ProgressBar.tsx        # Barra de progreso de tarea
    StateBadge.tsx         # Badge de estado (executing/planning/idle/reviewing)
  hooks/
    useOffice.ts           # Hook CRUD con Supabase + posible realtime
  services/
    officeService.ts       # Operaciones Supabase
  types/
    index.ts               # Re-export de tipos shared
```

## Modelo de Datos

### Supabase Table: `office_agents`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| id | TEXT | - | NOT NULL | Primary key (agent identifier) |
| name | TEXT | - | NOT NULL | Nombre del agente |
| role | TEXT | - | NOT NULL | Rol del agente |
| avatar | TEXT | - | NOT NULL | Avatar emoji |
| color | TEXT | 'slate' | NOT NULL | Nombre del color |
| color_hex | TEXT | '#64748b' | YES | Codigo hex del color |
| agent_state | TEXT | 'idle' | NOT NULL | executing, planning, idle, reviewing |
| current_task | TEXT | NULL | YES | Que esta haciendo el agente |
| task_progress | INTEGER | NULL | YES | Progreso 0-100 |
| zone | TEXT | 'desk' | NOT NULL | desk, meeting, lobby |
| last_activity | TIMESTAMPTZ | NULL | YES | Ultima actividad |
| channel | TEXT | NULL | YES | Canal de comunicacion |
| updated_at | TIMESTAMPTZ | NOW() | NOT NULL | Ultima actualizacion |

### SQL Migration
```sql
CREATE TABLE IF NOT EXISTS office_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '🤖',
  color TEXT NOT NULL DEFAULT 'slate',
  color_hex TEXT DEFAULT '#64748b',
  agent_state TEXT NOT NULL DEFAULT 'idle' CHECK (agent_state IN ('executing', 'planning', 'idle', 'reviewing')),
  current_task TEXT,
  task_progress INTEGER CHECK (task_progress IS NULL OR (task_progress >= 0 AND task_progress <= 100)),
  zone TEXT NOT NULL DEFAULT 'desk' CHECK (zone IN ('desk', 'meeting', 'lobby')),
  last_activity TIMESTAMPTZ,
  channel TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE office_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view office agents"
  ON office_agents FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage office agents"
  ON office_agents FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Index for zone filtering
CREATE INDEX idx_office_agents_zone ON office_agents(zone);
CREATE INDEX idx_office_agents_state ON office_agents(agent_state);
```

### Zonas de Oficina
| Zone | Icono | Descripcion |
|------|-------|-------------|
| desk | 🖥️ | Puesto de trabajo individual |
| meeting | 🤝 | Sala de reuniones (colaboracion) |
| lobby | ☕ | Lobby/descanso (idle agents) |

### Estados de Agente
| State | Color | Indicador | Descripcion |
|-------|-------|-----------|-------------|
| executing | Verde `#10b981` | Punto pulsante | Ejecutando tarea activamente |
| planning | Azul `#3b82f6` | Punto estatico | Planificando proximos pasos |
| idle | Gris `#64748b` | Sin punto | Sin tarea asignada |
| reviewing | Amarillo `#eab308` | Punto estatico | Revisando resultado |

### Datos Seed (Ejemplo)
```sql
INSERT INTO office_agents (id, name, role, avatar, color, color_hex, agent_state, current_task, task_progress, zone) VALUES
('amigo', 'Amigo', 'AI Assistant', '🤖', 'purple', '#7c3aed', 'executing', 'Building PRP-001', 75, 'desk'),
('coder', 'Coder', 'Code Generator', '👨‍💻', 'blue', '#3b82f6', 'planning', 'Reviewing architecture', NULL, 'meeting'),
('reviewer', 'Reviewer', 'Code Reviewer', '🔍', 'green', '#10b981', 'idle', NULL, NULL, 'lobby');
```

---

## Blueprint (Assembly Line)

### Fase 1: Service + Hook
**Objetivo**: Crear `officeService.ts` y `useOffice.ts` con lectura y actualizacion
**Validacion**: Datos de agentes cargando desde Supabase

### Fase 2: Componentes UI
**Objetivo**: OfficeView, ZoneCard, AgentCard con layout de zonas
**Validacion**: 3 zonas renderizando con agentes asignados

### Fase 3: Indicadores Visuales
**Objetivo**: StateBadge pulsante, ProgressBar, timestamps relativos
**Validacion**: Estados visualmente distinguibles, progreso animado

### Fase 4: Realtime (Opcional)
**Objetivo**: Supabase Realtime para actualizar estado de agentes en vivo
**Validacion**: Cambios en agent_state se reflejan sin refresh

### Fase 5: Validacion Final
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
| Fondo zona | `bg-[#16181a]` |
| Fondo agent card | `bg-[#1a1c1e]` o `bg-white/5` |
| Bordes | `border-[#272829]` |
| Avatar size | `text-3xl` |
| Nombre agente | `text-white font-medium` |
| Rol agente | `text-gray-400 text-xs` |
| Tarea actual | `text-gray-300 text-sm` |
| Progress bar fondo | `bg-white/10` |
| Progress bar fill | Usa `color_hex` del agente |
| Punto pulsante | `animate-pulse` + color del estado |

### Grid Layout
```
Desktop (lg):  3 columnas (una por zona)
Tablet (md):   2 columnas
Mobile (sm):   1 columna (stacked)
```

---

## Aprendizajes (Self-Annealing)

> Esta seccion CRECE con cada error encontrado durante la implementacion.

---

## Gotchas

- [ ] `id` es TEXT (no UUID) -- permite IDs semanticos como "amigo", "coder"
- [ ] `task_progress` puede ser null -- no mostrar barra de progreso si es null
- [ ] `last_activity` debe formatearse como tiempo relativo ("hace 5 min")
- [ ] Supabase Realtime requiere configuracion adicional en el proyecto
- [ ] Animacion `animate-pulse` solo en estado "executing" -- no en todos

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan
- NO ignorar errores de TypeScript
- NO hardcodear valores (usar constantes)
- NO omitir validacion Zod en inputs de usuario
- NO usar polling excesivo para actualizar estados -- preferir Supabase Realtime
