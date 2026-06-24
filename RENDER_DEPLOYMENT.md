# 🚀 Déploiement OpenWA sur Render

Guide complet pour déployer l'API WhatsApp sur Render.

## 📋 Prérequis

- Compte GitHub avec le repo OpenWA
- Compte [Render.com](https://render.com)
- Node.js 22+ (géré par Render)

## 🔧 Configuration du déploiement

### Étape 1 : Connecter votre repo GitHub

1. Allez sur [render.com/dashboard](https://render.com/dashboard)
2. Cliquez sur **"New +"** → **"Web Service"**
3. Sélectionnez **"Deploy an existing repository"**
4. Connectez votre compte GitHub
5. Sélectionnez le repo **`whatsapp-API`**

### Étape 2 : Configurer le Web Service

Dans la création du Web Service, remplissez :

| Paramètre | Valeur |
|-----------|--------|
| **Name** | `openwa-api` |
| **Environment** | `Node` |
| **Region** | `Ohio` (ou votre région) |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `node dist/main.js` |
| **Instance Type** | `Standard` (2 vCPU, 4GB RAM) |
| **Auto-deploy** | ✅ Activé |

### Étape 3 : Créer les services additionnels

#### 🗄️ PostgreSQL Database
1. **New +** → **PostgreSQL**
   - Name: `openwa-db`
   - Region: `Ohio` (même que le Web Service)
   - Version: `15` ou plus
   - Plan: `Standard`

2. Après création, Render créera automatiquement une variable d'env `DATABASE_URL`

#### ⚡ Redis Cache
1. **New +** → **Redis**
   - Name: `openwa-redis`
   - Region: `Ohio`
   - Plan: `Standard`
   - Eviction Policy: `allkeys-lru`

2. Render créera automatiquement `REDIS_URL`

### Étape 4 : Variables d'environnement

Dans les paramètres du Web Service, ajoutez ces variables :

```env
NODE_ENV=production
LOG_LEVEL=info
PORT=2785

# Database (auto-linkée)
DATABASE_TYPE=postgres
DATABASE_SYNCHRONIZE=false

# Cache (auto-linkée)
REDIS_DB=0

# Engine WhatsApp
ENGINE_TYPE=whatsapp-web.js
SESSION_DATA_PATH=/app/data/sessions
PUPPETEER_HEADLESS=true
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu

# Storage
STORAGE_TYPE=local
STORAGE_PATH=/app/data/media

# API
API_PORT=2785
CORS_ORIGINS=*
RATE_LIMIT_MAX=100

# Dashboard
DASHBOARD_ENABLED=true
DASHBOARD_PORT=3000

# Webhooks (optional)
WEBHOOK_RETRIES=3
WEBHOOK_RETRY_DELAY=5000
```

**Important** : Les variables `DATABASE_URL` et `REDIS_URL` sont auto-générées par Render lors de la création des services. Vous n'avez pas besoin de les ajouter manuellement.

### Étape 5 : Connecter les services

Pour lier PostgreSQL et Redis au Web Service :

1. Dans les paramètres du Web Service
2. Allez à **"Environment"** → **"Environment Groups"**
3. Créez un groupe `openwa` et ajoutez :
   - La base de données PostgreSQL
   - Le cache Redis

Ou utilisez l'option **"Auto-add Database/Redis"** lors de la création.

### Étape 6 : Sauvegarder et déployer

1. Cliquez sur **"Create Web Service"**
2. Render commence automatiquement le build et déploiement
3. Attendez ~5-10 minutes

### ✅ Vérification du déploiement

Une fois déployé, vous verrez :

```
Service URL: https://openwa-api-xxxxx.onrender.com
```

Testez l'API :
```bash
curl https://openwa-api-xxxxx.onrender.com/health
```

Response attendue : `{"status":"ok"}`

---

## 📊 Monitoring et Logs

- **Logs** : Onglet **"Logs"** du service
- **Metrics** : Onglet **"Metrics"** (CPU, mémoire, requêtes)
- **Alertes** : Configurez dans **"Settings"** → **"Alerts"**

---

## 🔐 Sécurité en production

### 1️⃣ Activer HTTPS (automatique sur Render)
✅ Render utilise Let's Encrypt automatiquement

### 2️⃣ Configurer l'authentification API
Dans votre `.env` :
```env
API_KEY_REQUIRED=true
MASTER_API_KEY=<generate-strong-key>
```

### 3️⃣ Activer CIDR Whitelisting (optionnel)
Pour restricter les IPs autorisées :
```env
CIDR_WHITELIST=192.168.1.0/24,10.0.0.0/8
```

### 4️⃣ Configurer les webhooks avec signature
```env
WEBHOOK_SIGNATURE_REQUIRED=true
WEBHOOK_SIGNATURE_KEY=<generate-strong-key>
```

---

## 📈 Scaling en production

### ✅ Auto-Scaling (inclus dans le plan Standard+)
- Min instances: 1
- Max instances: 3
- Trigger: CPU > 50%, Mémoire > 75%

### Database Backups
PostgreSQL sur Render crée automatiquement des backups :
- **Daily backups** : 7 derniers jours
- **Manual backups** : Onglet **"Backups"**

### Redis Persistence
Activez la persistence dans **Redis Settings** :
- **RDB Snapshots** : Toutes les heures
- **AOF** : À chaque opération (recommandé)

---

## 🔄 Pipeline CI/CD

Render auto-déploie à chaque push sur `main` :

```bash
git add .
git commit -m "Update configuration"
git push origin main
```

Render détectera le changement et relancera le build/déploiement automatiquement.

---

## 📞 Troubleshooting

### ❌ Build échoue
**Vérifier les logs** :
```bash
npm install
npm run build
```

### ❌ Erreur de connexion à la base de données
- Vérifier que PostgreSQL est **en cours d'exécution**
- Vérifier les variables `DATABASE_URL`

### ❌ Redis timeout
- Vérifier que le service Redis est **actif**
- Checker la configuration REDIS_PASSWORD

### ❌ Sessions WhatsApp perdues
Solutions :
1. Utiliser S3 pour la persistance (storage externe)
2. Augmenter les instances pour réduire les redémarrages
3. Configurer un Redis persistent

---

## 💡 Bonnes pratiques

1. ✅ Utilisez des variables d'environnement (jamais hardcoder les secrets)
2. ✅ Activez les logs de débogage en développement, info en production
3. ✅ Configurez des backups réguliers
4. ✅ Monitorer les performances et erreurs
5. ✅ Testez en staging avant production

---

## 🆘 Support

- **Docs Render** : https://render.com/docs
- **OpenWA Issues** : https://github.com/ramatkalbukasa-alt/whatsapp-API/issues
- **Render Support** : https://render.com/support

---

**Vous êtes prêt pour le déploiement ! 🎉**
