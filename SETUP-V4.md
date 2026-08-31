# V5 COMPATIBLE — Carlos Fernando Poma

Esta edición mantiene las fotos y la música originales dentro de index.html en Base64. No existe carpeta assets/media para estos contenidos y no debes crearla.

## Google Sheets
1. Crea un Google Sheet privado.
2. Abre Extensiones > Apps Script.
3. Pega Code.gs.
4. Despliega como Aplicación web, ejecutando como tu cuenta y con acceso "Cualquier persona".
5. Copia la URL terminada en /exec.
6. En index.html busca: const RSVP_ENDPOINT = '';
7. Pega allí la URL /exec.

## Publicación
Publica index.html junto con assets/og-whatsapp.jpg, favicon.ico, favicon-32.png, apple-touch-icon.png y robots.txt. Las fotos y la música ya están dentro del HTML, por lo que no dependen de rutas externas.

## Privacidad
La página usa meta noindex/nofollow/noarchive. Esto reduce su aparición en buscadores, pero una URL pública puede abrirla cualquiera que la conozca.
