# 🚀 Deploy to Render - One Click!

## Bouton de déploiement automatique

Cliquez ci-dessous pour déployer OpenWA complètement automatisé sur Render :

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ramatkalbukasa-alt/whatsapp-API)

---

## ✨ Ce que le Blueprint automatise :

✅ **Web Service** (Node.js 22) - API OpenWA  
✅ **PostgreSQL Database** - Base de données  
✅ **Redis Cache** - Système de cache  
✅ **Variables d'environnement** - Toutes les configs  
✅ **Health Checks** - Monitoring automatique  
✅ **Auto-deploy** - Redéploiement à chaque push  

---

## 📋 Étapes après avoir cliqué le bouton :

1. **Connectez votre compte GitHub** (ou créez-en un)
2. **Autorisez Render** à accéder au repo
3. **Vérifiez les paramètres** :
   - Region: `Ohio` (ou votre région)
   - Branch: `main`
4. **Cliquez "Create Blueprint"**
5. **Attendez** ~5-10 minutes
6. ✅ **Terminé !** Votre API est live

---

## 🔗 URL de déploiement personnalisée :

Si vous voulez déployer sur votre propre repo :

```
https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/YOUR_REPO
```

---

## 💡 Alternative : Déploiement manuel

Si le bouton ne fonctionne pas :

1. Allez sur https://render.com/dashboard
2. **New +** → **Web Service**
3. Connectez votre repo GitHub
4. Render détectera automatiquement `render.yaml` et créera tous les services

---

## 🎯 Après le déploiement :

- **API URL** : `https://openwa-api-xxxxx.onrender.com`
- **Dashboard** : `https://openwa-api-xxxxx.onrender.com/dashboard`
- **Swagger API** : `https://openwa-api-xxxxx.onrender.com/api`

**Testez l'API :**
```bash
curl https://openwa-api-xxxxx.onrender.com/health
```

Response : `{"status":"ok"}`

---

## 🔐 Sécurité

Après déploiement, configurez :

1. **API Key** : Générez une clé forte
2. **CORS** : Restrictif si nécessaire
3. **Webhooks** : Activez la signature HMAC
4. **Database** : Backups automatiques (inclus)

---

## 📞 Support

- **Docs Render** : https://render.com/docs
- **OpenWA GitHub** : https://github.com/ramatkalbukasa-alt/whatsapp-API
- **Render Support** : https://render.com/support

---

**Prêt ? Cliquez le bouton ci-dessus ! 🎉**
