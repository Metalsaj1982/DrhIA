# 📱 WhatsApp Web Integration - Guía Rápida

## ✨ Nueva Funcionalidad: WhatsApp Web con QR

Hemos agregado soporte para **WhatsApp Web** como alternativa a la API oficial. Esto significa que puedes usar tu número personal de WhatsApp en el CRM simplemente escaneando un código QR.

---

## 🎯 ¿Cómo funciona?

### Modo WhatsApp Web (Recomendado para negocios pequeños)
1. Ve a **Settings → WhatsApp** en el CRM
2. Haz clic en **"Conectar WhatsApp"**
3. Escanea el código QR con tu teléfono
4. ¡Listo! Ya puedes enviar mensajes desde el CRM

### Modo API Oficial (Opcional)
- Requiere credenciales de Meta
- Solo si necesitas funciones avanzadas como plantillas aprobadas
- Configura `WHATSAPP_API_TOKEN` y `WHATSAPP_PHONE_NUMBER_ID` en las variables de entorno

---

## 🔄 Cambios Realizados

### 1. Nuevo Servicio: `src/lib/whatsapp-web.ts`
- Conexión a WhatsApp Web usando `whatsapp-web.js`
- Generación de código QR
- Envío de mensajes
- Recepción de mensajes entrantes

### 2. Nuevo Endpoint: `/api/whatsapp/web`
```
GET  /api/whatsapp/web          # Ver estado de conexión
POST /api/whatsapp/web          # Acciones: connect, disconnect, send
```

### 3. Nuevo Componente: `WhatsAppWebConnector`
- Interfaz de usuario para escanear QR
- Estado de conexión en tiempo real
- Formulario para enviar mensajes de prueba

### 4. Actualización de `src/lib/whatsapp.ts`
- Ahora detecta automáticamente qué modo usar
- Si hay API configurada → usa la API oficial
- Si no → usa WhatsApp Web (si está conectado)

---

## 📦 Dependencias Agregadas

```json
{
  "whatsapp-web.js": "^1.23.0",
  "qrcode": "^1.5.3",
  "puppeteer": "^21.6.1"
}
```

**Nota**: `puppeteer` es pesado porque descarga Chromium. Es necesario para esta funcionalidad.

---

## 🚀 Instalación

```bash
# Instalar nuevas dependencias
npm install

# O si prefieres instalar solo las nuevas:
npm install whatsapp-web.js qrcode puppeteer
```

---

## ⚠️ Consideraciones Importantes

### Limitaciones de WhatsApp Web
1. **Sesión persistente**: La sesión se guarda, pero si reinicias el servidor, puede requerir re-conectar
2. **Un dispositivo**: Solo funciona con el teléfono que escaneó el QR
3. **No usa plantillas**: No puedes usar plantillas aprobadas (solo mensajes de texto)
4. **Términos de servicio**: Meta no aprueba este uso para negocios a gran escala

### Para Producción en Vercel
**⚠️ ADVERTENCIA**: WhatsApp Web requiere un servidor persistente.

Vercel es **serverless**, lo que significa que:
- Las funciones se "duermen" después de un tiempo de inactividad
- Cada solicitud puede ejecutarse en una instancia diferente
- **La sesión de WhatsApp Web se pierde**

**Soluciones recomendadas**:
1. **Railway.app** o **Render.com** - Tienen servidores persistentes
2. **VPS** (DigitalOcean, AWS EC2, etc.) - Control total del servidor
3. **Docker** - Puedes desplegar en cualquier servidor con Docker

### Alternativa para Vercel
Si debes usar Vercel, considera:
- Configurar la **API oficial de WhatsApp Business** (con `WHATSAPP_API_TOKEN`)
- Usar un servicio externo como **Twilio** para WhatsApp
- Mantener un backend separado solo para WhatsApp

---

## 🔧 Configuración Recomendada

Para un negocio pequeño, te recomiendo:

### Opción A: Desarrollo Local (WhatsApp Web)
```bash
# Solo desarrollo local
npm run dev
# Ve a http://localhost:3000/settings → WhatsApp
# Escanea QR
```

### Opción B: Producción con Railway/Render (WhatsApp Web)
```bash
# Desplegar en Railway.app o Render.com (servidor persistente)
# El QR se mantiene activo
```

### Opción C: Producción con Vercel (API Oficial)
```env
# Configura en Vercel:
WHATSAPP_API_TOKEN="EAAxxxx..."
WHATSAPP_PHONE_NUMBER_ID="1234567890"
```

---

## 📞 Flujo de Mensajes

### Enviar mensaje desde el CRM:
1. CRM llama a `sendTextMessage({ to: "0991234567", text: "Hola" })`
2. Si WhatsApp Web está conectado → se envía vía Web
3. Si hay API configurada → se envía vía API
4. Si nada está configurado → mensaje simulado (para testing)

### Recibir mensajes:
1. WhatsApp Web escucha mensajes entrantes
2. Se guardan en la base de datos
3. Aparecen en la sección de Conversaciones del CRM

---

## 🐛 Troubleshooting

### "WhatsApp no está conectado"
- Ve a Settings → WhatsApp
- Haz clic en "Conectar WhatsApp"
- Escanea el QR

### "Error: Protocol error (Runtime.callFunctionOn)"
- WhatsApp Web se desconectó
- Reconecta escaneando el QR nuevamente

### "Error: Evaluation failed"
- WhatsApp cambió su interfaz web
- Actualiza `whatsapp-web.js`: `npm update whatsapp-web.js`

### En Vercel: "Session not found"
- Vercel reinicia las funciones serverless
- Considera usar Railway o la API oficial

---

## 📁 Archivos Creados/Modificados

### Nuevos archivos:
- `src/lib/whatsapp-web.ts` - Servicio de WhatsApp Web
- `src/app/api/whatsapp/web/route.ts` - Endpoint API
- `src/components/whatsapp/WhatsAppWebConnector.tsx` - UI Component

### Archivos modificados:
- `src/lib/whatsapp.ts` - Soporte dual (API + Web)
- `src/components/settings/SettingsClient.tsx` - Agregado componente de WhatsApp Web
- `package.json` - Agregadas dependencias

---

## 🔮 Mejoras Futuras

- [ ] Guardar sesión en base de datos (para Vercel)
- [ ] Reconexión automática
- [ ] Múltiples cuentas de WhatsApp
- [ ] Historial de mensajes sincronizado
- [ ] Respuestas rápidas (templates locales)

---

## 💡 Consejos

1. **Para desarrollo**: Usa WhatsApp Web, es más rápido
2. **Para producción pequeña**: Railway.app (~$5/mes)
3. **Para producción grande**: API oficial de WhatsApp Business
4. **Siempre**: Ten un backup de tu número de WhatsApp
