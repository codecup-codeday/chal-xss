FROM node:alpine3.16

RUN corepack enable

RUN corepack prepare pnpm@7.5.0 --activate

RUN mkdir /www

WORKDIR /www

COPY . .

RUN pnpm install --frozen-lockfile --prod

USER node

CMD [ "node", "src/server.js" ]
