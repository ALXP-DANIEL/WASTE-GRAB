FROM docker.io/node:22-alpine AS build

WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG API_BASE_URL=http://localhost:3000/api
RUN node -e "const fs = require('node:fs'); const path = 'apps/frontend/src/environments/environment.prod.ts'; const source = fs.readFileSync(path, 'utf8'); const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api'; fs.writeFileSync(path, source.replace(\"apiBaseUrl: '/api'\", 'apiBaseUrl: ' + JSON.stringify(apiBaseUrl)))"
ENV API_BASE_URL=${API_BASE_URL}

RUN npx nx build frontend --configuration=production

FROM docker.io/nginx:1.27-alpine AS runtime

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist/apps/frontend/browser /usr/share/nginx/html

EXPOSE 80
