# Seguridad

- Los secretos viven solo en `.env` (ignorado por Git). `.env.example` documenta las variables sin valores reales.
- En producción las variables se configuran en el panel del proveedor (Render, Railway, Fly.io), nunca en el código.
- Cada push pasa por un escaneo de secretos (gitleaks) y GitHub tiene activados *secret scanning* y *push protection*.
- Si subiste una llave por error: **revócala primero** en el servicio que la emitió; borrarla del historial no basta.
- Para reportar una vulnerabilidad, usa *Security → Report a vulnerability* en GitHub en lugar de un issue público.
