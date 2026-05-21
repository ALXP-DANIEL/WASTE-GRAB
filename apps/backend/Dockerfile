FROM docker.io/node:22-alpine AS build

WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV DATABASE_URL=mysql://root:password@localhost:3306/wastegrab
RUN npx nx build backend --configuration=production

FROM docker.io/node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY --from=build /workspace/apps/backend/dist ./

RUN npm --omit=dev --ignore-scripts install

EXPOSE 3000

CMD ["node", "main.js"]
