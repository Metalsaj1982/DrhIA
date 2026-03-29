# 🔌 Guía de Conexiones Externas - EduCRM

Esta guía explica cómo configurar las integraciones externas del CRM.

---

## 📊 Estado de Conexiones

Verifica el estado de todas las conexiones visitando:
```
http://localhost:3000/api/test/connections
```

---

## 1️⃣ WhatsApp Business API

### ¿Para qué sirve?
- Enviar mensajes de seguimiento a prospectos
- Enviar plantillas de mensajes aprobadas
- Mensajes masivos personalizados (uno por uno)

### Configuración

1. **Crear cuenta de Meta Business:**
   - Ve a https://business.facebook.com
   - Crea o inicia sesión en tu cuenta

2. **Crear App en Meta Developers:**
   - Ve a https://developers.facebook.com/apps
   - Crea una nueva app tipo "Business"

3. **Agregar producto WhatsApp:**
   - En tu app, haz clic en "Agregar producto"
   - Selecciona "WhatsApp"

4. **Obtener credenciales:**
   - En el panel de WhatsApp → API Setup
   - **Phone number ID**: Copia el ID del número
   - **Permanent Access Token**:
     - Ve a Configuración del sistema → Usuarios del sistema
     - Genera un token con permisos: `whatsapp_business_messaging`, `whatsapp_business_management`

5. **Configurar variables:**
```env
WHATSAPP_API_TOKEN="EAAxxxx..."
WHATSAPP_PHONE_NUMBER_ID="1234567890"
```

### Endpoint de prueba
```
GET http://localhost:3000/api/test/whatsapp
```

---

## 2️⃣ OpenAI (GPT-4o-mini)

### ¿Para qué sirve?
- Generar sugerencias de seguimiento para leads
- Crear mensajes personalizados de WhatsApp
- Detectar objeciones y alertar sobre leads fríos
- Asistencia en el chatbot de IA

### Configuración

1. **Crear cuenta en OpenAI:**
   - Ve a https://platform.openai.com/signup

2. **Generar API Key:**
   - Ve a https://platform.openai.com/api-keys
   - Crea una nueva clave

3. **Configurar variable:**
```env
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxx"
```

### Costo
- GPT-4o-mini: ~$0.15 por 1M tokens de entrada
- Un mensaje típico cuesta menos de $0.01

### Endpoint de prueba
```
GET http://localhost:3000/api/test/ai
```

---

## 3️⃣ Meta / Facebook OAuth (Leads Ads)

### ¿Para qué sirve?
- Conectar con formularios de Facebook Lead Ads
- Recibir leads automáticamente en el CRM
- Sincronizar prospectos desde Meta Ads

### Configuración

1. **Crear App en Meta Developers:**
   - Ve a https://developers.facebook.com/apps
   - Crea app tipo "Business" o "Ninguno"

2. **Obtener credenciales:**
   - En Configuración → Básica
   - **App ID** → `META_CLIENT_ID`
   - **App Secret** → `META_CLIENT_SECRET`

3. **Configurar Webhook:**
   - En tu app, agrega el producto "Webhooks"
   - Suscripción: "página"
   - URL de callback: `https://TU_DOMINIO/api/webhooks/meta?tenantId=XXX`
   - Token de verificación: `educrm-webhook-secret-2025` (o el que configures)

4. **Configurar OAuth:**
   - En Configuración → Avanzada → Seguridad
   - Agrega URLs de redirección OAuth válidas:
     - `https://TU_DOMINIO/api/auth/meta/callback`
     - `http://localhost:3000/api/auth/meta/callback` (para desarrollo)

5. **Configurar variables:**
```env
META_CLIENT_ID="1234567890"
META_CLIENT_SECRET="a1b2c3d4..."
```

### Flujo de conexión
1. Usuario hace clic en "Conectar con Meta" en Settings → Integraciones
2. Se redirige a Facebook para autorizar
3. Facebook redirige de vuelta con el token
4. El CRM almacena el token y puede recibir webhooks

### Endpoint de prueba
```
GET http://localhost:3000/api/test/meta?tenantId=XXX
```

---

## 4️⃣ Google OAuth (Business Profile)

### ¿Para qué sirve?
- Integración con Google Business Profile
- Responder reseñas y mensajes de Google Maps

### Configuración

1. **Crear proyecto en Google Cloud:**
   - Ve a https://console.cloud.google.com/
   - Crea un nuevo proyecto

2. **Habilitar APIs:**
   - Ve a APIs y servicios → Biblioteca
   - Busca y habilita "Business Profile API"

3. **Crear credenciales OAuth:**
   - Ve a APIs y servicios → Credenciales
   - Crear credenciales → ID de cliente OAuth 2.0
   - Tipo de aplicación: Web
   - URI de redirección:
     - `https://TU_DOMINIO/api/auth/google/callback`
     - `http://localhost:3000/api/auth/google/callback` (para desarrollo)

4. **Configurar variables:**
```env
GOOGLE_CLIENT_ID="123456-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
```

---

## 🧪 Endpoints de Prueba

| Servicio | URL de prueba |
|----------|---------------|
| Todas las conexiones | `/api/test/connections` |
| WhatsApp | `/api/test/whatsapp` |
| OpenAI | `/api/test/ai` |
| Meta | `/api/test/meta?tenantId=XXX` |

---

## 📝 Archivos de configuración

### `.env` (desarrollo local)
Copia este archivo y renómbralo a `.env.local` para desarrollo local (no se sube a git).

### `.env.local` (producción en Vercel)
Las variables de producción deben configurarse en:
- Vercel Dashboard → Proyecto → Settings → Environment Variables
- O usar `vercel env add` en CLI

---

## 🚨 Solución de problemas

### "La integración no está configurada en el servidor"
- Verifica que las variables estén definidas en `.env.local`
- Reinicia el servidor de desarrollo (`npm run dev`)

### "Token exchange failed"
- Verifica que el `CLIENT_ID` y `CLIENT_SECRET` sean correctos
- Para Meta: asegúrate de que la app esté en modo "Live" (no desarrollo)

### "No se reciben webhooks"
- Verifica que la URL del webhook sea pública (usa ngrok para desarrollo local)
- Confirma el token de verificación
- Revisa los logs del servidor

### "WhatsApp API error"
- El número debe estar verificado en Meta Business
- El token debe tener permisos de `whatsapp_business_messaging`

---

## 🔗 ngrok para desarrollo local

Para recibir webhooks en desarrollo local, usa ngrok:

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto 3000
ngrok http 3000

# Copia la URL HTTPS (ej: https://abc123.ngrok.io)
# Configúrala en Meta Developers como webhook URL
```
