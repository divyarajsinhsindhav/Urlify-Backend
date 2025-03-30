FROM node:23.10.0

# Create app directory
WORKDIR /app

COPY package.json ./

RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "start"]