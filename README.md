"# todo-app-ecs" 

# To pull base image from registry and take as a dependency
- FROM node:20-alpine AS DEPS

# Alpine-based Node image ke andar OpenSSL (OpenSSL cryptography/SSL/TLS related functionality provide karta hai) aur glibc (Alpine Linux mein glibc compatibility provide karta hai. Alpine normally musl libc use karta hai, jabki bahut saare Linux binaries glibc expect karte hain. So libc6-compat kuch glibc-dependent binaries ko Alpine par run karne mein help karta hai.) compatibility package install karo, aur package cache (Isse image mein unnecessary package-cache data avoid hota hai) ko image mein retain mat karo
RUN apk add --no-cache openssl libc6-compat 

# To copy package.json and package-lock.json to the image
- HOST / BUILD CONTEXT
    - `my-backend/
        ├── package.json ─────────────┐
        ├── package-lock.json ───────┤
        
        ▼
        IMAGE
                         /app/
                         │
                         ├── package.json
                         └── package-lock.json`
- COPY package.json package-lock.json ./

# To install dependencies
- RUN npm ci

# To copy the rest of the application code to the image
COPY . .
