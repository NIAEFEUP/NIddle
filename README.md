# NIddle

[![CI status](https://github.com/NIAEFEUP/NIddle/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/NIAEFEUP/NIddle/actions/workflows/ci.yml)

## Overview

NIddle is a middleware service that acts as an interface between the official University of Porto website (Sigarra) and the UNI mobile application. The primary goal of NIddle is to provide a stable, modern, and reliable API for the UNI app, abstracting away the complexities of the Sigarra website.

This approach allows for a more agile development process for the UNI mobile app, as changes in Sigarra can be handled by NIddle without requiring a new release of the mobile app. Additionally, NIddle introduces custom functionalities not available in Sigarra, such as a custom announcement system.

## Features

- **Stable API**: Provides a consistent API for schedules, exams, and other university data, protecting the mobile app from changes in the underlying source.
- **Decoupled Architecture**: Separates the mobile app from the university's web services, allowing for independent development and deployment cycles.
- **Extensible**: Easily add new features and endpoints to support the mobile app.
- **Custom Functionalities**: Includes additional features not present in Sigarra, such as a dedicated announcement system.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v22.x recommended)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Local Development

1.  **Clone the repository**

    ```bash
    git clone https://github.com/NIAEFEUP/NIddle
    cd NIddle
    ```

2.  **Set up environment variables**

    Copy the example environment file to `.env.local` for local development.

    ```bash
    cp .env.example .env.local
    ```

    Now, open `.env.local` and fill in the required variables.

3.  **Start the database**

    NIddle requires a PostgreSQL database. Use Docker Compose to start a local instance:

    ```bash
    docker-compose up -d
    ```

4.  **Install dependencies**

    ```bash
    npm install
    ```

5.  **Run the application**

    ```bash
    npm run start:dev
    ```

    The application will be running in watch mode at `http://localhost:3000`.

## Docker

NIddle is fully containerized and can be easily built and run as a Docker image.

### Building the Image

1.  **Set up Docker environment variables**

    Copy the example environment file to `.env.docker`.

    ```bash
    cp .env.example .env.docker
    ```

    Open `.env.docker` and configure the variables for the Docker environment.

2.  **Run the build script**

    The `build_image.sh` script will build the Docker image for you.

    ```bash
    ./build_image.sh
    ```

### Running the Image

-   **Run the run script**

    The `run_image.sh` script will start a container from the image you just built.

    ```bash
    ./run_image.sh
    ```

## Available Scripts

-   `npm run build`: Compiles the project.
-   `npm run format`: Formats the code using Prettier.
-   `npm run start:prod`: Starts the application in production mode.
-   `npm run start:dev`: Starts the application in development mode with watch.
-   `npm run lint`: Lints the codebase.
-   `npm test`: Runs unit tests.
-   `npm run test:e2e`: Runs end-to-end tests.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.
