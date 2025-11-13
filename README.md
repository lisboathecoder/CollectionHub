# CollectionHub

![GitHub repo size](https://img.shields.io/github/repo-size/lisboathecoder/CollectionHub?style=for-the-badge)
![GitHub language count](https://img.shields.io/github/languages/count/lisboathecoder/CollectionHub?style=for-the-badge)

> Plataforma digital dedicada a entusiastas e colecionadores. Uma solução centralizada, intuitiva e encantadora para organizar, exibir e gerenciar suas coleções de Cartas Pokémon TCG Pocket.

## 💻 Pré-requisitos

Antes de começar, verifique se você atendeu aos seguintes requisitos:

- Você instalou a versão mais recente de `Node.js (v18+)` e `PostgreSQL (v14+)`
- Você tem uma máquina `Windows / Linux / Mac`
- Você leu a documentação do [Prisma ORM](https://www.prisma.io/docs/)

## 🚀 Instalando CollectionHub

Para instalar o CollectionHub, siga estas etapas:

**Clone o repositório:**

```bash
git clone https://github.com/lisboathecoder/CollectionHub.git
cd CollectionHub
```

**Instale as dependências:**

```bash
npm install
```

**Configure o banco de dados:**

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/collectionhub"
JWT_SECRET="seu_secret_muito_seguro_aqui"
PORT=3000
```

**Execute as migrações do Prisma:**

```bash
npx prisma migrate dev
```

**Popule o banco com dados iniciais (seed):**

```bash
npx prisma db seed
```

## ☕ Usando CollectionHub

Para usar o CollectionHub, siga estas etapas:

**Inicie o servidor:**

```bash
npm start
```

**Acesse a aplicação:**

```
http://localhost:3000
```

**Exemplos de uso da API:**

```bash
# Listar todos os cards
GET http://localhost:3000/api/pokemon/cards

# Filtrar cards por set
GET http://localhost:3000/api/pokemon/cards?set=A1

# Filtrar por set com ordenação por raridade
GET http://localhost:3000/api/pokemon/cards?set=A1&orderBy=rarity

# Buscar card específico por set e número
GET http://localhost:3000/api/pokemon/cards/A1/1

# Login de usuário
POST http://localhost:3000/api/users/login
Body: { "usernameOrEmail": "usuario", "password": "senha123" }
```

## 🛠️ Tecnologias Utilizadas

### Backend & Dados

- Node.js
- Express.js 5.1.0
- PostgreSQL
- Prisma ORM 6.18.0
- JWT (jsonwebtoken 9.0.2)
- bcrypt 6.0.0

### Frontend & Design

- HTML5, CSS3, JavaScript (ES6+)
- Figma

### Ferramentas

- Postman (testes de API)
- Trello, Notion (gerenciamento)
- BrModeloWeb (modelagem de dados)

## 📂 Estrutura do Projeto

```
CollectionHub/
├── dist/               # Dados estáticos (JSONs, imagens)
├── pages/              # Páginas HTML
├── prisma/             # Schema e migrações
├── routes/             # Rotas principais
├── src/
│   ├── controllers/    # Lógica de negócio
│   ├── models/         # Camada de acesso ao banco
│   └── routes/         # Rotas da API
└── server.js           # Ponto de entrada
```

## 📫 Contribuindo para CollectionHub

Para contribuir com CollectionHub, siga estas etapas:

1. Bifurque este repositório
2. Crie um branch: `git checkout -b feature/nova-funcionalidade`
3. Faça suas alterações e confirme-as: `git commit -m 'Adiciona nova funcionalidade X'`
4. Envie para o branch original: `git push origin feature/nova-funcionalidade`
5. Crie a solicitação de pull

Como alternativa, consulte a documentação do GitHub em [como criar uma solicitação pull](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

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
