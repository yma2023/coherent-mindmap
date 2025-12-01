# Mind Map Application

A beautiful, interactive mind mapping application built with React and TypeScript. Create, organize, and visualize your ideas with an intuitive drag-and-drop interface.

## Screenshots

<img width="1229" height="787" alt="スクリーンショット 2025-12-01 22 07 09" src="https://github.com/user-attachments/assets/88603f86-6f5d-4700-98a0-3604ec78d8d9" />


## Features

- **Interactive Mind Maps**: Create and edit mind maps with an intuitive drag-and-drop interface
- **Node Management**: Add, edit, and delete nodes with ease
- **Visual Connections**: Connect ideas and concepts with customizable edges
- **Responsive Design**: Works seamlessly across different screen sizes
- **Modern UI**: Clean and beautiful interface built with Tailwind CSS
- **State Management**: Efficient state handling with Zustand
- **Real-time Updates**: Instant visual feedback as you build your mind maps

## Tech Stack

- **Frontend Framework**: React 18.3
- **Language**: TypeScript
- **Flow Library**: @xyflow/react 12.3
- **State Management**: Zustand 4.4
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React & React Icons
- **Build Tool**: Vite 6.3
- **Routing**: React Router DOM 7.8

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mindmap-vol5
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Project Structure

```
mindmap-vol5/
├── src/
│   ├── components/      # React components
│   │   ├── mindmap/    # Mind map specific components
│   │   ├── layout/     # Layout components
│   │   └── nodes/      # Custom node components
│   ├── hooks/          # Custom React hooks
│   ├── stores/         # Zustand state stores
│   ├── types/          # TypeScript type definitions
│   └── App.tsx         # Main application component
├── public/             # Static assets
└── index.html          # HTML entry point
```

## Usage

1. **Create Nodes**: Click on the canvas to add new nodes
2. **Edit Content**: Double-click on any node to edit its content
3. **Connect Ideas**: Drag from one node to another to create connections
4. **Organize**: Drag nodes around to arrange your mind map
5. **Delete**: Select a node and press delete or use the delete button

## Development

This project uses:
- **Vite** for fast development and building
- **TypeScript** for type safety
- **ESLint** for code quality
- **Tailwind CSS** for styling

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to any static hosting service.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and not licensed for public use.

## Contact

For questions or support, please open an issue in the repository.
