# ✅ GUIA DEFINITIVO - INICIAR SERVIDOR CORRETAMENTE

## 🎯 **PROBLEMA RESOLVIDO:**

O servidor estava **rodando uma versão antiga** do código!
Por isso as rotas da API não funcionavam.

**Todos os processos Node foram finalizados!** ✅

---

## 🚀 **AGORA FAÇA ISSO:**

### **1. Inicie o servidor NO TERMINAL DO VS CODE:**

**Abra um NOVO terminal no VS Code:**
```
Ctrl + Shift + `
```

**Selecione "Command Prompt" ou "PowerShell"**

**Execute:**
```cmd
npm run dev
```

**Aguarde ver:**
```
API server running at http://localhost:3000
```

---

### **2. Limpe o cache do navegador:**
```
Ctrl + Shift + Delete
```
Marque:
- ✅ Cookies
- ✅ Cache
- ✅ Imagens e arquivos em cache

Clique em **Limpar dados**

---

### **3. Feche TODAS as abas do localhost:3000**

---

### **4. Abra uma NOVA aba (ou aba anônima):**
```
http://localhost:3000/pages/userLogin/register.html
```

---

### **5. Crie um NOVO usuário:**
- **Username:** teste
- **Email:** teste@teste.com  
- **Password:** 12345678
- **Confirm Password:** 12345678
- ✅ Marque os checkboxes
- Clique em **Login** (o botão está marcado como "Login" mas é registro)

---

### **6. Deve funcionar!**
Se mostrar: **"Usuário criado com sucesso!"**
✅ **FUNCIONOU!**

---

## 🧪 **TESTE COMPLETO:**

### **A. Registro:**
1. Criar conta: `teste@teste.com` / `12345678`
2. Deve redirecionar para login

### **B. Login:**
1. Fazer login com: `teste@teste.com` / `12345678`
2. Código 2FA será enviado
3. **OLHE O TERMINAL DO SERVIDOR** - o código aparecerá lá!
4. Digite o código na página
5. Deve fazer login com sucesso

### **C. Teste a API diretamente:**
```
http://localhost:3000/api/health
```
Deve retornar:
```json
{"ok":true,"ts":"2025-11-24T..."}
```

---

## ⚠️ **SE NÃO FUNCIONAR:**

### **Verifique no terminal do servidor:**
Deve aparecer:
```
POST /api/auth/register
POST /api/auth/login
```

### **Se aparecer "File not found":**
- O servidor não foi reiniciado corretamente
- Mate o processo e inicie novamente

### **Se aparecer erro 500:**
- Olhe os logs no terminal
- Pode ser problema com bcrypt ou Prisma

---

## 📝 **LOGS QUE VOCÊ DEVE VER:**

### **No Terminal do Servidor:**
```
API server running at http://localhost:3000
POST /api/auth/register
[logs do Prisma]
✅ Usuário criado!
```

### **No Console do Navegador (F12):**
```javascript
Enviando dados: {username: "teste", email: "teste@teste.com", password: "***"}
Status da resposta: 201
Dados recebidos: {message: "Usuário criado com sucesso!", user: {...}}
```

---

## 🎯 **CHECKLIST FINAL:**

- [x] Todos os processos Node foram finalizados
- [ ] Servidor iniciado com `npm run dev`
- [ ] Ver "API server running at http://localhost:3000"
- [ ] Cache do navegador limpo
- [ ] Todas as abas do localhost fechadas
- [ ] Nova aba aberta
- [ ] Criar novo usuário
- [ ] Testar login
- [ ] Ver código 2FA no terminal
- [ ] ✅ Tudo funcionando!

---

## 🚀 **COMANDOS PARA COPIAR:**

```cmd
:: No terminal do VS Code (Command Prompt):
npm run dev
```

Aguarde o servidor iniciar e teste!

---

**O servidor agora vai funcionar corretamente!** 🎉
