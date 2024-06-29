FROM node:20.15.0-alpine

# Expose the environment variable that is needed to provide the TOKEN.
ENV TOKEN="Replace me"

# Create root application folder
WORKDIR /app

# Copy configs to /app folder
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig-build.json ./

# copy source code to /app/src folder
COPY src /app/src

# Install the dependencies and build the application
RUN npm install
RUN npm run build

# Run the application
CMD [ "node", "./build/index.js" ]