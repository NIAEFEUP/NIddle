{
  description = "A Nix flake for the development of NIddle.";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ...
  } @ inputs:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {inherit system;};
      in {
        formatter = pkgs.alejandra;

        devShells.default = pkgs.mkShell {
          packages = [
            (pkgs.python312.withPackages (pypkgs:
              with pypkgs; [
                fastapi
                uvicorn
                ruff
              ]))
          ];

          shellHook = ''
            help() {
              echo "dev                            Run the FastAPI app in development mode with auto-reload"
              echo "lint                           Run linting and formatting checks with ruff"
              echo "format                         Format code and fix linting issues with ruff"
            }

            dev() {
              echo "Starting FastAPI development server..."
              uvicorn main:app --reload --host 0.0.0.0 --port 8000
            }

            lint() {
              echo "Running ruff linting and format checks..."
              ruff check .
              ruff format --check .
              echo "Linting checks completed!"
            }

            format() {
              echo "Formatting code and fixing linting issues..."
              ruff check . --fix
              ruff format .
              echo "Code formatted successfully!"
            }
          '';
        };
      }
    );
}
