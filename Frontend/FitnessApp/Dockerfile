# FROM node:22-alpine AS build

# RUN npm install -g @angular/cli

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN ng build --configuration=production

# FROM nginx:alpine

# COPY --from=build /app/dist/* /usr/share/nginx/html/

# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]





# FROM node:22-alpine

# RUN npm install -g @angular/cli

# WORKDIR /app

# COPY package*.json ./

# RUN npm install
# COPY . .

# EXPOSE 4200

# CMD ["ng", "serve", "--host", "0.0.0.0"]


FROM node:22-alpine
 
WORKDIR /app
 
COPY package*.json ./
RUN npm install 
 
COPY . .
RUN npm run build -- --configuration production --project FitnessApp
 
FROM nginx:alpine
 
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/FitnessApp/browser /usr/share/nginx/html
 
COPY nginx.conf /etc/nginx/conf.d/default.conf
 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]