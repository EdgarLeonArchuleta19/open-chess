# OpenChess

> **Ajedrez minimalista, elegante y libre.**  
> Sin cuentas. Sin anuncios. Sin distracciones.

**OpenChess** es una aplicación web progresiva (**PWA**) de ajedrez diseñada con una estética editorial limpia, animaciones fluidas con **Framer Motion**, soporte para **tema oscuro y claro**, y pensada tanto para PC como para celular.

---

## Modos de Juego

1. **Salas con Amigos (Online P2P):** Crea una sala privada en un clic y comparte el código de 6 caracteres o el enlace directo (`?room=XXXXXX`). Funciona punto a punto mediante WebRTC (**PeerJS**), sin requerir registro, cuentas ni servidores propios.
2. **Contra el Bot (4 Niveles de Dificultad):** Juega 100 % offline contra un motor de ajedrez integrado con poda Alpha-Beta y tablas posicionales:
   - **Principiante** (~600 ELO)
   - **Intermedio** (~1100 ELO)
   - **Avanzado** (~1500 ELO)
   - **Maestro** (~1900 ELO)
3. **2 Jugadores Local:** Juega cara a cara en el mismo dispositivo (PC, tablet o celular) con opción de auto-giro del tablero por turno, deshacer/rehacer y tablas por acuerdo.

---

## Características

- **Diseño Minimalista y Tema Dual:** Cambia instantáneamente entre **Modo Oscuro (Obsidian)** y **Modo Claro (Alabaster)**, además de elegir entre 3 paletas sobrias de tablero (*Minimal*, *Nogal*, *Pizarra*).
- **Animaciones Finas:** Piezas que se deslizan suavemente con física de resorte (`Framer Motion`), transiciones fluidas entre vistas, indicadores sutiles de jugadas legales y celebración de jaque mate.
- **PWA Instalable y Offline:** Instalable directamente en Android, iOS, Windows y macOS con Service Worker automático (`vite-plugin-pwa`).
- **Audio Minimalista Sintetizado:** Sonidos táctiles generados con Web Audio API (sin archivos externos y con botón de silencio).
- **100 % Libre:** Sin cuentas, sin rastreadores y sin anuncios.

---

## Cápsula del Tiempo: Easter Egg Original (2019)

Este repositorio conserva intacta en [`mipagina/`](./mipagina/index.html) la primera página web de ajedrez que creé el **25 de febrero de 2019** en el **CETis 107**, sin mover ni alterar una sola línea del código original.

- **Cómo abrirlo:** Haz clic en el icono **`107?`** en la barra superior y responde a la pregunta:
  > *¿Cuál es el mejor profesor del CETis 107??*  
  > Respuesta: **`rochin`**
- Podrás ver la página original de 2019 enmarcada en vivo, revisar su código HTML puro o abrirla en su vista original completa.

---

## Stack Tecnológico

- **React 19** + **TypeScript (modo estricto)**
- **Vite** + **vite-plugin-pwa**
- **Tailwind CSS** (Dark & Light Mode)
- **Framer Motion** + **canvas-confetti**
- **chess.js** (validación FIDE completa)
- **PeerJS** (salas P2P sin backend ni cuentas)
- **Lucide React**
- **Vitest** + **React Testing Library**

---

## Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Ejecutar pruebas automatizadas
npm test

# 4. Compilar versión de producción + PWA
npm run build
```

---

## Licencia

Distribuido bajo la **Licencia de Uso No Comercial con Atribución Obligatoria**. Consulta [LICENSE](./LICENSE) para más detalles.

© 2019–2026 **Edgar Leon Archuleta** ([@EdgarLeonArchuleta19](https://github.com/EdgarLeonArchuleta19)).
