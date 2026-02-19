# PRP-003: Calendar

> **Estado**: Reference Documentation
> **Fecha**: 2026-02-19
> **Proyecto**: Amigo Mission Control
> **Prioridad**: Medium

---

## Objetivo

Calendario semanal que muestra eventos con codificacion por color, soporte para eventos recurrentes (daily, weekly, monthly) y visualizacion de horarios por dia de la semana.

## Por Que

| Problema | Solucion |
|----------|----------|
| No hay visibilidad de agenda semanal | Vista de calendario con 7 dias |
| Eventos recurrentes se pierden | Soporte nativo de recurrencia con intervalo configurable |

**Valor de negocio**: Organizacion temporal del equipo, visibilidad de compromisos recurrentes y puntuales.

## Que

### Criterios de Exito
- [ ] Vista semanal con 7 columnas (Lun-Dom)
- [ ] Eventos mostrados con borde de color a la izquierda
- [ ] Soporte para eventos recurrentes (daily, weekly, monthly)
- [ ] Eventos con `day_of_week = -1` aparecen en TODOS los dias
- [ ] Crear nuevo evento con titulo, hora, dia, color y tipo de recurrencia
- [ ] Eliminar evento
- [ ] Persistencia en Supabase

### Comportamiento Esperado

1. Usuario ve grid semanal con columnas para cada dia
2. Cada columna muestra los eventos de ese dia, ordenados por hora
3. Eventos recurrentes con `day_of_week = -1` aparecen en todas las columnas
4. Cada evento tiene borde de color a la izquierda segun su categoria
5. Click en "+" o formulario para crear nuevo evento
6. Hora se muestra en formato legible junto al titulo
7. Dia actual resaltado visualmente

---

## Contexto

### Tipos Definidos (en `src/shared/types/database.ts`)
```typescript
export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  day_of_week: number;
  color: string;
  is_recurring: boolean;
  interval_type: string;
  created_at?: string;
}
```

### Arquitectura Propuesta (Feature-First)
```
src/features/calendar/
  components/
    CalendarView.tsx       # Grid semanal con 7 columnas
    DayColumn.tsx          # Columna individual de dia
    EventCard.tsx          # Tarjeta de evento con borde de color
    EventForm.tsx          # Formulario crear evento
  hooks/
    useCalendar.ts         # Hook CRUD con Supabase
  services/
    calendarService.ts     # Operaciones Supabase
  types/
    index.ts               # Re-export de tipos shared
  utils/
    calendarHelpers.ts     # Helpers: filtrar por dia, ordenar por hora, etc.
```

## Modelo de Datos

### Supabase Table: `calendar_events`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| id | UUID | gen_random_uuid() | NOT NULL | Primary key |
| title | TEXT | - | NOT NULL | Titulo del evento |
| time | TEXT | - | NOT NULL | Hora del evento (e.g. "09:00") |
| day_of_week | INTEGER | -1 | NOT NULL | 0=Dom, 1=Lun, ..., 6=Sab, -1=todos los dias |
| color | TEXT | 'blue' | NOT NULL | Identificador de color |
| is_recurring | BOOLEAN | true | NOT NULL | Si el evento se repite |
| interval_type | TEXT | 'weekly' | NOT NULL | daily, weekly, monthly |
| created_at | TIMESTAMPTZ | NOW() | NOT NULL | Fecha de creacion |

### SQL Migration
```sql
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  time TEXT NOT NULL,
  day_of_week INTEGER NOT NULL DEFAULT -1,
  color TEXT NOT NULL DEFAULT 'blue',
  is_recurring BOOLEAN NOT NULL DEFAULT true,
  interval_type TEXT NOT NULL DEFAULT 'weekly' CHECK (interval_type IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own events"
  ON calendar_events FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Index for day filtering
CREATE INDEX idx_calendar_events_day ON calendar_events(day_of_week);
```

### Logica de day_of_week
```
-1 = Aparece en TODOS los dias (evento diario)
 0 = Domingo
 1 = Lunes
 2 = Martes
 3 = Miercoles
 4 = Jueves
 5 = Viernes
 6 = Sabado
```

---

## Blueprint (Assembly Line)

### Fase 1: Service + Hook
**Objetivo**: Crear `calendarService.ts` y `useCalendar.ts` con CRUD
**Validacion**: Operaciones CRUD funcionando contra Supabase

### Fase 2: Componentes UI
**Objetivo**: CalendarView, DayColumn, EventCard con grid semanal
**Validacion**: Calendario semanal renderizando con datos mock/reales

### Fase 3: Formulario + Interacciones
**Objetivo**: EventForm para crear eventos, eliminar eventos, resaltar dia actual
**Validacion**: Flujo completo de crear/eliminar eventos

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
| Fondo tarjeta evento | `bg-[#16181a]` |
| Bordes | `border-[#272829]` |
| Dia actual | Fondo mas claro o borde resaltado |
| Texto hora | `text-gray-400 text-sm` |
| Texto titulo | `text-white text-sm font-medium` |

### Colores de Evento (borde izquierdo)
| Color ID | Valor | Uso tipico |
|----------|-------|------------|
| blue | `border-l-blue-400` | Reuniones |
| green | `border-l-green-400` | Ejercicio/Salud |
| purple | `border-l-purple-400` | Trabajo creativo |
| red | `border-l-red-400` | Deadlines |
| yellow | `border-l-yellow-400` | Recordatorios |
| cyan | `border-l-cyan-400` | Aprendizaje |
| orange | `border-l-orange-400` | Social |

---

## Aprendizajes (Self-Annealing)

> Esta seccion CRECE con cada error encontrado durante la implementacion.

---

## Gotchas

- [ ] `day_of_week` usa convencion JavaScript (0=Domingo) -- documentar claramente
- [ ] Eventos con `day_of_week = -1` deben duplicarse visualmente en TODAS las columnas
- [ ] El campo `time` es TEXT, no TIME -- validar formato "HH:MM" con Zod
- [ ] En mobile, 7 columnas no caben -- considerar vista de dia unico o scroll horizontal

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan
- NO ignorar errores de TypeScript
- NO hardcodear valores (usar constantes)
- NO omitir validacion Zod en inputs de usuario
