# Sistema de Monitoramento e Sinalização de Ocorrências Ambientais

## Sobre o projeto

Este projeto foi desenvolvido como trabalho acadêmico com foco na **área ambiental e na participação da população na identificação de problemas urbanos**.

A aplicação permite que usuários registrem e visualizem ocorrências ambientais diretamente em um **mapa interativo**. Ao identificar uma situação de risco ou problema em determinada rua ou região, o usuário pode selecionar o local no mapa e sinalizar a ocorrência para que outros usuários da plataforma tenham conhecimento.

Os principais tipos de ocorrências monitorados pelo sistema são:

- 🌊 **Enchentes**
- 🏔️ **Erosão**
- ⚠️ **Queda de talude**

O objetivo é criar uma plataforma colaborativa que facilite a **identificação, visualização e compartilhamento de informações sobre problemas ambientais nas cidades**, contribuindo para uma maior conscientização da população sobre situações que podem causar riscos e impactos à comunidade.

---

## Funcionalidades

### Usuários

- Cadastro de novos usuários;
- Login e logout;
- Gerenciamento de sessão;
- Proteção contra CSRF;
- Controle de acesso baseado em papéis;
- Visualização do perfil do usuário autenticado;
- Criação de ocorrências ambientais;
- Visualização das ocorrências registradas no mapa;
- Exclusão de ocorrências;
- Contagem de ocorrências cadastradas por usuário.

### Ocorrências ambientais

O usuário pode acessar o mapa, localizar uma rua ou região e registrar uma ocorrência ambiental naquele ponto.

Cada sinalização representa um evento identificado pelo usuário, como:

- Uma área com histórico ou ocorrência de **enchente**;
- Um local afetado por **erosão**;
- Uma região com risco ou ocorrência de **queda de talude**.

Dessa forma, o mapa funciona como um painel colaborativo de informações, permitindo que os usuários tenham uma visão geral das ocorrências registradas na cidade.

### Administração

O sistema também possui uma área administrativa destinada ao gerenciamento da aplicação, incluindo:

- Visualização de usuários;
- Consulta de logs do sistema;
- Controle de informações administrativas.

---

# Arquitetura do Projeto

A aplicação foi organizada separando as responsabilidades entre **configuração, banco de dados, regras de negócio, API e interface pública**.

```text
projeto/
├── config/
│   └── config.php
│
├── database/
│   └── schema.sql
│
├── src/
│   ├── Database.php
│   ├── Response.php
│   ├── Auth.php
│   └── Occurrence.php
│
├── api/
│   ├── auth/
│   │   ├── register.php
│   │   ├── login.php
│   │   ├── logout.php
│   │   └── me.php
│   │
│   ├── occurrences/
│   │   ├── list.php
│   │   ├── create.php
│   │   └── delete.php
│   │
│   └── admin/
│       ├── users.php
│       └── logs.php
│
└── public/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── admin.html
    │
    ├── css/
    │   └── styles.css
    │
    └── js/
        ├── api.js
        ├── auth.js
        ├── dashboard.js
        └── admin.js
```

---

## Estrutura das Pastas

### `config/`

Contém as configurações gerais do sistema.

#### `config.php`

Arquivo responsável por centralizar configurações como:

- Credenciais de acesso ao banco de dados;
- Configuração de sessão;
- Timezone da aplicação;
- Outras configurações necessárias para o funcionamento do sistema.

---

### `database/`

Contém os arquivos relacionados à estrutura do banco de dados.

#### `schema.sql`

Responsável pela criação das tabelas e estrutura completa do banco de dados.

Também pode incluir dados iniciais, como a criação de um usuário administrador (**admin seed**).

---

### `src/`

Representa a **camada de domínio da aplicação**, onde estão concentradas as principais regras de negócio.

As classes dessa pasta utilizam PHP puro e são responsáveis pela lógica principal do sistema.

#### `Database.php`

Responsável pela conexão com o banco de dados utilizando **PDO**.

A conexão utiliza o padrão **Singleton**, garantindo um ponto centralizado para acesso ao banco de dados.

#### `Response.php`

Classe auxiliar responsável por padronizar as respostas da API em formato **JSON**.

Isso permite que os endpoints retornem informações de maneira organizada e consistente.

#### `Auth.php`

Responsável pelas funcionalidades relacionadas à autenticação e segurança dos usuários:

- Registro;
- Login;
- Logout;
- Controle de sessão;
- Proteção CSRF;
- Controle de papéis e permissões.

#### `Occurrence.php`

Responsável pelas regras relacionadas às ocorrências ambientais.

Principais responsabilidades:

- Criar ocorrências;
- Listar ocorrências;
- Excluir ocorrências;
- Associar ocorrências aos usuários;
- Realizar a contagem de ocorrências cadastradas por cada usuário.

---

### `api/`

A pasta `api` representa a **porta de entrada HTTP da aplicação**.

Os arquivos presentes nela recebem as requisições do frontend, utilizam as classes da camada `src` e retornam as informações em formato JSON.

#### Autenticação

```text
api/auth/
├── register.php
├── login.php
├── logout.php
└── me.php
```

Endpoints responsáveis pelo gerenciamento da autenticação dos usuários.

#### Ocorrências

```text
api/occurrences/
├── list.php
├── create.php
└── delete.php
```

Endpoints responsáveis pelas operações relacionadas às ocorrências ambientais.

#### Administração

```text
api/admin/
├── users.php
└── logs.php
```

Endpoints utilizados pela área administrativa para gerenciamento e consulta de informações do sistema.

---

### `public/`

Contém todos os arquivos acessados diretamente pelo navegador.

Essa camada representa o **frontend da aplicação**.

#### Páginas principais

| Arquivo | Descrição |
|---|---|
| `index.html` | Dashboard principal com o mapa e as ocorrências |
| `login.html` | Página de autenticação |
| `register.html` | Página de cadastro de usuários |
| `admin.html` | Painel administrativo |

#### CSS

```text
public/css/
└── styles.css
```

Responsável pela estilização e aparência visual da aplicação.

#### JavaScript

```text
public/js/
├── api.js
├── auth.js
├── dashboard.js
└── admin.js
```

Cada arquivo possui uma responsabilidade específica:

- **api.js:** comunicação entre o frontend e a API;
- **auth.js:** gerenciamento da autenticação no frontend;
- **dashboard.js:** funcionamento do mapa e das ocorrências;
- **admin.js:** funcionalidades do painel administrativo.

---

# Fluxo de Funcionamento

O funcionamento da aplicação segue o fluxo abaixo:

```text
Usuário
   ↓
Frontend
(public/)
   ↓
Requisição HTTP
   ↓
API
(api/)
   ↓
Regras de Negócio
(src/)
   ↓
Banco de Dados
(database/)
```

### Exemplo de sinalização de uma ocorrência

1. O usuário realiza o login na plataforma;
2. Acessa o dashboard principal;
3. Visualiza o mapa da região;
4. Localiza a rua ou área onde identificou um problema ambiental;
5. Clica no ponto desejado do mapa;
6. Seleciona o tipo de ocorrência;
7. A ocorrência é enviada para a API;
8. A API processa os dados através da camada de domínio;
9. As informações são armazenadas no banco de dados;
10. O ponto sinalizado passa a ficar disponível para visualização dos usuários da aplicação.

---

# Tecnologias Utilizadas

O projeto utiliza uma arquitetura baseada em tecnologias web:

### Backend

- **PHP**
- **PDO**
- **API REST**
- **Sessões**
- **JSON**

### Frontend

- **HTML5**
- **CSS3**
- **JavaScript**

### Banco de Dados

- Banco de dados relacional;
- Estrutura definida através do arquivo `schema.sql`.

---

# Objetivo Acadêmico

Este projeto foi desenvolvido com o objetivo de aplicar conhecimentos adquiridos durante a graduação, envolvendo conceitos como:

- Desenvolvimento Web;
- Arquitetura de Software;
- Separação de Responsabilidades;
- Programação Orientada a Objetos;
- Desenvolvimento de APIs;
- Comunicação entre Frontend e Backend;
- Autenticação e Controle de Sessão;
- Segurança em aplicações web;
- Banco de Dados;
- CRUD;
- Sistemas colaborativos;
- Aplicação da tecnologia na solução de problemas ambientais.

Além do aspecto técnico, o projeto busca demonstrar como uma aplicação web pode ser utilizada para **conectar a população a informações importantes sobre problemas ambientais presentes nas cidades**.

---

# Objetivo do Sistema

A proposta principal é disponibilizar uma plataforma onde os próprios usuários possam colaborar com a identificação de situações ambientais que afetam suas regiões.

Ao permitir a marcação de ocorrências como **enchentes, erosões e quedas de talude diretamente no mapa**, o sistema transforma informações individuais em um painel coletivo de visualização.

Assim, a aplicação pode ajudar os usuários a:

- Identificar áreas com problemas ambientais;
- Visualizar ocorrências registradas por outros usuários;
- Compartilhar informações sobre situações de risco;
- Aumentar a conscientização ambiental;
- Facilitar a visualização geográfica dos problemas enfrentados pelas cidades.

---

## Estrutura e Organização

O projeto foi desenvolvido seguindo uma organização que busca facilitar sua manutenção e evolução:

> **`public` → Interface do usuário**  
> **`api` → Comunicação HTTP**  
> **`src` → Regras de negócio**  
> **`database` → Estrutura dos dados**  
> **`config` → Configurações da aplicação**

Essa separação permite uma arquitetura mais organizada, evitando que regras de negócio, acesso ao banco de dados e interface do usuário fiquem concentrados no mesmo local.

---

## Autor

Projeto desenvolvido como **trabalho acadêmico**, com foco na aplicação de tecnologias web para a criação de uma solução voltada ao **monitoramento colaborativo de ocorrências ambientais urbanas**.