
<div align="center">

# 🌿 Lawn Starter Take Home Exercise

![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-Lighthouse-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

> Fullstack environment with **Laravel + React + GraphQL + PostgreSQL**, , fully running in **Docker Compose**.

</div>

---

## 🚀 Stack

- **Backend:** Laravel 12 + Lighthouse (GraphQL)  
- **Frontend:** React 19 + Vite + TailwindCSS  
- **Database:** PostgreSQL 16  
- **Infra:** Docker Compose + Scheduler Worker  

---

## ⚙️ Configutarion

1️⃣ Create the file `.env`  
```bash
cp .env.example .env
```

Configure the database:
```env
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=lawn-starter-take-home-exercise
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

---

## 🐳 Starting the environment

```bash
docker compose up -d --build
```

A aplicação ficará disponível em:
- 🌐 [http://localhost:8000](http://localhost:8000) → Laravel + React  
- ⚡ [http://localhost:5173](http://localhost:5173) → Vite Dev Server  

The application will be available at:
- `lawn_app` → Laravel (PHP-FPM)  
- `lawn_vite` → Frontend (Vite)  
- `lawn_db` → PostgreSQL  
- `lawn_scheduler` → Executa `php artisan schedule:work`  

---

## 💡 Integration with VS Code (Dev Containers)

This project already includes configuration for **Dev Container** (`.devcontainer/devcontainer.json`), allowing you to open the complete environment directly in **VS Code**, with PHP, Composer, and dependencies automatically recognized.

Just open the project in VS Code and choose:  
👉 **“Reopen in Container”** (via extension *Dev Containers*).

---

## 🧪 Running the Tests

The tests use **PHPUnit** via **Artisan**, and can be executed directly inside the main Docker container (`app`).

### 🔹 Run all tests

```bash
docker compose exec app php artisan test
```

### 🔹 Run specific tests (by filter)

```bash
docker compose exec app php artisan test --filter=SwapiMoviesTest
```

### 🔹 With detailed debug mode

```bash
docker compose exec app php artisan test --debug
```

### 🔹 Enter the container and test manually

```bash
docker compose exec app bash
php artisan test
```

### 💡 **Note – Running tests inside the Dev Container**

If you are using the **Dev Container** in VS Code:

- **Do not use** `docker compose exec app ...`
- Just open the integrated terminal and run directly:  

```bash
php artisan test
```

or, for specific tests:

```bash
php artisan test --filter=SwapiPeopleTest
```

VS Code will already be connected to the container `app`, with PHP and Composer from Docker.

---

## 🧾 GraphQL Schemas

The API uses **Lighthouse** (GraphQL for Laravel) and exposes two main types: `SwapiPerson` e `Film`.

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

### 🔹 Queries

```graphql
query GetPeople($name: String!) {
  swapiPeople(name: $name) {
    name
    uid
    url
  }
}

query GetMovies($title: String!) {
  swapiMovies(title: $title) {
    title
    uid
    url
  }
}

# Person details
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

# Movie Details
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

These queries are consumed on the frontend via **Apollo Client (React)**, with `useLazyQuery`.

---

## 📊 Statistics (GraphQL Logs)

The system automatically collects usage statistics of GraphQL query root fields, recorded in the table `graphql_logs`.  
This information is periodically processed by the internal command `php artisan schemas:process`, which populates the history tables.

### 🔹Calculated Metrics
| Metric | Description | Table |
|----------|------------|--------|
| **topFields** | The 5 *root fields* most used, with count and relative percentage. | `schemas_stats_top_five` |
| **AverageDuration** | Average execution time per *root field*. | `schemas_stats_average_duration` |
| **BusiestHourToday** | Hour of (0–23h) with the highest number of accesses. | `schemas_stats_most_popular_hour` |

This data is exposed via GraphQL by the `StatisticsResolver` and displayed on the frontend at `/stats`.

> 💡 **Note:** The statistics calculation process runs automatically whenever the Docker environment starts, through the container `lawn_scheduler`, which continuously runs the command `php artisan schedule:work`.

---

## 🧠 Tip for Apple chips (M1 / M2 / M3)

If your Mac is **ARM-based**, Docker will perform the *pull* automatic pull of compatible images (`linux/arm64`).

👉 But if any build fails due to native dependencies (for example: packages `libpq-dev` ou `gd` do PHP), just force the architecture **x86 (amd64)** with the command below:

```bash
docker compose build --build-arg TARGETARCH=amd64
```

---

## 👨‍💻 Author

Developed by **William Müller**  
📍 Santa Catarina - Brazil  
🚀 Focused on **tecnologias modernas e desenvolvimento de software de alta qualidade**
