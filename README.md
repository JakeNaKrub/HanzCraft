# HanzCraft 汉字工坊

Welcome to **HanzCraft**, an interactive web application inspired by Minecraft's crafting system, designed to make learning Chinese characters a fun and creative experience. Discover and learn Chinese characters by combining their fundamental building blocks, known as radicals.

*> This project was built with the assistance of the AI coding agent in [Firebase Studio](https://firebase.google.com/studio).*

## Core Features

-   **Radical Catalogue**: Browse a user-friendly catalogue of radicals, the building blocks of Chinese characters. Simply drag and drop them to start crafting.
-   **Crafting Grid**: A 2x2 "crafting table" where you can arrange radicals to form new characters.
-   **Character Validation**: HanzCraft instantly checks if your combination of radicals forms a valid Chinese character based on its internal dictionary.
-   **AI-Powered Suggestions**: Feeling stuck? Place some radicals on the grid and use the AI assistant to get suggestions for possible characters you can create.
-   **Character Information**: When you successfully craft a character, the app displays its meaning, pinyin (pronunciation), and an example of its usage.
-   **Personal Collection**: Save your successfully crafted characters to a personal collection to track your discoveries.
-   **Challenge Mode**: Test your skills by taking on challenges to create specific characters using a limited set of radicals.

## How to Play

1.  **Select Radicals**: Go to the "Radicals" tab to see all the available building blocks.
2.  **Drag and Drop**: Drag your chosen radicals onto the 2x2 Crafting Table.
3.  **Arrange and Craft**: Position the radicals to match the structure of a real character (e.g., left-right or top-bottom) and hit the "Craft" button.
4.  **Discover**: If your combination is correct, the character will appear! You can then save it to your collection.
5.  **Get Hints**: If you're not sure what to build, place a few radicals on the grid and click "Suggest Characters" for AI-powered ideas.
6.  **Try Challenges**: Navigate to the "Challenges" tab to test your knowledge with specific goals.

## Tech Stack

This project is built with a modern, performant, and type-safe tech stack:

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **UI Library**: [React](https://reactjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) (via Google Gemini)
-   **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or newer recommended)
-   npm or your favorite package manager

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/hanzcraft.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd hanzcraft
    ```
3.  **Install NPM packages:**
    ```sh
    npm install
    ```

### Running the Development Server

To start the app in development mode, run:

```sh
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.
