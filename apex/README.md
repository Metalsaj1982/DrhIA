# Apex Council v2

Hábitos diarios, una meta de 90 días y un coach con IA para personas y para equipos (redes de mercadeo y equipos de ventas).

## Correr en local

```bash
cd apex
npm install
npm run dev          # http://localhost:5173 (el coach necesita `vercel dev` para /api)
```

## Variables

| Variable | Dónde | Para qué |
|---|---|---|
| `GEMINI_API_KEY` | Vercel, solo servidor | Coach con IA. Nunca con prefijo `VITE_`. |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Vercel | Opcional. Activa Equipos. |
| `ALLOWED_ORIGINS` | Vercel | Opcional. Dominios separados por coma (por defecto apex-council.vercel.app y localhost). |

## Desplegar en el proyecto apex-council de Vercel

1. Vercel → apex-council → Settings → Git: conecta este repo y pon **Root Directory = `apex`**.
2. Settings → Environment Variables: agrega `GEMINI_API_KEY`.
3. Cada push a la rama genera una vista previa; promuévela a producción cuando la apruebes.

## Activar Equipos

1. Reactiva o crea el proyecto en Supabase.
2. SQL Editor → pega y ejecuta `supabase/schema.sql`.
3. Authentication → URL Configuration: agrega tu dominio a Redirect URLs.
4. Agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Vercel y vuelve a desplegar.

## Qué cambió frente a la v1

- El prompt de la IA se arma en el servidor (`api/_mentors.js`); el navegador solo elige un mentor. `/api/chat` solo acepta tu dominio, limita peticiones por IP y no acepta claves ni prompts del cliente.
- Sin cifras inventadas (tasa de aceptación, miembros, lista de espera) ni credenciales que no existen. Los coaches se presentan como IA.
- Sin admin por email: los permisos de equipo los da Supabase con RLS.
- Datos personales en el dispositivo; a la nube solo sube cuántas acciones hizo cada persona por día.

## Pendiente

- Límite de peticiones global con Upstash Redis (el actual es por instancia).
- Cobros (Stripe o Payphone) cuando haya precio validado con líderes.
- Recordatorios por WhatsApp (API oficial de Meta).
