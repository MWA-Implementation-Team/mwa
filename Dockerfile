FROM docker.io/node:24-slim AS build-env
COPY . /app
WORKDIR /app

RUN npm ci --omit=dev
RUN cp -r node_modules/ prod_node_modules/
RUN npm ci
RUN npm run build

FROM gcr.io/distroless/nodejs24-debian13
COPY --from=build-env /app/package.json /app/package.json
COPY --from=build-env /app/dist /app/dist
COPY --from=build-env /app/migrations /app/migrations
COPY --from=build-env /app/prod_node_modules /app/node_modules
COPY --from=build-env /app/static /app/static

WORKDIR /app
CMD ["dist/main.js"]

