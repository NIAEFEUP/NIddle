################################################################################################
# Makefile
################################################################################################

#-----------------------------------------------------------------------------------------------
# Shell variables
#-----------------------------------------------------------------------------------------------

# Console text colors :)
BOLD=$(shell tput bold)
RED=$(shell tput setaf 1)
GREEN=$(shell tput setaf 2)
YELLOW=$(shell tput setaf 3)
RESET=$(shell tput sgr0)

VENV_DIR = venv
VENV_PYTHON = $(VENV_DIR)/bin/python
VENV_PIP = $(VENV_DIR)/bin/pip
REQUIREMENTS = requirements-local.txt

# Local
LOCAL_PYTHON = python3


#-----------------------------------------------------------------------------------------------
# Tasks
#-----------------------------------------------------------------------------------------------
.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


#-----------------------------------------------------------------------------------------------
# Local
#-----------------------------------------------------------------------------------------------

.PHONY: setup
setup: venv install ## Create virtual environment and install dependencies
	@echo "$(BOLD)$(YELLOW)Setup complete! Activate the environment with: source $(VENV_DIR)/bin/activate"

.PHONY: venv
venv: ## Create the virtual environment
	@echo "$(BOLD)Creating virtual environment...$(RESET)"
	@$(LOCAL_PYTHON) -m venv $(VENV_DIR)
	@echo "$(BOLD)$(GREEN)Virtual environment created at $(VENV_DIR)/$(RESET)"

.PHONY: install
install: ## Install dependencies (requires existing venv)
	@echo "$(BOLD)Installing dependencies...$(RESET)"
	@$(VENV_PIP) install --upgrade pip
	@$(VENV_PIP) install -r $(REQUIREMENTS)
	@echo "$(BOLD)$(GREEN)Dependencies installed successfully!$(RESET)"

.PHONY: dev
dev: ## Run the FastAPI app in development mode with auto-reload
	@echo "$(BOLD)$(YELLOW)Starting FastAPI development server...$(RESET)"
	@$(VENV_PYTHON) -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

.PHONY: lint
lint: ## Run linting and formatting checks with ruff
	@echo "$(BOLD)$(YELLOW)Running ruff linting and format checks...$(RESET)"
	@$(VENV_PIP) install -q ruff
	@$(VENV_PYTHON) -m ruff check .
	@$(VENV_PYTHON) -m ruff format --check .
	@echo "$(BOLD)$(GREEN)Linting checks completed!$(RESET)"

.PHONY: format
format: ## Format code and fix linting issues with ruff
	@echo "$(BOLD)$(YELLOW)Formatting code and fixing linting issues...$(RESET)"
	@$(VENV_PIP) install -q ruff
	@$(VENV_PYTHON) -m ruff check . --fix
	@$(VENV_PYTHON) -m ruff format .
	@echo "$(BOLD)$(GREEN)Code formatted successfully!$(RESET)"


#-----------------------------------------------------------------------------------------------
# Docker compose - API
#-----------------------------------------------------------------------------------------------
