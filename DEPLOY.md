# 🚀 Guia de Deploy - CollectionHub

## Arquitetura
- **Frontend**: Netlify (arquivos estáticos)
- **Backend**: Render.com (API Node.js + Prisma)
- **Banco de Dados**: Prisma Accelerate (já configurado)

---

## 📋 Pré-requisitos

- [ ] Conta no GitHub (já tem)
- [ ] Conta no Netlify (criar em netlify.com)
- [ ] Conta no Render (criar em render.com)
- [ ] Código commitado no GitHub

---

## 1️⃣ Deploy do Backend no Render

### Passo 1: Criar Web Service
1. Acesse https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub: `lisboathecoder/CollectionHub`
4. Configure:
   - **Name**: `collectionhub-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free

### Passo 2: Adicionar Variáveis de Ambiente
Vá em **Environment** e adicione:

```
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=...
JWT_SECRET=a83214a2360903a22c43005df5fc697c
RESEND_API_KEY=re_SSDsqiWZ_PsmzNKu8QBKvFwSZKn6p4sz4
EMAIL_FROM=collectionhub@egoats.me
IMGBB_API_KEY=ab312ebc022ecbb31e1c45ca499bb82e
AUTH_GITHUB_ID=Ov23li2t6eaF0ZJAgV7L
AUTH_GITHUB_SECRET=c2db4ddd4a403d94369d9a8dbd5b88d37f90067c
AUTH_GOOGLE_ID=133503123644-vgbca7k88dgfhqlm4r5jp4cr4gl7p841.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=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
FRONTEND_URL=https://seu-site.netlify.app
PORT=3000
```

### Passo 3: Deploy
1. Clique em **"Create Web Service"**
2. Aguarde o build (5-10 minutos)
3. Copie a URL gerada (ex: `https://collectionhub-api.onrender.com`)

---

## 2️⃣ Deploy do Frontend no Netlify

### Passo 1: Atualizar Configuração
No arquivo `netlify.toml`, substitua `SEU-BACKEND-URL` pela URL do Render:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://collectionhub-api.onrender.com/api/:splat"
  status = 200
  force = true
```

### Passo 2: Atualizar config.js
No arquivo `assets/js/config.js`, atualize:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : 'https://collectionhub-api.onrender.com';
```

### Passo 3: Commit e Push
```bash
git add .
git commit -m "chore: configure deployment"
git push origin main
```

### Passo 4: Deploy no Netlify
1. Acesse https://app.netlify.com
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Conecte ao GitHub e selecione `CollectionHub`
4. Configure:
   - **Build command**: (deixe vazio)
   - **Publish directory**: `.` (raiz)
5. Clique em **"Deploy site"**

---

## 3️⃣ Popular o Banco de Dados

### Opção A: Via Render Shell
1. No dashboard do Render, acesse seu web service
2. Clique em **"Shell"** (terminal)
3. Execute:
```bash
npx prisma db seed
```

### Opção B: Localmente
```bash
npm run prisma:seed
```

---

## 4️⃣ Atualizar URLs nos Arquivos JavaScript

Você precisa substituir `/api/` por `${API_BASE_URL}/api/` em todos os arquivos fetch.

### Exemplo:
**ANTES:**
```javascript
fetch('/api/auth/login', {...})
```

**DEPOIS:**
```javascript
fetch(`${window.API_BASE_URL}/api/auth/login`, {...})
```

**Arquivos para atualizar:**
- `assets/js/login.js`
- `assets/js/login2FA.js`
- `assets/js/register.js`
- `assets/js/forgotPassword.js`
- `assets/js/resetPassword.js`
- `albums/js/albums.js`
- `albums/js/album-detail.js`
- Todos os outros arquivos que fazem fetch para `/api/*`

---

## 5️⃣ Configurar OAuth Callbacks

### GitHub OAuth
1. Acesse https://github.com/settings/developers
2. Edite seu OAuth App
3. Atualize:
   - **Homepage URL**: `https://seu-site.netlify.app`
   - **Callback URL**: `https://collectionhub-api.onrender.com/api/auth/github/callback`

### Google OAuth
1. Acesse https://console.cloud.google.com/apis/credentials
2. Edite suas credenciais OAuth
3. Adicione:
   - **Authorized JavaScript origins**: `https://seu-site.netlify.app`
   - **Authorized redirect URIs**: `https://collectionhub-api.onrender.com/api/auth/google/callback`

---

## 6️⃣ Testar

1. Acesse seu site no Netlify
2. Teste:
   - [ ] Login funciona
   - [ ] 2FA funciona
   - [ ] Cartas aparecem
   - [ ] Álbuns funcionam
   - [ ] Upload funciona

---

## 🔧 Troubleshooting

### Erro CORS
Verifique se o `server.js` tem:
```javascript
app.use(cors({
  origin: "*",
  credentials: true
}));
```

### Erro 404 nas rotas
Certifique-se de que o `netlify.toml` está configurado corretamente

### Cartas não aparecem
1. Verifique se o seed rodou
2. Verifique a variável `DATABASE_URL` no Render
3. Verifique os logs no Render

### API lenta
- Render free tier "dorme" após inatividade
- Primeira requisição pode levar 30-50 segundos

---

## 📝 Comandos Úteis

```bash
# Ver logs do Render
# Acesse: Dashboard → Seu Service → Logs

# Rebuild no Render
# Dashboard → Seu Service → Manual Deploy

# Limpar cache do Netlify
# Site settings → Build & deploy → Clear cache and deploy site
```

---

## ✅ Checklist Final

- [ ] Backend no Render está rodando
- [ ] Frontend no Netlify está acessível
- [ ] Variáveis de ambiente configuradas
- [ ] Seed executado
- [ ] OAuth callbacks atualizados
- [ ] URLs da API atualizadas nos arquivos JS
- [ ] CORS configurado
- [ ] Teste de login funciona
- [ ] Cartas aparecem

---

## 🆘 Precisa de Ajuda?

Se algo não funcionar, me envie:
1. URL do site no Netlify
2. URL da API no Render
3. Print do erro
4. Logs do Render
