# 🚀 Sistema de Autenticação Simplificado - CollectionHub

## ✅ O que está pronto:

1. **Login tradicional** com email/senha
2. **Código 2FA** enviado por email (Resend)
3. **Estrutura preparada** para Google e GitHub OAuth

---

## 📋 Arquivos Criados:

```
src/
├── services/
│   └── emailService.js         ← Envio de emails (Resend)
├── controllers/
│   └── authController.js       ← Lógica de autenticação
└── routes/
    └── authRoutes.js           ← Rotas de auth
```

---

## 🔧 Configuração (5 minutos):

### 1. Variáveis de Ambiente (.env)

Certifique-se que tem:

```env
# JWT
JWT_SECRET=sua_string_secreta_aqui

# Database
DATABASE_URL="postgresql://postgres:senha@localhost:5432/pokemon_db"

# Resend (para envio de emails)
RESEND_API_KEY=re_sua_key_aqui
EMAIL_FROM=onboarding@resend.dev

# 2FA
TWO_FACTOR_CODE_EXPIRES_IN=5
```

---

## 🎯 Como funciona:

### **Fluxo de Login:**

```
1. Usuário faz login → POST /api/auth/login
   ↓
2. Sistema gera código 2FA → Envia por email
   ↓
3. Usuário recebe email com código
   ↓
4. Usuário envia código → POST /api/auth/verify-2fa
   ↓
5. Sistema valida código → Retorna token JWT
   ↓
6. Login completo! ✅
```

---

## 📡 Endpoints Disponíveis:

### 1️⃣ **Registrar Usuário**

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "joao",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta:**

```json
{
  "mensagem": "Usuário criado com sucesso!",
  "user": {
    "id": 1,
    "username": "joao",
    "email": "joao@example.com"
  }
}
```

---

### 2️⃣ **Login (Etapa 1) - Receber Código 2FA**

```http
POST /api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "joao",
  "password": "senha123"
}
```

**Resposta:**

```json
{
  "mensagem": "Código enviado para seu email",
  "userId": 1,
  "requires2FA": true
}
```

**📧 Usuário recebe email com código de 6 dígitos**

---

### 3️⃣ **Verificar Código 2FA (Etapa 2) - Completar Login**

```http
POST /api/auth/verify-2fa
Content-Type: application/json

{
  "userId": 1,
  "code": "123456"
}
```

**Resposta:**

```json
{
  "mensagem": "Login realizado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "joao",
    "email": "joao@example.com"
  }
}
```

---

### 4️⃣ **Reenviar Código 2FA**

```http
POST /api/auth/resend-2fa
Content-Type: application/json

{
  "userId": 1
}
```

**Resposta:**

```json
{
  "mensagem": "Novo código enviado para seu email"
}
```

---

## 🧪 Testando no Postman:

### **Collection: CollectionHub Auth**

#### **1. Register**

```
POST http://localhost:3000/api/auth/register
Body (JSON):
{
  "username": "teste",
  "email": "seu-email@gmail.com",
  "password": "senha123"
}
```

#### **2. Login**

```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "usernameOrEmail": "teste",
  "password": "senha123"
}

✅ Salve o userId da resposta
📧 Verifique seu email
```

#### **3. Verify 2FA**

```
POST http://localhost:3000/api/auth/verify-2fa
Body (JSON):
{
  "userId": 1,
  "code": "123456"  ← código do email
}

✅ Salve o token da resposta
```

#### **4. Usar token nas próximas requests**

```
Authorization: Bearer {{token}}
```

---

## 🎨 Email que o usuário recebe:

```
┌─────────────────────────────────────────┐
│         🔐 CollectionHub                │
│  ─────────────────────────────────────  │
│                                         │
│  Olá, João!                            │
│                                         │
│  Seu código de verificação é:          │
│                                         │
│  ╔═══════════════╗                     │
│  ║   123456      ║                     │
│  ╚═══════════════╝                     │
│                                         │
│  ⏰ Expira em 5 minutos                │
│                                         │
└─────────────────────────────────────────┘
```

---

## ⚙️ Como iniciar o servidor:

```bash
npm run dev
```

Você verá:

```
✔ API server running at http://localhost:3000
```

---

## 🐛 Troubleshooting:

### ❌ "Missing API key"

```bash
# Verifique o .env:
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=onboarding@resend.dev

# Reinicie:
npm run dev
```

### ❌ "Erro ao enviar email"

```
1. Verifique se RESEND_API_KEY está correto
2. Verifique se tem internet
3. Teste: node test-resend.js seu-email@gmail.com
```

### ❌ "Código inválido"

```
1. Verifique se digitou o código correto
2. Código expira em 5 minutos
3. Use /api/auth/resend-2fa para novo código
```

---

## 🔐 Segurança:

✅ **Senha** → Hash com bcrypt  
✅ **Token JWT** → Expira em 7 dias  
✅ **Código 2FA** → Expira em 5 minutos  
✅ **Código 2FA** → 6 dígitos aleatórios  
✅ **Email** → Enviado via Resend (seguro)

---

## 📊 Próximos Passos (OAuth):

Para adicionar login com **Google** e **GitHub**, você precisa:

### 1. Configurar OAuth Apps:

#### **Google:**

```
1. https://console.cloud.google.com/
2. Create Project → "CollectionHub"
3. APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
5. Authorized redirect URI:
   http://localhost:3000/api/auth/callback/google
6. Copie Client ID e Secret para .env
```

#### **GitHub:**

```
1. https://github.com/settings/developers
2. New OAuth App
3. Homepage: http://localhost:3000
4. Callback: http://localhost:3000/api/auth/callback/github
5. Copie Client ID e Secret para .env
```

### 2. Adicionar no .env:

```env
# Google OAuth
AUTH_GOOGLE_ID=xxxxxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxxxxx

# GitHub OAuth
AUTH_GITHUB_ID=Ov23lixxxxxxx
AUTH_GITHUB_SECRET=xxxxxxxxxxxxxxxx
```

### 3. Instalar Auth.js:

```bash
npm install @auth/core @auth/express @auth/prisma-adapter
```

---

## ✅ Checklist:

- [ ] Configurei `.env` com RESEND_API_KEY
- [ ] Configurei `.env` com JWT_SECRET
- [ ] Configurei `.env` com EMAIL_FROM
- [ ] Instalei: `npm install`
- [ ] Iniciei: `npm run dev`
- [ ] Testei registro: POST /api/auth/register
- [ ] Testei login: POST /api/auth/login
- [ ] Recebi email com código 2FA
- [ ] Testei verify: POST /api/auth/verify-2fa
- [ ] Recebi token JWT ✅

---

## 🎉 Sistema Funcionando!

Seu sistema de autenticação está pronto:

✅ Registro de usuários  
✅ Login com email/senha  
✅ 2FA por email com código  
✅ Token JWT para sessões  
✅ Reenvio de código 2FA

**Próximo:** Adicionar OAuth (Google/GitHub) quando precisar!

---

**Dúvidas? Me chame! 💪**
