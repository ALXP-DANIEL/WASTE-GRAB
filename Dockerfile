FROM docker.io/node:24-alpine AS workspace

WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

FROM workspace AS backend-build

ARG DATABASE_URL=mysql://wastegrab:wastegrab@database:3306/wastegrab
ENV DATABASE_URL=${DATABASE_URL}

RUN npx nx build backend --configuration=production

FROM docker.io/node:24-alpine AS backend

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY --from=backend-build /workspace/apps/backend/dist ./

RUN node -e "const fs = require('node:fs'); const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); pkg.dependencies = { ...pkg.dependencies, '@prisma/client': '7.8.0' }; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));" \
  && npm --omit=dev --ignore-scripts install

EXPOSE 3000

CMD ["node", "main.js"]

FROM workspace AS frontend-build

ARG API_BASE_URL=http://localhost:3000/api
ARG APP_BANNER_ENABLED=false
ARG APP_BANNER_LABEL=

ENV API_BASE_URL=${API_BASE_URL}
ENV APP_BANNER_ENABLED=${APP_BANNER_ENABLED}
ENV APP_BANNER_LABEL=${APP_BANNER_LABEL}

RUN node -e "const fs = require('node:fs'); const path = 'apps/frontend/src/environments/environment.prod.ts'; let source = fs.readFileSync(path, 'utf8'); const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api'; const showBanner = process.env.APP_BANNER_ENABLED === 'true'; const bannerLabel = process.env.APP_BANNER_LABEL || ''; source = source.replace(\"apiBaseUrl: '/api'\", 'apiBaseUrl: ' + JSON.stringify(apiBaseUrl)); source = source.replace('showEnvironmentBanner: false', 'showEnvironmentBanner: ' + String(showBanner)); source = source.replace(\"environmentLabel: ''\", 'environmentLabel: ' + JSON.stringify(bannerLabel)); fs.writeFileSync(path, source)"

RUN npx nx build frontend --configuration=production

FROM docker.io/nginx:1.27-alpine AS frontend

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /workspace/dist/apps/frontend/browser /usr/share/nginx/html

EXPOSE 80
