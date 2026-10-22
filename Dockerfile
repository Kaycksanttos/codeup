FROM node:20-alpine
# python3 + pandas: o servidor corrige as atividades de Python rodando o código do aluno em ambiente restrito
RUN apk add --no-cache python3 py3-pandas
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p /data && chown -R node:node /data /app
ENV NODE_ENV=production DATA_FILE=/data/data.json
USER node
VOLUME /data
EXPOSE 3000
# a porta vem da variável PORT (o Render define a dele); sem ela o app usa 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:${PORT:-3000}/health || exit 1
CMD ["node", "server.js"]
