# Knowledge Base MVP para análisis de recibos (Argentina)

## 1) Estructura de la knowledge base

### Unidad de información (bloque)
Cada fila de la base debe representar **UNA regla utilizable** por la IA, no un texto largo.

**Regla de oro:** “1 bloque = 1 decisión o cálculo”.

Ejemplos de bloque:
- `Jubilación empleado: 11% sobre remuneración imponible`.
- `Presentismo CCT 130/75: condicional según asistencia del período`.
- `Horas extra 50%: valor hora normal x 1.5`.

### Plantilla obligatoria de bloque
- **titulo**: corto, único y buscable.
- **contenido**: máximo 500–900 caracteres (ideal 300–700).
- **categoria**: `descuento`, `aporte`, `convenio`, `interpretacion`, `calculo`, `tope`, `definicion`.
- **tags**: arreglo de palabras clave (`["jubilacion","ley_24241","empleado"]`).
- **prioridad**: 1–5 para rankeo.
- **vigencia_desde / vigencia_hasta**: control temporal.
- **jurisdiccion**: `AR` / `AR-BA` / etc.
- **fuente_url**: link legal/documental.

### Tamaño recomendado
- **contenido**: 300–700 caracteres (máximo 900).
- **si supera 900**: dividir en sub-reglas.
- **si hay fórmulas + excepciones**: usar 2 bloques separados:
  1. regla general
  2. excepciones

### Cómo evitar texto largo inútil
- Prohibir copiar artículos completos de ley.
- Extraer solo: “qué aplica”, “cómo se calcula”, “a quién aplica”, “excepciones”.
- Agregar siempre “campo de aplicabilidad” (ej. “solo CCT 130/75”).
- Si un bloque no cambia respuesta de negocio, no se guarda.

---

## 2) Modelo de datos (Supabase)

### Tabla principal: `knowledge_rules`

| Columna | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| `id` | `uuid` PK default `gen_random_uuid()` | ID técnico | `7f77...` |
| `titulo` | `text` not null | Nombre de regla | `Aporte jubilación empleado 11%` |
| `contenido` | `text` not null | Regla atómica en lenguaje claro | `Se descuenta 11% sobre remuneración imponible...` |
| `categoria` | `text` not null check | Tipo de regla | `descuento` |
| `subcategoria` | `text` null | Mayor detalle | `jubilacion` |
| `convenio_codigo` | `text` null | CCT/estatuto aplicable | `CCT_130_75` |
| `jurisdiccion` | `text` not null default `'AR'` | Ámbito | `AR` |
| `tags` | `text[]` not null default `'{}'` | Keywords para búsqueda | `{jubilacion,ley_24241,empleado}` |
| `formula` | `text` null | Fórmula corta utilizable | `descuento = base_imponible * 0.11` |
| `valor_tipo` | `text` null check | `%`, `monto_fijo`, `rango`, `condicional` | `porcentaje` |
| `valor_num` | `numeric(10,4)` null | Valor numérico | `11.0000` |
| `unidad` | `text` null | `%`, `ARS` | `%` |
| `condiciones` | `jsonb` null | Condiciones aplicabilidad | `{"base":"remunerativa"}` |
| `ejemplo_calculo` | `text` null | Ejemplo simple | `Base 100000 => 11000` |
| `interpretacion` | `text` null | Aclaración experta | `No aplica sobre conceptos no remunerativos...` |
| `fuente_tipo` | `text` null | ley/decreto/cct/doctrina | `ley` |
| `fuente_referencia` | `text` null | Norma exacta | `Ley 24.241 art. ...` |
| `fuente_url` | `text` null | URL verificable | `https://...` |
| `vigencia_desde` | `date` not null | Inicio vigencia | `2024-01-01` |
| `vigencia_hasta` | `date` null | Fin vigencia | `null` |
| `estado` | `text` not null default `'vigente'` | vigente/derogada/borrador | `vigente` |
| `prioridad` | `smallint` not null default 3 | Ranking de confianza/relevancia | `5` |
| `hash_contenido` | `text` not null | Para deduplicación | `sha256(...)` |
| `origen_documento` | `text` null | Notion page / doc origen | `Notion: Convenio Comercio` |
| `created_at` | `timestamptz` default `now()` | Auditoría | `2026-04-16...` |
| `updated_at` | `timestamptz` default `now()` | Auditoría | `2026-04-16...` |

### SQL listo para crear tabla

```sql
create table if not exists public.knowledge_rules (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  contenido text not null,
  categoria text not null check (categoria in (
    'descuento','aporte','convenio','interpretacion','calculo','tope','definicion'
  )),
  subcategoria text,
  convenio_codigo text,
  jurisdiccion text not null default 'AR',
  tags text[] not null default '{}',
  formula text,
  valor_tipo text check (valor_tipo in ('porcentaje','monto_fijo','rango','condicional')),
  valor_num numeric(10,4),
  unidad text,
  condiciones jsonb,
  ejemplo_calculo text,
  interpretacion text,
  fuente_tipo text,
  fuente_referencia text,
  fuente_url text,
  vigencia_desde date not null,
  vigencia_hasta date,
  estado text not null default 'vigente' check (estado in ('vigente','derogada','borrador')),
  prioridad smallint not null default 3 check (prioridad between 1 and 5),
  hash_contenido text not null,
  origen_documento text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ux_knowledge_rules_hash on public.knowledge_rules(hash_contenido);
create index if not exists ix_knowledge_rules_categoria on public.knowledge_rules(categoria);
create index if not exists ix_knowledge_rules_convenio on public.knowledge_rules(convenio_codigo);
create index if not exists ix_knowledge_rules_tags_gin on public.knowledge_rules using gin (tags);
create index if not exists ix_knowledge_rules_busqueda on public.knowledge_rules using gin (to_tsvector('spanish', titulo || ' ' || contenido));
```

---

## 3) 10 ejemplos reales listos para insertar

```json
[
  {
    "titulo": "Descuento jubilación SIPA 11%",
    "contenido": "Al trabajador en relación de dependencia se le descuenta 11% sobre remuneración imponible con destino al SIPA.",
    "categoria": "descuento",
    "tags": ["jubilacion", "sipa", "ley_24241", "empleado"]
  },
  {
    "titulo": "Descuento Ley 19.032 INSSJP 3%",
    "contenido": "Corresponde descuento del 3% sobre remuneración imponible para INSSJP (PAMI), salvo regímenes específicos con tratamiento distinto.",
    "categoria": "descuento",
    "tags": ["inssjp", "pami", "ley_19032", "descuento"]
  },
  {
    "titulo": "Descuento obra social 3% trabajador",
    "contenido": "Se descuenta 3% al trabajador sobre base sujeta a obra social, con destino a la obra social correspondiente.",
    "categoria": "descuento",
    "tags": ["obra_social", "descuento", "empleado", "salud"]
  },
  {
    "titulo": "Contribución patronal obra social 6%",
    "contenido": "El empleador aporta 6% sobre la base de obra social como contribución patronal.",
    "categoria": "aporte",
    "tags": ["aporte_patronal", "obra_social", "6_por_ciento", "empleador"]
  },
  {
    "titulo": "Contribución patronal SIPA",
    "contenido": "La contribución patronal al SIPA depende del encuadre y alícuota vigente del empleador según normativa aplicable.",
    "categoria": "aporte",
    "tags": ["sipa", "aporte_patronal", "alicuota", "empleador"]
  },
  {
    "titulo": "CCT 130/75 Empleados de Comercio - presentismo",
    "contenido": "El adicional por asistencia y puntualidad en CCT 130/75 se calcula conforme reglas del convenio y depende de inasistencias del período.",
    "categoria": "convenio",
    "tags": ["cct_130_75", "comercio", "presentismo", "adicional"]
  },
  {
    "titulo": "Horas extra al 50% en día hábil",
    "contenido": "Las horas extra en días hábiles se liquidan con recargo del 50% sobre el valor hora normal.",
    "categoria": "calculo",
    "tags": ["horas_extra", "50_por_ciento", "recargo", "liquidacion"]
  },
  {
    "titulo": "Horas extra al 100% sábados después de 13 y feriados",
    "contenido": "Corresponde recargo del 100% para horas extra en sábados después de las 13, domingos y feriados.",
    "categoria": "calculo",
    "tags": ["horas_extra", "100_por_ciento", "feriados", "domingos"]
  },
  {
    "titulo": "Interpretación: concepto no remunerativo",
    "contenido": "Si un concepto es no remunerativo, en principio no integra base previsional salvo disposición expresa en norma o acuerdo homologado.",
    "categoria": "interpretacion",
    "tags": ["no_remunerativo", "base_imponible", "interpretacion", "previsional"]
  },
  {
    "titulo": "Tope de base imponible previsional",
    "contenido": "La base imponible para aportes y contribuciones previsionales puede estar alcanzada por topes mínimos/máximos según período vigente.",
    "categoria": "tope",
    "tags": ["tope", "base_imponible", "previsional", "periodo"]
  }
]
```

---

## 4) Flujo de uso en el sistema (paso a paso)

1. **Parsear consulta del usuario**
   - Extraer: convenio, concepto, período, tipo de cálculo.
   - Ejemplo: “¿Está bien descontado jubilación y obra social en abril 2026 para comercio?”

2. **Búsqueda inicial en DB** (MVP sin embeddings)
   - filtro por `categoria IN ('descuento','convenio','interpretacion')`
   - `tags && array[...]`
   - keyword en `titulo/contenido` con `to_tsvector`.

3. **Rankeo interno**
   - puntaje = coincidencia tags + coincidencia keyword + prioridad + vigencia.
   - descartar reglas no vigentes (`vigencia_hasta < fecha_consulta`).

4. **Selección final de contexto**
   - enviar **5 a 8 bloques** por consulta normal.
   - consultas complejas (varios conceptos/convenios): **8 a 12 bloques**.
   - nunca mandar >12 en MVP para evitar ruido/costo.

5. **Construcción del prompt**
   - System: rol + formato de salida.
   - Contexto: bloques seleccionados (JSON compacto).
   - User: pregunta + datos del recibo detectados.

6. **Respuesta + trazabilidad**
   - devolver respuesta y `fuentes_usadas` (ids/títulos).

---

## 5) Estrategia inicial (MVP) sin embeddings

### Consulta SQL sugerida

```sql
select *
from public.knowledge_rules
where estado = 'vigente'
  and (vigencia_hasta is null or vigencia_hasta >= current_date)
  and (
    categoria = any($1::text[])
    or tags && $2::text[]
    or to_tsvector('spanish', coalesce(titulo,'') || ' ' || coalesce(contenido,'')) @@ plainto_tsquery('spanish', $3)
  )
order by prioridad desc, vigencia_desde desc
limit 30;
```

### Selección para enviar al modelo
- Traer 30 candidatos.
- Re-rankear en backend con score simple.
- Enviar top 5–8 (o 8–12 si es complejo).
- Si no hay match fuerte: fallback a reglas generales (`categoria='definicion'` + `interpretacion`).

---

## 6) Escalabilidad futura a embeddings

### Evolución recomendada
1. Agregar columna `embedding vector(1536)` (o dimensión del modelo elegido).
2. Crear índice `ivfflat`/`hnsw` (según extensión disponible).
3. Pipeline de actualización al insertar/editar reglas.
4. Búsqueda híbrida: `keyword score + vector score + prioridad`.

### Cuándo vale la pena
- >3.000 reglas activas.
- búsquedas con lenguaje ambiguo o muy variable.
- necesidad de recuperar criterios interpretativos no coincidentes por keywords literales.

---

## 7) Buenas prácticas operativas

### Mantenimiento
- revisión normativa semanal/quincenal.
- tabla de cambios con fecha de vigencia real.
- cualquier cambio normativo: **nueva versión de regla**, no overwrite silencioso.

### Evitar duplicados
- `hash_contenido` único.
- regla adicional: `unique(titulo, convenio_codigo, vigencia_desde)` si aplica.
- proceso de alta que sugiera posibles duplicados por similitud de título.

### Mejora continua de calidad
- guardar feedback de respuestas (correcta/incorrecta).
- medir cobertura: % consultas respondidas con fuentes claras.
- top consultas fallidas -> crear nuevas reglas específicas.
- auditoría mensual de reglas más usadas y reglas nunca usadas.

---

## Checklist de implementación inmediata (1 semana)

1. Crear tabla `knowledge_rules` + índices.
2. Exportar Notion y convertir a bloques atómicos (máx. 900 chars).
3. Cargar 100–300 reglas iniciales críticas.
4. Implementar endpoint `/api/knowledge/search` (keyword + tags + categoría).
5. Integrar selección top 5–8 en prompt de análisis de recibos.
6. Guardar `sources_used` en cada respuesta para trazabilidad.
