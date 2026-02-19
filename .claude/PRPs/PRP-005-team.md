# PRP-005: Team Directory

> **Estado**: Reference Documentation
> **Fecha**: 2026-02-19
> **Proyecto**: Amigo Mission Control
> **Prioridad**: Low

---

## Objetivo

Directorio de miembros del equipo mostrando avatares (emoji), roles, descripciones y etiquetas de habilidades. Cada miembro tiene un color distintivo y pertenece a una capa organizacional.

## Por Que

| Problema | Solucion |
|----------|----------|
| No hay visibilidad de quien es quien en el equipo | Directorio visual con cards |
| Habilidades del equipo no estan documentadas | Tags de skills por miembro |

**Valor de negocio**: Referencia rapida del equipo humano-IA, visibilidad de capacidades disponibles.

## Que

### Criterios de Exito
- [ ] Grid de tarjetas de miembros del equipo
- [ ] Cada tarjeta muestra: avatar (emoji), nombre, rol, descripcion, skills
- [ ] Skills como badges/tags con estilo consistente
- [ ] Color distintivo por miembro (borde o acento)
- [ ] Agrupacion o indicador de capa organizacional (agent, human, etc.)
- [ ] Persistencia en Supabase

### Comportamiento Esperado

1. Usuario ve grid responsive de tarjetas de miembros
2. Cada tarjeta tiene avatar emoji grande, nombre, rol debajo
3. Descripcion del miembro en texto gris
4. Skills como badges/pills en la parte inferior
5. Color del miembro aplicado como borde izquierdo o fondo de avatar
6. Indicador de capa (agent/human) como badge sutil

---

## Contexto

### Tipos Definidos (en `src/shared/types/database.ts`)
```typescript
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description?: string;
  skills: string[];
  color: string;
  color_hex?: string;
  layer: string;
  avatar: string;
  created_at?: string;
}
```

### Arquitectura Propuesta (Feature-First)
```
src/features/team/
  components/
    TeamGrid.tsx           # Grid layout responsive de member cards
    MemberCard.tsx         # Card individual con avatar, info y skills
  hooks/
    useTeam.ts             # Hook CRUD con Supabase
  services/
    teamService.ts         # Operaciones Supabase
  types/
    index.ts               # Re-export de tipos shared
```

## Modelo de Datos

### Supabase Table: `team_members`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| id | UUID | gen_random_uuid() | NOT NULL | Primary key |
| name | TEXT | - | NOT NULL | Nombre del miembro |
| role | TEXT | - | NOT NULL | Rol/titulo |
| description | TEXT | NULL | YES | Descripcion del miembro |
| skills | TEXT[] | '{}' | NOT NULL | Array de skills/tags |
| color | TEXT | 'blue' | NOT NULL | Nombre del color |
| color_hex | TEXT | '#3b82f6' | YES | Codigo hex del color |
| layer | TEXT | 'agent' | NOT NULL | Capa organizacional |
| avatar | TEXT | - | NOT NULL | Avatar emoji |
| created_at | TIMESTAMPTZ | NOW() | NOT NULL | Fecha de creacion |

### SQL Migration
```sql
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  color TEXT NOT NULL DEFAULT 'blue',
  color_hex TEXT DEFAULT '#3b82f6',
  layer TEXT NOT NULL DEFAULT 'agent',
  avatar TEXT NOT NULL DEFAULT '🤖',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage team members"
  ON team_members FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Index for layer filtering
CREATE INDEX idx_team_members_layer ON team_members(layer);
```

### Capas Organizacionales
| Layer | Descripcion | Ejemplo |
|-------|-------------|---------|
| human | Miembros humanos del equipo | Carlos |
| agent | Agentes de IA | Amigo, otros agentes |
| system | Componentes del sistema | Monitoring, CI/CD |

### Datos Seed (Ejemplo)
```sql
INSERT INTO team_members (name, role, description, skills, color, color_hex, layer, avatar) VALUES
('Carlos', 'Founder & CEO', 'Fundador del proyecto', ARRAY['strategy', 'product', 'design'], 'blue', '#3b82f6', 'human', '👨‍💻'),
('Amigo', 'AI Assistant', 'Agente principal de IA', ARRAY['coding', 'analysis', 'planning'], 'purple', '#7c3aed', 'agent', '🤖');
```

---

## Blueprint (Assembly Line)

### Fase 1: Service + Hook
**Objetivo**: Crear `teamService.ts` y `useTeam.ts` con lectura y CRUD
**Validacion**: Datos de team members cargando desde Supabase

### Fase 2: Componentes UI
**Objetivo**: TeamGrid y MemberCard con layout responsive
**Validacion**: Grid de tarjetas renderizando con avatares, roles y skills

### Fase 3: Validacion Final
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
| Avatar size | `text-4xl` o `text-5xl` (emoji grande) |
| Nombre | `text-white font-semibold text-lg` |
| Rol | `text-gray-400 text-sm` |
| Descripcion | `text-gray-500 text-sm` |
| Skill badge | `bg-white/5 text-gray-300 text-xs px-2 py-0.5 rounded` |
| Layer badge | `text-xs uppercase tracking-wide` |
| Color del miembro | Aplicado como `border-l-4` con `color_hex` |

### Grid Layout
```
Desktop (lg):  3 columnas
Tablet (md):   2 columnas
Mobile (sm):   1 columna
```

---

## Aprendizajes (Self-Annealing)

> Esta seccion CRECE con cada error encontrado durante la implementacion.

---

## Gotchas

- [ ] `skills` es TEXT[] (PostgreSQL array) -- Supabase lo devuelve como array JS nativo
- [ ] `color_hex` puede ser null -- usar fallback basado en `color` name
- [ ] Emojis como avatar pueden renderizarse diferente entre OS -- aceptable
- [ ] Esta feature es mayormente read-only para usuarios normales -- admin puede editar

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan
- NO ignorar errores de TypeScript
- NO hardcodear valores (usar constantes)
- NO omitir validacion Zod en inputs de usuario
