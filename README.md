## THE NEXCOM
apps/
│── api/                     # API Gateway (HTTP + WebSocket)
│   ├── controllers/         # Tous les contrôleurs HTTP
│   │   ├── auth.controller.ts  # Gère les requêtes HTTP vers /api/auth/*
│   │   ├── user.controller.ts  # /api/users/*
│   │   ├── account.controller.ts  # /api/accounts/*
│   ├── modules/             # Modules de l'API Gateway
│   │   ├── auth.module.ts    
│   │   ├── user.module.ts    
│   ├── services/            # Services qui utilisent ClientProxy pour interagir avec les microservices
│   │   ├── auth.service.ts  # Service qui envoie les requêtes à apps/services/auth
│   │   ├── user.service.ts  
│   ├── gateway/             # WebSocket Gateway (recommandé)
│   │   ├── chat.gateway.ts   # Pour WebSocket

│   │   ├── notification.gateway.ts   
│── services/                # Tous les microservices indépendants
│   ├── auth/                
│   │   ├── auth.controller.ts  # Gère la logique d'authentification via RMQ
│   │   ├── auth.service.ts  
│   │   ├── auth.module.ts
│   ├── mailing/             
│   ├── accounts/             
│   ├── users/                
libs/
│── shared/                  # Contient les modules réutilisables
│   ├── common/              # Utilitaires et helpers (RabbitMQ, DTOs, decorators, etc.)
│   ├── dto/                 # Tous les DTOs pour la validation
│   ├── interfaces/          # Interfaces partagées entre services
│   ├── guards/              # Tous les guards communs (ex: SessionGuard)
│   ├── interceptors/        # Tous les interceptors
│   ├── pipes/               # Tous les pipes
