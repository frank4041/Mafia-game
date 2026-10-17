# Police & Thief (Mafia Game) 🕵️‍♂️🔦

An interactive social deduction web game built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite**.

Players take on hidden roles in a village and must use strategy, deduction, and deception to win.

---

## 🎮 Game Overview

In **Police & Thief**, each player is assigned a secret role:
* **👮 Police (Detective):** Investigates suspicious villagers during the night to discover who the Thieves are.
* **🩺 Doctor:** Selects one villager to protect each night from being attacked.
* **🥷 Thief (Mafia):** Chooses a victim to eliminate in the dark.
* **🧑‍🌾 Civilian (Villager):** Solves the mystery during the day discussions and votes to eliminate the thieves.

---

## 🔄 Game Phases

1. **Night Phase:**
   - The village goes to sleep.
   - Thieves choose a target to rob / eliminate.
   - The Police investigates a player's true identity.
   - The Doctor protects a villager from harm.

2. **Morning & Daytime Phase:**
   - The village awakens and discovers what occurred overnight.
   - Players debate, share observations, and discuss suspicions in the town square.

3. **Voting Phase:**
   - The village votes on who to accuse and banish.

4. **Victory Conditions:**
   - **Village Wins:** All thieves are eliminated.
   - **Thieves Win:** The thieves outnumber or equal the surviving village members.

---

## 🚀 Tech Stack

- **Framework:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Bundler & Dev Server:** Vite 6

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn` or `pnpm`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/frank4041/Mafia-game.git
   cd Mafia-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

### Building for Production

To create an optimized production build:
```bash
npm run build
```

To run type checking:
```bash
npm run typecheck
```

---

## 📄 License

MIT
