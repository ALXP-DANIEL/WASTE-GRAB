FROM docker.io/node:22-alpine AS build

WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG API_BASE_URL=http://localhost:3000/api
ARG APP_BANNER_ENABLED=false
ARG APP_BANNER_LABEL=
RUN node -e "const fs = require('node:fs'); const path = 'apps/frontend/src/environments/environment.prod.ts'; let source = fs.readFileSync(path, 'utf8'); const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api'; const showBanner = process.env.APP_BANNER_ENABLED === 'true'; const bannerLabel = process.env.APP_BANNER_LABEL || ''; source = source.replace(\"apiBaseUrl: '/api'\", 'apiBaseUrl: ' + JSON.stringify(apiBaseUrl)); source = source.replace('showEnvironmentBanner: false', 'showEnvironmentBanner: ' + String(showBanner)); source = source.replace(\"environmentLabel: ''\", 'environmentLabel: ' + JSON.stringify(bannerLabel)); fs.writeFileSync(path, source)"
ENV API_BASE_URL=${API_BASE_URL}
ENV APP_BANNER_ENABLED=${APP_BANNER_ENABLED}
ENV APP_BANNER_LABEL=${APP_BANNER_LABEL}

RUN npx nx build frontend --configuration=production

FROM docker.io/nginx:1.27-alpine AS runtime

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist/apps/frontend/browser /usr/share/nginx/html

EXPOSE 80
