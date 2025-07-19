# NIddle

## Prerequisites

-   Python 3.12 or higher
-   pip package manager

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd NIddle
```

### 2. Set up the development environment

Use the provided Makefile to create a virtual environment and install dependencies:

```bash
make setup
```

This command will:

-   Create a virtual environment in the `venv/` directory
-   Install all required dependencies from `requirements-local.txt`

### 3. Activate the virtual environment

```bash
source venv/bin/activate
```

## Running the Development Server

To start the FastAPI development server with auto-reload:

```bash
make dev
```

The API will be available at:

-   **API**: http://localhost:8000
-   **Interactive API docs (Swagger)**: http://localhost:8000/docs
-   **Alternative API docs (ReDoc)**: http://localhost:8000/redoc

## Available Make Commands

You can see all available commands by running:

```bash
make help
```

Common commands:

-   `make setup` - Create virtual environment and install dependencies
-   `make dev` - Run the FastAPI app in development mode with auto-reload
-   `make lint` - Run linting and formatting checks with ruff
-   `make format` - Format code and fix linting issues with ruff
