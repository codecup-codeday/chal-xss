FROM node:18.6.0-alpine3.16

RUN apk add firefox-esr

RUN corepack enable

RUN install -d -o node /www

USER node

WORKDIR /www

COPY . .

RUN corepack prepare pnpm@7.6.0 --activate

RUN pnpm install --frozen-lockfile --prod

CMD [ "node", "src/server.js" ]
