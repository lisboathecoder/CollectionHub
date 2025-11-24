# 🚀 Deploy COMPLETO no Netlify (Frontend + Backend)

## ✅ **Por que essa solução é melhor:**

1. ✅ **Tudo em um só lugar** - Frontend e Backend no mesmo domínio
2. ✅ **Sem problema de CORS** - API no mesmo origin
3. ✅ **Mais rápido** - Netlify Edge é muito rápido
4. ✅ **Grátis** - 125k requisições/mês + 100GB bandwidth
5. ✅ **Não dorme** - Sem cold start como Render
6. ✅ **Prisma já conectado** - Você já tem o Accelerate configurado

---

## 📋 **O que foi configurado:**

### ✅ Arquivos criados/modificados:

1. **`netlify/functions/api.js`** - Toda a API como Netlify Function
2. **`netlify.toml`** - Configuração do Netlify
3. **`assets/js/config.js`** - URLs adaptadas
4. **`package.json`** - Adicionado `serverless-http` e script `build`

---

## 🎯 **Como fazer o Deploy:**

### **Passo 1: Instalar nova dependência**

```bash
npm install serverless-http
```

### **Passo 2: Commit e Push**

```bash
git add .
git commit -m "feat: migrate to Netlify Functions (serverless)"
git push origin lisboa
```

### **Passo 3: Configurar no Netlify**

1. Acesse: https://app.netlify.com
2. **"Add new site"** → **"Import from Git"**
3. Conecte ao GitHub: `lisboathecoder/CollectionHub`
4. Selecione o branch: `lisboa`
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `.`
   - **Functions directory**: `netlify/functions` (já está no toml)

### **Passo 4: Adicionar Variáveis de Ambiente**

No Netlify, vá em: **Site settings → Environment variables**

Adicione TODAS as variáveis do seu `.env`:

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
```

### **Passo 5: Deploy!**

Clique em **"Deploy site"** e aguarde (2-5 minutos)

### **Passo 6: Popular o Banco (Seed)**

Você tem 2 opções:

**Opção A - Localmente:**
```bash
npm run prisma:seed
```

**Opção B - Via Netlify CLI:**
```bash
npm install -g netlify-cli
netlify login
netlify link
netlify dev
# Em outro terminal:
npm run prisma:seed
```

---

## 🔧 **Atualizar OAuth Callbacks**

Pegue a URL do seu site Netlify (ex: `https://collectionhub.netlify.app`)

### **GitHub OAuth**
1. https://github.com/settings/developers
2. Edite seu OAuth App:
   - **Homepage URL**: `https://collectionhub.netlify.app`
   - **Callback URL**: `https://collectionhub.netlify.app/api/auth/github/callback`

### **Google OAuth**
1. https://console.cloud.google.com/apis/credentials
2. Edite suas credenciais:
   - **Authorized JavaScript origins**: `https://collectionhub.netlify.app`
   - **Authorized redirect URIs**: `https://collectionhub.netlify.app/api/auth/google/callback`

---

## ✅ **Como funciona:**

```
┌────────────────────────────────────────────────┐
│         SEU SITE NO NETLIFY                    │
│    https://collectionhub.netlify.app           │
│                                                 │
│  ┌─────────────────┐  ┌────────────────────┐  │
│  │    Frontend     │  │  Netlify Functions  │  │
│  │  HTML/CSS/JS    │  │    (Backend API)    │  │
│  │                 │  │   - Express         │  │
│  │  fetch('/api')──┼─→│   - Prisma          │  │
│  │                 │  │   - Auth            │  │
│  └─────────────────┘  └────────────────────┘  │
│                              ↓                  │
│                         DATABASE_URL            │
│                              ↓                  │
└──────────────────────────────┼─────────────────┘
                               ↓
                    ┌──────────────────┐
                    │  Prisma Postgres │
                    │    (Accelerate)  │
                    └──────────────────┘
```

**Tudo em um domínio!** Sem CORS, sem complicação! 🎉

---

## 🧪 **Testar Localmente**

Para testar as Netlify Functions localmente:

```bash
npm install -g netlify-cli
netlify dev
```

Acesse: `http://localhost:8888`

---

## ⚡ **Vantagens vs Render:**

| Feature | Netlify Functions | Render Free |
|---------|------------------|-------------|
| Cold Start | ~300ms | ~30 segundos |
| Timeout | 10s (free) / 26s (pro) | 60s |
| "Dorme"? | ❌ Não | ✅ Sim (após 15min) |
| Deploy Speed | 2-3 min | 5-10 min |
| Bandwidth | 100GB/mês | 100GB/mês |
| CORS Issues | ❌ Não (mesmo domínio) | ✅ Sim |

---

## 📊 **Monitoramento**

- **Functions Log**: https://app.netlify.com → Functions → Logs
- **Deploy Log**: https://app.netlify.com → Deploys
- **Analytics**: https://app.netlify.com → Analytics

---

## ❌ **Limitações do Netlify Free:**

1. ⏱️ **Timeout**: 10 segundos (suficiente para 99% dos casos)
2. 📦 **Bundle size**: 50MB (seu projeto é ~10MB)
3. 🔢 **Requisições**: 125k/mês (suficiente para começar)

---

## 🆘 **Troubleshooting**

### **Erro: "Function bundling failed"**
```bash
npm install serverless-http
```

### **Erro: "Prisma Client not generated"**
Adicione no `netlify.toml`:
```toml
[build]
  command = "npm install && npx prisma generate"
```

### **Erro 502: Function timeout**
A function demorou mais de 10s. Verifique:
- Consultas Prisma otimizadas?
- Prisma Accelerate configurado?

### **Environment variables não funcionam**
Verifique se adicionou em: **Site settings → Environment variables**

---

## 🎉 **Resultado Final:**

- ✅ Site: `https://collectionhub.netlify.app`
- ✅ API: `https://collectionhub.netlify.app/api/...`
- ✅ Tudo no mesmo domínio
- ✅ Zero configuração CORS
- ✅ Deploy automático do GitHub
- ✅ HTTPS grátis
- ✅ CDN global

---

## 🚀 **Próximos Passos:**

1. Instale `serverless-http`: `npm install serverless-http`
2. Commit e Push
3. Configure no Netlify
4. Adicione env vars
5. Deploy!
6. Rode o seed
7. Atualize OAuth
8. 🎉 **Funcionando!**

---

**Dúvidas?** Me chama que eu te ajudo! 😊
