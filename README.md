<div align="center">

# 🌿 Lawn Starter Take Home Exercise

![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-Lighthouse-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

> Ambiente fullstack com **Laravel + React + GraphQL + PostgreSQL**, totalmente rodando em **Docker Compose**.

</div>

---

## 🚀 Stack

- **Backend:** Laravel 12 + Lighthouse (GraphQL)  
- **Frontend:** React 19 + Vite + TailwindCSS  
- **Banco:** PostgreSQL 16  
- **Infra:** Docker Compose + Scheduler Worker  

---

## ⚙️ Configuração

1️⃣ Crie o arquivo `.env`  
```bash
cp .env.example .env
```

Configure o banco:
```env
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=lawn-starter-take-home-exercise
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

---

## 🐳 Subindo o ambiente

```bash
docker compose up -d --build
```

A aplicação ficará disponível em:
- 🌐 [http://localhost:8000](http://localhost:8000) → Laravel + React  
- ⚡ [http://localhost:5173](http://localhost:5173) → Vite Dev Server  

Containers criados:
- `lawn_app` → Laravel (PHP-FPM)  
- `lawn_vite` → Frontend (Vite)  
- `lawn_db` → PostgreSQL  
- `lawn_scheduler` → Executa `php artisan schedule:work`  

---

## 🧪 Rodando os Testes

Os testes utilizam **PHPUnit** via **Artisan**, e podem ser executados diretamente dentro do container Docker principal (`app`).

### 🔹 Rodar todos os testes

```bash
docker compose exec app php artisan test
```

### 🔹 Rodar testes específicos (por filtro)

```bash
docker compose exec app php artisan test --filter=SwapiMoviesTest
```

### 🔹 Com modo debug detalhado

```bash
docker compose exec app php artisan test --filter=SwapiMoviesTest --debug
```

### 🔹 Entrar no container e testar manualmente

```bash
docker compose exec app bash
php artisan test
```

### 🔹 Alias opcional (para Linux/macOS)

Para facilitar o uso, adicione ao seu `~/.bashrc` ou `~/.zshrc`:

```bash
alias test-docker='docker compose exec app php artisan test'
```

Agora você pode rodar diretamente:

```bash
test-docker --filter=SwapiPeopleTest
```

---

## 🧾 GraphQL Schemas

A API utiliza o **Lighthouse** (GraphQL para Laravel) e expõe dois principais tipos: `SwapiPerson` e `Film`.

### 🔹 Schema: SwapiPerson

```graphql
type SwapiPerson {
  name: String
  uid: String
  url: String
  films: [FilmWithoutCharacters]
    @field(resolver: "App\GraphQL\Resolvers\SwapiPeopleResolver@films")
}
```

### 🔹 Schema: Film

```graphql
type Film {
  title: String
  openingCrawl: String
  uid: String
  url: String
  characters: [PersonWithoutFilms]
    @field(resolver: "App\GraphQL\Resolvers\SwapiMoviesResolver@characters")
}
```

---

### 🔹 Queries principais

```graphql
# Buscar pessoas
query GetPeople($name: String!) {
  swapiPeople(name: $name) {
    name
    uid
    url
  }
}

# Buscar filmes
query GetMovies($title: String!) {
  swapiMovies(title: $title) {
    title
    uid
    url
  }
}

# Detalhes de uma pessoa
query Person($id: Int!) {
  swapiPerson(id: $id) {
    name
    details {
      birthYear
      gender
      height
      mass
      hairColor
      eyeColor
    }
    films {
      title
      uid
      url
    }
  }
}

# Detalhes de um filme
query Movie($id: Int!) {
  swapiMovie(id: $id) {
    title
    openingCrawl
    characters {
      name
      uid
      url
    }
  }
}
```

Essas queries são consumidas no frontend via **Apollo Client (React)**, com `useLazyQuery`.

---

## 🧠 Dica para chips Apple (M1 / M2 / M3)

Se o seu Mac for **ARM-based**, o Docker fará o *pull* automático das imagens compatíveis (`linux/arm64`).

👉 Mas, se algum build falhar por causa de dependências nativas (exemplo: pacotes `libpq-dev` ou `gd` do PHP), basta forçar a arquitetura **x86 (amd64)** com o comando abaixo:

```bash
docker compose build --build-arg TARGETARCH=amd64
```

---

## 👨‍💻 Autor

Desenvolvido por **William Müller**  
📍 Santa Catarina - Brasil  
🚀 Focado em **tecnologias modernas e desenvolvimento de software de alta qualidade**