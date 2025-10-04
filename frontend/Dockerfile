FROM node:20

WORKDIR /app

# Copiar package.json y lock primero
COPY package*.json ./

# Instalar dependencias incluyendo devDependencies (para que se instale vite)
RUN npm install --include=dev

# Copiar el resto del proyecto
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
