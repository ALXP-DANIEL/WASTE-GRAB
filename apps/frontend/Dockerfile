FROM docker.io/node:22-alpine AS build

WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx nx build frontend --configuration=production

FROM docker.io/nginx:1.27-alpine AS runtime

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist/apps/frontend/browser /usr/share/nginx/html

EXPOSE 80
