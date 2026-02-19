# PRP-002: Content Pipeline

> **Estado**: Reference Documentation
> **Fecha**: 2026-02-19
> **Proyecto**: Amigo Mission Control
> **Prioridad**: Medium

---

## Objetivo

Pipeline de creacion de contenido con 6 etapas (Idea, Script, Thumbnail, Filming, Editing, Published) que permite rastrear contenido por plataforma y asignado, moviendo items a traves de las etapas de produccion.

## Por Que

| Problema | Solucion |
|----------|----------|
| Contenido para redes sociales no tiene seguimiento | Pipeline visual con etapas claras |
| No se sabe en que fase esta cada pieza de contenido | Tablero con 6 columnas de estado |

**Valor de negocio**: Visibilidad completa del pipeline de contenido, reduccion de cuellos de botella en produccion.

## Que

### Criterios de Exito
- [ ] 6 etapas visibles: Idea, Script, Thumbnail, Filming, Editing, Published
- [ ] Crear item de contenido con titulo, descripcion, plataforma y asignado
- [ ] Mover item entre etapas
- [ ] Filtrar por plataforma (YouTube, Instagram, TikTok, LinkedIn, Twitter)
- [ ] Mostrar badge de plataforma en cada tarjeta
- [ ] Persistencia en Supabase

### Comportamiento Esperado

1. Usuario ve grid con 6 columnas representando etapas de produccion
2. Formulario para crear nuevo item de contenido
3. Cada tarjeta muestra: titulo, plataforma (badge), asignado
4. Dropdown o accion para mover item a siguiente/anterior etapa
5. Badge de plataforma con icono o color distintivo
6. Conteo de items por etapa en header de columna

---

## Contexto

### Codigo Existente
- `src/features/content/types/index.ts` - Re-exporta tipos desde shared
- `src/shared/types/database.ts` - Interfaces ContentItem, ContentStage, ContentPlatform

### Tipos Definidos (en `src/shared/types/database.ts`)
```typescript
export type ContentStage = "idea" | "script" | "thumbnail" | "filming" | "editing" | "published";
export type ContentPlatform = "youtube" | "instagram" | "tiktok" | "linkedin" | "twitter";

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  stage: ContentStage;
  platform: ContentPlatform;
  assignee: string;
  script?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}
```

### Arquitectura Propuesta (Feature-First)
```
src/features/content/
  components/
    ContentPipeline.tsx    # Layout principal con 6 columnas de etapa
    ContentCard.tsx         # Tarjeta de contenido con plataforma badge
    ContentForm.tsx         # Formulario de creacion
    ContentStageColumn.tsx  # Columna de etapa con header y conteo
  hooks/
    useContent.ts           # Hook CRUD con Supabase
  services/
    contentService.ts       # Operaciones Supabase
  types/
    index.ts                # (ya existe) Re-export de tipos shared
```

## Modelo de Datos

### Supabase Table: `content_items`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| id | UUID | gen_random_uuid() | NOT NULL | Primary key |
| title | TEXT | - | NOT NULL | Titulo del contenido |
| description | TEXT | NULL | YES | Descripcion |
| stage | TEXT | 'idea' | NOT NULL | idea, script, thumbnail, filming, editing, published |
| platform | TEXT | 'youtube' | NOT NULL | youtube, instagram, tiktok, linkedin, twitter |
| assignee | TEXT | 'carlos' | NOT NULL | Quien es responsable |
| script | TEXT | NULL | YES | Contenido del script |
| image_url | TEXT | NULL | YES | URL de thumbnail/imagen |
| created_at | TIMESTAMPTZ | NOW() | NOT NULL | Fecha de creacion |
| updated_at | TIMESTAMPTZ | NOW() | NOT NULL | Ultima actualizacion |

### SQL Migration
```sql
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  stage TEXT NOT NULL DEFAULT 'idea' CHECK (stage IN ('idea', 'script', 'thumbnail', 'filming', 'editing', 'published')),
  platform TEXT NOT NULL DEFAULT 'youtube' CHECK (platform IN ('youtube', 'instagram', 'tiktok', 'linkedin', 'twitter')),
  assignee TEXT NOT NULL DEFAULT 'carlos',
  script TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own content"
  ON content_items FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Index for stage filtering
CREATE INDEX idx_content_items_stage ON content_items(stage);
CREATE INDEX idx_content_items_platform ON content_items(platform);
```

---

## Blueprint (Assembly Line)

### Fase 1: Service + Hook
**Objetivo**: Crear `contentService.ts` y `useContent.ts` con CRUD completo
**Validacion**: Operaciones CRUD funcionando contra Supabase

### Fase 2: Componentes UI
**Objetivo**: ContentPipeline, ContentStageColumn, ContentCard, ContentForm
**Validacion**: Pipeline visual con 6 columnas renderizando datos

### Fase 3: Interacciones
**Objetivo**: Mover items entre etapas, filtrar por plataforma
**Validacion**: Flujo completo de crear -> mover por etapas -> published

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
| YouTube badge | `bg-red-500/20 text-red-400` |
| Instagram badge | `bg-pink-500/20 text-pink-400` |
| TikTok badge | `bg-cyan-500/20 text-cyan-400` |
| LinkedIn badge | `bg-blue-500/20 text-blue-400` |
| Twitter/X badge | `bg-gray-500/20 text-gray-400` |
| Etapa activa | Header con color del stage |

### Colores por Etapa
| Etapa | Color |
|-------|-------|
| Idea | `text-yellow-400` / `bg-yellow-500/10` |
| Script | `text-blue-400` / `bg-blue-500/10` |
| Thumbnail | `text-purple-400` / `bg-purple-500/10` |
| Filming | `text-orange-400` / `bg-orange-500/10` |
| Editing | `text-cyan-400` / `bg-cyan-500/10` |
| Published | `text-green-400` / `bg-green-500/10` |

---

## Aprendizajes (Self-Annealing)

> Esta seccion CRECE con cada error encontrado durante la implementacion.

---

## Gotchas

- [ ] 6 columnas requieren layout responsive -- considerar scroll horizontal en mobile
- [ ] El campo `script` puede contener texto largo -- usar textarea con scroll
- [ ] `image_url` debe validarse como URL valida antes de guardar

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan
- NO ignorar errores de TypeScript
- NO hardcodear valores (usar constantes)
- NO omitir validacion Zod en inputs de usuario
