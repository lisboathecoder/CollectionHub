# 🎴 CollectionHub

![GitHub repo size](https://img.shields.io/github/repo-size/lisboathecoder/CollectionHub?style=for-the-badge)
![GitHub language count](https://img.shields.io/github/languages/count/lisboathecoder/CollectionHub?style=for-the-badge)

> Plataforma digital completa para colecionadores de Pokémon TCG Pocket. Organize, exiba e gerencie suas coleções com autenticação segura, upload de imagens e busca avançada.

## 📸 Preview

![Screenshot do CollectionHub](./assets/images/Captura%20de%20Tela%202025-11-24%20às%2011.06.03.png)

## 🛠️ Tecnologias Utilizadas

### Backend

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" alt="Express.js" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" alt="Prisma" width="40" height="40"/>
</p>

- **Node.js 22.x** - Runtime JavaScript
- **Express 5.1.0** - Framework web
- **PostgreSQL 14+** - Banco de dados relacional
- **Prisma ORM 6.19.0** - ORM type-safe
- **JWT (jsonwebtoken)** - Autenticação stateless
- **bcryptjs** - Hash de senhas
- **Resend API** - Envio de emails
- **ImgBB API** - CDN de imagens

### Frontend

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" alt="HTML5" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" alt="CSS3" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" width="40" height="40"/>
</p>

- **HTML5** - Estrutura semântica
- **CSS3** - Estilização (Grid, Flexbox, Animations)
- **JavaScript (ES6+)** - Lógica do cliente

### Ferramentas

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg" alt="Postman" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" alt="Git" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" alt="VS Code" width="40" height="40"/>
</p>

- **Postman** - Testes de API
- **Git** - Controle de versão
- **VS Code** - IDE
- Trello, Notion (gerenciamento)
- BrModeloWeb (modelagem de dados)

## 📂 Estrutura do Projeto

```
CollectionHub/
├── assets/                # Recursos estáticos
│   ├── images/           # Imagens, ícones, logos
│   ├── js/               # JavaScript modules
│   └── styles/           # CSS files
├── pages/                # Páginas HTML
│   ├── app/              # Páginas autenticadas (dashboard, collection)
│   ├── explore/          # Busca e exploração (sets, packs, search)
│   ├── public/           # Páginas públicas (about, contact, faq)
│   └── userLogin/        # Autenticação (login, register, 2FA, reset)
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   ├── seed.js           # Seed data
│   └── migrations/       # Database migrations
├── src/
│   ├── controllers/      # Business logic
│   │   ├── Users/        # Auth, profile
│   │   ├── Pokemon/      # Cards, sets, rarities
│   │   └── Albums/       # Album CRUD
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── services/         # External services (email, auth)
│   └── lib/              # Prisma singleton
├── server.js             # Entry point
├── routes.js             # API routes aggregator
└── .env.example          # Environment template
```

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- NPM ou Yarn

### Passo a passo

1. **Clone o repositório**
```bash
git clone https://github.com/lisboathecoder/CollectionHub.git
cd CollectionHub
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite .env com suas credenciais
```

4. **Configure o banco de dados**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **Inicie o servidor**
```bash
node server.js
```

6. **Acesse no navegador**
```
http://localhost:3000
```

## 📚 Documentação

- **[BACKEND_PRESENTATION.md](./BACKEND_PRESENTATION.md)** - Apresentação técnica do backend
- **[PROFILE_IMPLEMENTATION.md](./PROFILE_IMPLEMENTATION.md)** - Guia completo do sistema de perfil
- **[NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md)** - Deploy em produção (Netlify + Railway)

## 🔑 Variáveis de Ambiente

```env
DATABASE_URL=                    # PostgreSQL connection string
JWT_SECRET=                      # Secret for JWT signing
IMGBB_API_KEY=                   # ImgBB API key (image hosting)
RESEND_API_KEY=                  # Resend API key (emails)
AUTH_GITHUB_ID=                  # GitHub OAuth client ID
AUTH_GITHUB_SECRET=              # GitHub OAuth client secret
AUTH_GOOGLE_ID=                  # Google OAuth client ID
AUTH_GOOGLE_SECRET=              # Google OAuth client secret
```

Veja `.env.example` para mais detalhes.

## 🤝 Colaboradores

Agradecemos às seguintes pessoas que contribuíram para este projeto:

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/lisboathecoder" title="Gustavo Lisboa">
        <img src="https://github.com/lisboathecoder.png" width="100px;" alt="Foto do Gustavo Lisboa no GitHub"/><br>
        <sub>
          <b>Gustavo Lisboa</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Jvsilvagomes" title="João Victor">
        <img src="https://github.com/Jvsilvagomes.png" width="100px;" alt="Foto do João Victor"/><br>
        <sub>
          <b>João Victor</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Fabiox7778" title="Fabio">
        <img src="https://github.com/Fabiox7778.png" width="100px;" alt="Foto do Fabio"/><br>
        <sub>
          <b>Fabio Henrique </b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/PedroUE" title="Pedro">
        <img src="https://github.com/PedroUE.png" width="100px;" alt="Foto do Pedro"/><br>
        <sub>   
          <b>Pedro Urbano</b>
        </sub>
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/Rafael-1108" title="Rafael">
        <img src="https://github.com/Rafael-1108.png" width="100px;" alt="Foto do Rafael"/><br>
        <sub>
          <b>Rafael Mendes</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/CiaociaoStopiglia" title="João Stopiglia">
        <img src="https://github.com/CiaociaoStopiglia.png" width="100px;" alt="Foto do João Stopiglia"/><br>
        <sub>
          <b>João Stopiglia</b>
        </sub>
      </a>
    </td>
  </tr>
</table>

---

[⬆ Voltar ao topo](#collectionhub)