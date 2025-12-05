# CollectionHub

![GitHub repo size](https://img.shields.io/github/repo-size/lisboathecoder/CollectionHub?style=for-the-badge)
![GitHub language count](https://img.shields.io/github/languages/count/lisboathecoder/CollectionHub?style=for-the-badge)

> Plataforma digital completa para colecionadores de Pokémon TCG Pocket. Organize, exiba e gerencie suas coleções com autenticação segura, upload de imagens e busca avançada.

## Preview

![Screenshot do CollectionHub](./assets/images/Captura%20de%20Tela%202025-11-24%20às%2011.06.03.png)

## Tecnologias Utilizadas

### Backend

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" alt="Express.js" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" alt="Prisma" width="40" height="40"/>
</p>

- **Node.js**
- **Express**
- **PostgreSQL**
- **Prisma ORM**
- **JWT (jsonwebtoken)** - Utilizamos para autenticação
- **bcryptjs** - Hash de senhas
- **Resend API** - Envio de emails
- **ImgBB API** - CDN de imagens

### Frontend

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" alt="HTML5" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" alt="CSS3" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" width="40" height="40"/>
</p>

- **HTML**
- **CSS**
- **JavaScript**

### Ferramentas

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg" alt="Postman" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" alt="Git" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" alt="VS Code" width="40" height="40"/>
</p>

- **Postman** - Testes de API
- **Git** - Controle de versão
- **VS Code** - IDE
- **Trello, Notion** - Gerenciamento da equipe, suas funções, tarefas
- **Prisma Console** - Para Modelagem de Diagrama Entidade-Relacionamento do banco de dados

## Estrutura do Projeto

```
CollectionHub/
├── assets/               
│   ├── images/           
│   ├── js/               
│   └── styles/           
├── pages/
│   ├── album/                
│   ├── app/              
│   ├── explore/          
│   ├── public/           
│   └── userLogin/       
├── prisma/               
│   ├── schema.prisma     
│   ├── seed.js           
│   └── migrations/       
├── src/
│   ├── controllers/     
│   │   ├── Users/       
│   │   ├── Pokemon/     
│   │   └── Albums/      
│   ├── routes/          
│   ├── middleware/       
│   ├── services/       
│   └── lib/
├── server.js             
├── routes.js                 
```

## Nossa Equipe

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
