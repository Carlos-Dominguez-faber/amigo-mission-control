# PRP-007: Documents

> **Estado**: Reference Documentation
> **Fecha**: 2026-02-19
> **Proyecto**: Amigo Mission Control
> **Prioridad**: Medium

---

## Objetivo

Sistema de gestion de documentos usando Supabase Storage. Permite subir archivos, listarlos en un grid visual, y vincularlos a tareas del PRP-001 (Tasks). Soporta previsualizacion basica y enlaces directos a archivos almacenados.

## Por Que

| Problema | Solucion |
|----------|----------|
| Archivos del proyecto no tienen lugar centralizado | Storage en Supabase con UI de gestion |
| Tareas no pueden referenciar archivos | Vinculacion documento-tarea |

**Valor de negocio**: Centralizacion de archivos del proyecto, trazabilidad entre tareas y sus entregables.

## Que

### Criterios de Exito
- [ ] Grid de tarjetas de documentos
- [ ] Subir archivos a Supabase Storage (bucket `documents`)
- [ ] Cada tarjeta muestra: nombre, tipo, fecha de subida
- [ ] Enlace directo para descargar/ver archivo
- [ ] Eliminar documento (storage + tabla)
- [ ] Vinculacion con tareas (referencia cruzada)
- [ ] Persistencia en Supabase (tabla `documents` + Storage bucket)

### Comportamiento Esperado

1. Usuario ve grid de documentos existentes
2. Boton/zona de upload para subir nuevo archivo
3. Al subir: archivo va a Supabase Storage, metadata a tabla `documents`
4. Cada tarjeta muestra: icono segun tipo, nombre, fecha
5. Click abre/descarga el archivo desde la URL publica
6. Boton eliminar remueve de Storage y de tabla
7. Desde TaskCard (PRP-001), se puede vincular un documento existente

---

## Contexto

### Tipos Definidos (en `src/shared/types/database.ts`)
```typescript
export interface Document {
  id: string;
  name: string;
  type: string;
  content?: string;
  url?: string;
  uploaded_at: string;
}
```

### Arquitectura Propuesta (Feature-First)
```
src/features/documents/
  components/
    DocumentList.tsx        # Grid de tarjetas de documentos
    DocumentCard.tsx        # Tarjeta individual con preview e info
    DocumentUpload.tsx      # Componente de upload (drag & drop o input)
  hooks/
    useDocuments.ts         # Hook CRUD con Supabase (tabla + storage)
  services/
    documentService.ts     # Operaciones Supabase (tabla + storage)
  types/
    index.ts               # Re-export de tipos shared
  utils/
    fileHelpers.ts         # Helpers: icon por tipo, formato de tamano, etc.
```

## Modelo de Datos

### Supabase Table: `documents`

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| id | UUID | gen_random_uuid() | NOT NULL | Primary key |
| name | TEXT | - | NOT NULL | Nombre del archivo |
| type | TEXT | - | NOT NULL | Tipo/mime del archivo |
| content | TEXT | NULL | YES | Contenido texto (si aplica) |
| url | TEXT | NULL | YES | URL publica en Storage |
| uploaded_at | TIMESTAMPTZ | NOW() | NOT NULL | Fecha de subida |

### SQL Migration
```sql
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT,
  url TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents"
  ON documents FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage documents"
  ON documents FOR ALL
  USING (auth.uid() IS NOT NULL);
```

### Supabase Storage: Bucket `documents`

```sql
-- Crear bucket (via Supabase Dashboard o API)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true);

-- Politica de lectura publica
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

-- Politica de escritura para autenticados
CREATE POLICY "Authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
  );

-- Politica de eliminacion para autenticados
CREATE POLICY "Authenticated delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
  );
```

### URL de Acceso a Archivos
```
{SUPABASE_URL}/storage/v1/object/public/documents/{filename}
```

### Vinculacion Documento-Tarea (Tabla Pivote Opcional)
```sql
-- Para vincular documentos a tareas (futuro)
CREATE TABLE IF NOT EXISTS task_documents (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, document_id)
);
```

---

## Blueprint (Assembly Line)

### Fase 1: Storage Setup + Service
**Objetivo**: Configurar bucket `documents` en Supabase, crear `documentService.ts` con upload/download/delete
**Validacion**: Subir y descargar archivo via servicio

### Fase 2: Hook + UI Basica
**Objetivo**: `useDocuments.ts` hook, DocumentList y DocumentCard renderizando
**Validacion**: Lista de documentos visible con datos reales

### Fase 3: Upload Component
**Objetivo**: DocumentUpload con input file y progress feedback
**Validacion**: Subir archivo, ver en lista, descargar

### Fase 4: Vinculacion con Tasks
**Objetivo**: Tabla pivote `task_documents`, UI de linkeo desde TaskCard
**Validacion**: Asociar documento a tarea y verlo desde la tarjeta

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
| Fondo tarjeta | `bg-[#16181a]` |
| Bordes | `border-[#272829]` |
| Nombre archivo | `text-white font-medium text-sm` |
| Tipo archivo | `text-gray-500 text-xs` |
| Fecha | `text-gray-500 text-xs` |
| Zona upload | `border-2 border-dashed border-[#272829] hover:border-purple-500` |
| Boton upload | `bg-purple-600 hover:bg-purple-700` |

### Iconos por Tipo de Archivo
| Tipo | Icono sugerido |
|------|---------------|
| PDF | 📄 (rojo) |
| Imagen (png/jpg/gif) | 🖼️ (verde) |
| Video (mp4/mov) | 🎬 (azul) |
| Texto (txt/md) | 📝 (gris) |
| Codigo (js/ts/py) | 💻 (cyan) |
| Otro | 📎 (gris) |

### Grid Layout
```
Desktop (lg):  4 columnas
Tablet (md):   3 columnas
Mobile (sm):   2 columnas
```

---

## Aprendizajes (Self-Annealing)

> Esta seccion CRECE con cada error encontrado durante la implementacion.

---

## Gotchas

- [ ] Supabase Storage requiere crear el bucket antes de usarlo -- verificar en setup
- [ ] Nombres de archivo pueden tener caracteres especiales -- sanitizar antes de upload
- [ ] Archivos grandes pueden tardar -- mostrar progress bar durante upload
- [ ] `content` solo aplica para archivos de texto -- para binarios, dejar null y usar `url`
- [ ] El bucket debe ser `public: true` para acceso directo sin token
- [ ] Eliminar documento requiere borrar TANTO de Storage como de la tabla `documents`
- [ ] Tamano maximo de archivo depende del plan de Supabase (50MB en free tier)

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan
- NO ignorar errores de TypeScript
- NO hardcodear valores (usar constantes)
- NO omitir validacion Zod en inputs de usuario
- NO subir archivos sin validar tipo y tamano
- NO dejar archivos huerfanos en Storage sin registro en tabla
