## 🚀 Resumo Rápido: Deploy do CollectionHub

### **Arquitetura**
- 🎨 **Frontend**: Netlify (HTML/CSS/JS)
- ⚙️ **Backend**: Render.com (Node.js + Express)
- 🗄️ **Banco**: Prisma Accelerate (PostgreSQL)

---

### **✅ PASSO 1: Deploy do Backend (Render.com)**

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Conecte: `lisboathecoder/CollectionHub`
4. Configure:
   - **Name**: `collectionhub-api`
   - **Build**: `npm install && npx prisma generate`
   - **Start**: `node server.js`
   - **Free tier**

5. **Adicione as variáveis de ambiente** (copie do seu .env):
   ```
   DATABASE_URL=...
   JWT_SECRET=...
   RESEND_API_KEY=...
   EMAIL_FROM=...
   IMGBB_API_KEY=...
   AUTH_GITHUB_ID=...
   AUTH_GITHUB_SECRET=...
   AUTH_GOOGLE_ID=...
   AUTH_GOOGLE_SECRET=...
   ```

6. Deploy → Copie a URL (ex: `https://collectionhub-api.onrender.com`)

---

### **✅ PASSO 2: Atualizar Arquivos para Produção**

**1. Edite `netlify.toml`** (linha 7):
```toml
to = "https://collectionhub-api.onrender.com/api/:splat"
```

**2. Edite `assets/js/config.js`** (linha 4):
```javascript
: 'https://collectionhub-api.onrender.com';
```

**3. Commit e Push:**
```bash
git add .
git commit -m "chore: configure for production"
git push origin main
```

---

### **✅ PASSO 3: Deploy do Frontend (Netlify)**

1. Acesse: https://app.netlify.com
2. **"Add new site"** → **"Import from Git"**
3. Selecione: `CollectionHub`
4. Configure:
   - **Build command**: (vazio)
   - **Publish directory**: `.`
5. **Deploy!**

---

### **✅ PASSO 4: Popular o Banco (Seed)**

**No terminal do Render (Shell):**
```bash
npx prisma db seed
```

---

### **✅ PASSO 5: Atualizar OAuth Callbacks**

**GitHub** (https://github.com/settings/developers):
- Homepage: `https://seu-site.netlify.app`
- Callback: `https://collectionhub-api.onrender.com/api/auth/github/callback`

**Google** (https://console.cloud.google.com):
- Origins: `https://seu-site.netlify.app`
- Redirect: `https://collectionhub-api.onrender.com/api/auth/google/callback`

---

### **⚠️ IMPORTANTE: Atualizar Fetch URLs**

Você precisa atualizar TODOS os fetch() nos arquivos JS:

**ANTES:**
```javascript
fetch('/api/auth/login', {...})
```

**DEPOIS:**
```javascript
fetch(`${window.API_BASE_URL}/api/auth/login`, {...})
```

**Arquivos a atualizar:**
- ✅ `assets/js/login.js`
- ✅ `assets/js/login2FA.js`
- ✅ `assets/js/register.js`
- ✅ `assets/js/forgot2FA.js`
- ✅ `assets/js/forgotPassword.js`
- ✅ `assets/js/resetPassword.js`
- ✅ `assets/js/global-search.js`
- ✅ `albums/js/albums.js`
- ✅ `albums/js/album-detail.js`
- ✅ `pages/explore/` (todos os JS)

---

### **🔍 Testar**

1. Acesse seu site Netlify
2. Verifique o Console (F12)
3. Teste login
4. Teste busca de cartas

---

### **❌ Problemas Comuns**

**Erro CORS:**
- Verifique `server.js` tem `cors({ origin: "*" })`

**API lenta:**
- Render free "dorme" → primeira request demora ~30s

**Cartas não aparecem:**
- Rode o seed no Render
- Verifique DATABASE_URL

---

### **📊 Monitoramento**

- **Logs Backend**: https://dashboard.render.com → Logs
- **Logs Frontend**: https://app.netlify.com → Functions log
- **Console Browser**: F12 → Console

---

### **🎯 Próximos Passos**

Quer que eu atualize automaticamente os arquivos fetch() para usar a URL correta?
