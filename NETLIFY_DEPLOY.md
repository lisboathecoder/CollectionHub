# 🚀 Deploy CollectionHub no Netlify

## 📋 Pré-requisitos

1. Conta no [Netlify](https://app.netlify.com/)
2. Repositório no GitHub com o código
3. Banco de dados PostgreSQL hospedado (recomendado: [Railway](https://railway.app/) ou [Supabase](https://supabase.com/))

---

## 🔧 Configuração do Backend

### 1. Deploy do Backend (Node.js + Express)

**Opções recomendadas:**
- **Railway** (mais simples)
- **Render** (plano gratuito)
- **Heroku** (pago)

#### Railway (Recomendado):

```bash
# 1. Instale o CLI do Railway
npm i -g @railway/cli

# 2. Login
railway login

# 3. Crie novo projeto
railway init

# 4. Deploy
railway up
```

**Configurar variáveis de ambiente no Railway:**
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=seu_jwt_secret_aqui
IMGBB_API_KEY=sua_chave_imgbb
RESEND_API_KEY=sua_chave_resend
AUTH_GITHUB_ID=seu_github_oauth_id
AUTH_GITHUB_SECRET=seu_github_oauth_secret
AUTH_GOOGLE_ID=seu_google_oauth_id
AUTH_GOOGLE_SECRET=seu_google_oauth_secret
FRONTEND_URL=https://seu-site.netlify.app
PORT=3000
```

### 2. Banco de Dados PostgreSQL

**Railway (inclui PostgreSQL):**
1. No Railway, clique em "New" → "Database" → "PostgreSQL"
2. Copie a `DATABASE_URL` gerada
3. Cole nas variáveis de ambiente

**Ou use Supabase:**
1. Crie projeto em [supabase.com](https://supabase.com)
2. Vá em Settings → Database → Connection String
3. Copie a URL de conexão

### 3. Executar Migrações

```bash
# No terminal do seu projeto backend
npx prisma migrate deploy
npx prisma generate
```

---

## 🌐 Deploy do Frontend (Netlify)

### 1. Via Interface do Netlify

1. Acesse [app.netlify.com](https://app.netlify.com/)
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Conecte seu repositório GitHub
4. Configure:
   ```
   Build command: (deixe vazio para sites estáticos)
   Publish directory: . (raiz do projeto)
   ```

### 2. Configurar Variáveis de Ambiente

No Netlify Dashboard:
- **Site settings** → **Environment variables**
- Adicione:
  ```
  API_BASE_URL = https://seu-backend.railway.app
  ```

### 3. Configurar `config.js`

Atualize `assets/js/config.js`:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : 'https://seu-backend.railway.app'; // ← MUDAR AQUI!

window.API_BASE_URL = API_BASE_URL;
```

### 4. Criar `netlify.toml` na raiz do projeto

```toml
[build]
  publish = "."
  
[[redirects]]
  from = "/api/*"
  to = "https://seu-backend.railway.app/api/:splat"
  status = 200
  force = true
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### 5. Criar `_redirects` na raiz

```
/api/*  https://seu-backend.railway.app/api/:splat  200
/*      /index.html                                   200
```

---

## ✅ Checklist Final

- [ ] Backend deployado (Railway/Render)
- [ ] Banco PostgreSQL criado e conectado
- [ ] Migrações executadas (`npx prisma migrate deploy`)
- [ ] Variáveis de ambiente configuradas
- [ ] `config.js` atualizado com URL do backend
- [ ] `netlify.toml` criado
- [ ] `_redirects` criado
- [ ] Frontend deployado no Netlify
- [ ] Testar login/registro
- [ ] Testar upload de imagens
- [ ] Testar carregamento de cards

---

## 🐛 Troubleshooting

### Erro: "Failed to fetch"
- Verifique se `API_BASE_URL` está correto
- Confirme que backend está rodando
- Verifique CORS no backend

### Erro: "Database connection failed"
- Confirme `DATABASE_URL` nas variáveis de ambiente
- Teste conexão com: `npx prisma db pull`

### Imagens não carregam
- Verifique `IMGBB_API_KEY`
- Confirme que ImgBB está respondendo

### OAuth não funciona
- Atualize URLs de callback:
  - GitHub: `https://seu-backend.railway.app/api/auth/github/callback`
  - Google: `https://seu-backend.railway.app/api/auth/google/callback`

---

## 📱 Domínio Customizado (Opcional)

1. No Netlify: **Domain settings** → **Add custom domain**
2. Configure DNS conforme instruções
3. Ative SSL automático (HTTPS)
4. Atualize `FRONTEND_URL` no backend

---

## 🔄 Deploy Contínuo

Configurado automaticamente! Cada push no GitHub:
- Netlify rebuilda automaticamente o frontend
- Railway/Render rebuildam o backend (se configurado)

---

## 📊 Monitoramento

### Netlify Analytics
- Visualize tráfego em **Analytics** no dashboard

### Railway Logs
```bash
railway logs
```

### Render Logs
- Acesse dashboard → Logs

---

## 💰 Custos Estimados

- **Netlify**: GRÁTIS (100GB bandwidth/mês)
- **Railway**: $5/mês (500h incluídas)
- **PostgreSQL (Railway)**: Incluído no plano
- **ImgBB API**: GRÁTIS
- **Resend (emails)**: 3.000 emails/mês grátis

**Total: ~$5/mês**

---

## 🆘 Suporte

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com/)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app/)
- **Prisma Docs**: [prisma.io/docs](https://www.prisma.io/docs/)
