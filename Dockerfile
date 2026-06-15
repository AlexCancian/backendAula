FROM node:22-alpine
RUN apk add --no-cache git
WORKDIR /app
RUN git clone https://github.com/AlexCancian/backendAula.git .
RUN npm install
RUN npm run build
EXPOSE 3335
CMD ["node","build/server.js"]
