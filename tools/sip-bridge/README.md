# Puente SIP — respaldo opcional

## Solución principal (ya funciona)

El proveedor **rdx.narayana.im** expone WebRTC nativo:

```
wss://rdx.narayana.im:8089/ws
```

El portal asesores (SIP.js) se conecta **directo** — señalización + audio.  
No hace falta VPS ni FreeSWITCH para la configuración actual.

Variables en Render (ver `CONFIGURAR_LLAMADAS.bat`):

```env
SIP_WSS_URL=wss://rdx.narayana.im:8089/ws
SIP_DOMAIN=rdx.narayana.im
SIP_USERNAME=21011
SIP_PASSWORD=***
SIP_BRIDGE_ENABLED=false
```

## Puente embebido (solo señalización)

`backend` puede reenviar SIP WSS→UDP en `/ws/sip` si pones `SIP_BRIDGE_ENABLED=true`  
y **no** defines `SIP_WSS_URL`. No sustituye audio WebRTC.

## FreeSWITCH en Docker (otro proveedor)

Si en el futuro el proveedor **no** tiene WSS, usa `docker-compose.yml` en esta carpeta  
en un VPS con UDP/RTP abiertos.
