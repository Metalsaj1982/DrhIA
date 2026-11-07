# Poner Apex Council v2 en línea sin sustos en la factura

Tiempo: unos 40 minutos. Necesitas tu sesión iniciada en Vercel, GitHub y Google.
El código ya está listo en la rama `claude/micro-apps-strategy-rprvcz`, carpeta `apex/`.

> **Para Antigravity:** el agente puede guiarte, pero los pasos 1 a 6 se hacen en páginas web con tu sesión iniciada, no en el código. Si Antigravity tiene navegador, pídele: "Abre cada enlace de PASOS.md y guíame paso a paso; no pegues claves en el chat ni en archivos del repo".

## 1. Revocar el token que se compartió en el chat (2 min)

1. Abre https://vercel.com/account/settings/tokens
2. Borra el token que empieza con `vcp_7Gxy`.
3. Si necesitas desplegar desde la terminal, usa `npx vercel login` en vez de un token pegado.

## 2. Clave de Gemini (5 min)

1. Abre https://aistudio.google.com/apikey y crea una clave nueva. No reutilices la anterior si estuvo en un `.env` subido a Vercel.
2. Cópiala. No la pegues en ningún chat.

## 3. Tope en Google: la protección que no depende del código (10 min)

1. Abre https://console.cloud.google.com y elige el proyecto de esa clave (AI Studio lo muestra junto a la clave).
2. Menú → APIs y servicios → **Generative Language API** → pestaña **Cuotas y límites del sistema**.
3. Busca "requests per day", marca la fila → **Editar** → pon **3000** → Guardar.
4. Menú → Facturación → **Presupuestos y alertas** → Crear presupuesto:
   - Monto: **$30 al mes**.
   - Alertas al 50%, 90% y 100%, a tu correo.

El presupuesto solo avisa; la cuota del paso 3 es la que corta.

## 4. Conectar Vercel al código nuevo (10 min)

1. Abre https://vercel.com/metalsaj1982s-projects/apex-council/settings/git
2. **Connect Git Repository** → GitHub → `metalsaj1982/DrhIA`.
3. Settings → **Build and Deployment**:
   - Root Directory: `apex`
   - Framework Preset: Vite
4. Desde ahora despliega desde GitHub, no desde la carpeta de tu Mac (esa carpeta no tiene `apex/` y fallaría).

## 5. Variables y base de topes (10 min)

1. Settings → **Environment Variables** → agrega `GEMINI_API_KEY` con la clave del paso 2 (Production y Preview).
2. Pestaña **Storage** del proyecto → **Create Database** → **Upstash for Redis** → plan **Free** → conéctala a apex-council.
   Vercel agrega solas `KV_REST_API_URL` y `KV_REST_API_TOKEN`. Con eso, el tope de 10 mensajes por teléfono al día queda exacto.
3. Opcional, para cambiar topes sin tocar código: `DAILY_LIMIT_DEVICE` (10), `DAILY_LIMIT_IP` (40), `DAILY_LIMIT_GLOBAL` (3000).

## 6. Probar y publicar (5 min)

1. Pestaña **Deployments** → abre el despliegue de la rama `claude/micro-apps-strategy-rprvcz` (es una vista previa, no toca producción).
2. Prueba: crea tu meta, marca hábitos, pide el mensaje de ILLARI, escribe al Coach.
3. Si todo funciona: en ese despliegue → menú **⋯** → **Promote to Production**.

## 7. Cuando empieces a cobrar

1. Vercel → Settings → Billing → cambia a **Pro** ($20/mes): el plan gratis no permite uso comercial.
2. Billing → **Spend Management** → límite de **$40** con la opción de pausar proyectos al llegar.

## Cuánto deberías pagar

| Usuarios activos | Vercel | Gemini (Flash-Lite) | Upstash | Total aproximado |
|---|---|---|---|---|
| 100 | $0 (o $20 en Pro) | ~$5 | $0 | $5–25 |
| 1.000 | $20 | ~$45 | $0 | ~$65 |

Con el tope global de 3000 mensajes al día, el máximo de Gemini es de unos $30 al mes aunque alguien abuse, si responde Flash-Lite. Si Flash-Lite falla seguido y entra el respaldo (Flash), puede llegar a unos $120: la alerta del paso 3 te avisaría antes.
