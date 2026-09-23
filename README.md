# GameKnight

**A real-time multiplayer party game platform built with React, Spring Boot, WebSockets, and Azure.**

GameKnight lets players create interactive quiz and voting games, join instantly by QR code or game code, and participate in live rounds with synchronized gameplay across multiple devices.

---

## ✨ Features

* 🎲 Create multiplayer quiz or party games.
* 📱 Join games using a **6-digit game code** or QR code.
* ⚡ Real-time gameplay powered by **WebSockets (STOMP)**.
* 🖼️ Upload images for questions and answers.
* ☁️ Store game assets in **Azure Blob Storage**.
* 👥 Multiple players connected to a shared game session.
* 🗳️ Live voting with instant updates to every connected player.
* 📊 Host-controlled game flow with synchronized game phases.

---

## 🏗️ Architecture

```text
                  +-----------------------+
                  |    React Frontend     |
                  |  Vite + TypeScript    |
                  +----------+------------+
                             |
                 REST API + STOMP WebSocket
                             |
            +----------------+----------------+
            |                                 |
   Spring Boot API                  WebSocket Broker
 Game Management                   Live Game Events
            |                                 |
            +----------------+----------------+
                             |
                     Azure Blob Storage
              Images, QR Codes & Game Assets
```

The frontend communicates with the backend using:

* **REST APIs** for creating games and loading game data.
* **STOMP over WebSockets** for real-time player events, voting, and game state updates.

---

## 🛠️ Tech Stack

| Frontend     | Backend                  | Cloud / Storage    |
| ------------ | ------------------------ | ------------------ |
| React 19     | Spring Boot 3            | Azure Blob Storage |
| TypeScript   | Java 21                  | Azure              |
| Vite         | Spring WebSocket (STOMP) | Docker             |
| Tailwind CSS | Spring Data JPA          | MySQL              |
| React Router | Hibernate                | QR Code Generator  |

---

## 📸 Screenshots

> *Add screenshots here once deployed.*

### Create Game

![Create Game Screenshot](docs/create-game.png)

### Join Game

![Join Game Screenshot](docs/join-game.png)

### Player Voting

![Voting Screenshot](docs/player-voting.png)

---

## 🚀 How It Works

### 1. Host creates a game

The host creates a game with:

* Game title.
* Questions.
* Up to four answers per question.
* Optional images.

A unique **6-digit game code** is generated along with a QR code.

### 2. Players join

Players can:

* Scan the QR code.
* Enter the game code manually.

Their details are stored locally so they can reconnect if needed.

### 3. Real-time gameplay

Players automatically receive updates when:

* A new question starts.
* Voting opens.
* Results are revealed.
* The game advances to the next phase.

No page refreshes are required.

---

## 📂 Project Structure

```text
gameknight/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   └── public/
│
├── backend/
│   ├── controller/
│   ├── service/
│   ├── websocket/
│   ├── model/
│   ├── repository/
│   └── config/
│
└── docker-compose.yml
```

---

## ⚙️ Running Locally

### Prerequisites

* Node.js 20+
* Java 21
* Maven
* Docker Desktop
* Azure Storage Account (or Azurite)

### Backend

```bash
cd backend

mvn spring-boot:run
```

Runs on:

```text
http://localhost:8080
```

### Frontend

```bash
cd frontend

npm install
npm run dev
```

Runs on:

```text
http://localhost:5173
```

---

## 🐳 Running with Docker

```bash
docker compose up -d
```

Starts:

* MySQL
* Spring Boot API
* Supporting services

---

## ☁️ Azure Blob Storage

Images uploaded by the host are stored in Azure Blob Storage.

Environment variables:

```properties
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_STORAGE_IMAGE_CONTAINER=game-images
AZURE_STORAGE_QR_CONTAINER=game-qrcodes
```

The backend uploads and retrieves images without exposing storage credentials to the frontend.

---

## 📡 WebSocket Events

| Destination                  | Purpose                      |
| ---------------------------- | ---------------------------- |
| `/app/join`                  | Player joins a game          |
| `/app/vote`                  | Player submits a vote        |
| `/topic/game/{gameCode}`     | Broadcast game state updates |
| `/topic/question/{gameCode}` | Send active question         |
| `/topic/results/{gameCode}`  | Reveal voting results        |

This allows every connected player to stay synchronized during gameplay.

---

## 💾 Data Model

Core entities include:

```text
Game
├── Questions
│   ├── Answers
│   └── Images
├── Players
└── Game State
```

Games are persisted with Spring Data JPA while active sessions are cached in memory before moving to Redis in future versions.

---

## 🧪 Future Improvements

* Redis-backed session management.
* Host dashboard with live analytics.
* Leaderboards and scoring.
* Timed rounds and countdowns.
* Authentication for game creators.
* Azure deployment with CI/CD.
* Reconnection support for disconnected players.

---

## 📚 What I Built

This project was built to learn and demonstrate:

* Real-time communication using **Spring WebSockets (STOMP)**.
* Building scalable REST APIs with **Spring Boot**.
* State management in a React multiplayer application.
* Image upload pipelines using **Azure Blob Storage**.
* Docker-based local development.
* Designing backend models and APIs for multiplayer game sessions.

---

## 👨‍💻 Author

**Victory Mpokosa**

Software Engineer focused on Java, React, Azure, and distributed backend systems.
