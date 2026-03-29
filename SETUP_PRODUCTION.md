# 🚀 Configuración de Producción - Vercel + Supabase

Este documento explica cómo configurar las conexiones externas para el entorno de producción.

## 📋 Resumen de URLs de Producción

Tu app está desplegada en Vercel. Para obtener tu URL de producción:

1. Ve a tu [Dashboard de Vercel](https://vercel.com/dashboard)
2. Selecciona el proyecto
3. La URL aparece en la parte superior (ej: `https://tu-proyecto.vercel.app`)

## 🔐 Variables de Entorno en Vercel

Configura estas variables en Vercel Dashboard:
**Project → Settings → Environment Variables**

### Requeridas (ya configuradas)
```
DATABASE_URL=postgresql://postgres.dhwkjjvdennfywazksjl:****@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.dhwkjjvdennfywazksjl:****@aws-0-us-west-2.pooler.supabase.com:5432/postgres
JWT_SECRET=tu-jwt-secret-seguro
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
```

### Conexiones Externas (configurar)
```
# WhatsApp Business API
WHATSAPP_API_TOKEN=EAAxxxx...
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_WEBHOOK_VERIFY_TOKEN=educrm-webhook-secret-2025

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx

# Meta / Facebook
META_CLIENT_ID=1234567890
META_CLIENT_SECRET=a1b2c3d4...

# Google OAuth
GOOGLE_CLIENT_ID=123456-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

---

## 1️⃣ WhatsApp Business API

### Configuración en Meta Developers

1. Ve a https://developers.facebook.com/apps
2. Crea una app de tipo **Business**
3. Agrega el producto **WhatsApp**
4. Obtén credenciales:
   - **Phone Number ID**: En el panel de WhatsApp
   - **Permanent Access Token**:
     - Sistema → Usuarios del sistema → Generar token
     - Permisos requeridos: `whatsapp_business_messaging`, `whatsapp_business_management`

### Webhook de WhatsApp (para mensajes entrantes)

Si quieres recibir mensajes entrantes de WhatsApp:

1. En Meta Developers → WhatsApp → Configuración
2. Webhook URL: `https://TU_PROYECTO.vercel.app/api/webhooks/whatsapp`
3. Token de verificación: `educrm-webhook-secret-2025`

---

## 2️⃣ Meta / Facebook OAuth + Leads Ads

### Configuración de la App

1. Ve a https://developers.facebook.com/apps
2. Tu app debe estar en modo **Live** (no Development)
3. En Configuración → Básica:
   - Agrega tu dominio de Vercel en "App Domains"
   - Copia App ID y App Secret

### URLs de Redirección OAuth

Agrega estas URLs en Configuración → Avanzado → Seguridad → OAuth Redirect URIs:

```
https://TU_PROYECTO.vercel.app/api/auth/meta/callback
```

### Configuración del Webhook

1. Agrega el producto **Webhooks**
2. Suscripción: **página**
3. Configura el webhook:
   - **URL de callback**: `https://TU_PROYECTO.vercel.app/api/webhooks/meta?tenantId=XXX`
   - **Token de verificación**: `educrm-webhook-secret-2025`
   - **Campos de suscripción**: `leadgen`

4. Suscríbete a los webhooks de tu página de Facebook

### Proceso de conexión

1. El usuario (admin del CRM) va a Settings → Integraciones
2. Hace clic en "Conectar con Facebook"
3. Se redirige a Facebook para autorizar
4. Facebook redirige a tu callback URL
5. El token se guarda automáticamente
6. Los leads entrantes se procesan vía webhook

---

## 3️⃣ Google OAuth (Business Profile)

### Configuración en Google Cloud Console

1. Ve a https://console.cloud.google.com/
2. Selecciona tu proyecto
3. Ve a **APIs y servicios → Credenciales**
4. Edita tu OAuth 2.0 Client ID:
   - Agrega URL autorizada de redirección:
     ```
     https://TU_PROYECTO.vercel.app/api/auth/google/callback
     ```
5. Habilita la **Business Profile API** en la biblioteca de APIs

---

## 4️⃣ OpenAI API

1. Ve a https://platform.openai.com/api-keys
2. Crea una nueva clave API
3. Configura el límite de gasto en https://platform.openai.com/settings/limits
4. Agrega la clave a las variables de entorno de Vercel

---

## 🧪 Endpoints de Prueba (Producción)

Una vez desplegado, verifica tus conexiones:

| Endpoint | Descripción |
|----------|-------------|
| `https://TU_PROYECTO.vercel.app/api/test/connections` | Estado de todas las conexiones |
| `https://TU_PROYECTO.vercel.app/api/test/whatsapp` | Verificar WhatsApp API |
| `https://TU_PROYECTO.vercel.app/api/test/ai` | Verificar OpenAI |
| `https://TU_PROYECTO.vercel.app/api/test/meta?tenantId=XXX` | Verificar Meta OAuth |

---

## 🔄 Desplegar Cambios

Para aplicar cualquier cambio:

```bash
# Desde la raíz del proyecto
git add .
git commit -m "Actualizar configuración"
git push

# O si tienes Vercel CLI:
vercel --prod
```

---

## 🚨 Troubleshooting en Producción

### Error: "La integración no está configurada"
- Verifica que las variables estén en Vercel Dashboard
- **Importante**: Después de agregar variables, redeploya el proyecto

### Error: "Redirect URI mismatch"
- Asegúrate de que la URL en Meta/Google coincida exactamente con la de Vercel
- Incluye `https://` y la ruta completa `/api/auth/.../callback`

### Error: "Token exchange failed"
- Para Meta: la app debe estar en modo "Live" (no Development)
- Verifica que el CLIENT_ID y CLIENT_SECRET sean correctos

### Webhook no recibe eventos
- Verifica que la URL del webhook sea accesible públicamente
- Confirma el token de verificación
- Revisa los logs en Vercel Dashboard (Deployments → Logs)

### Base de datos no conecta
- Verifica que la IP de Vercel esté en la whitelist de Supabase
- En Supabase: Project Settings → Database → Network Restrictions
- O desactiva el restriction de IPs para probar

---

## 📞 URLs Importantes para Configuración

| Servicio | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Supabase Dashboard | https://app.supabase.com |
| Meta Developers | https://developers.facebook.com/apps |
| Google Cloud Console | https://console.cloud.google.com |
| OpenAI Platform | https://platform.openai.com |
