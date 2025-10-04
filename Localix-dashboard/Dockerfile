FROM node:18-slim

WORKDIR /app

# Instalar dependencias del sistema para Electron
RUN apt-get update && apt-get install -y \
    libgtk-3-0 \
    libnotify-dev \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xvfb \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Crear un script de inicio
RUN echo '#!/bin/bash\n\
npm run build:preload\n\
npm run dev\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Exponer el puerto para desarrollo
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["/app/entrypoint.sh"]