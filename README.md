# Proyecto de Gestión de Pedidos

Este repositorio contiene el código para el proyecto de Gestión de Pedidos, que incluye un backend Django y un frontend.

## Configuración del entorno

Para configurar el entorno de desarrollo:

1. Consulta las instrucciones en [venv_setup.md](venv_setup.md) para inicializar el entorno virtual
2. Activa el entorno virtual según tu sistema operativo
3. Instala las dependencias con `pip install -r requirements.txt`

## Estructura del proyecto

- `gestionPedidos/`: Aplicación backend de Django
- `frontend-pedidos/`: Componente frontend del proyecto
- `requirements.txt`: Lista de dependencias de Python

## Ejecución de pruebas

Para ejecutar las pruebas:

```
pytest
```

## Documentación de la API

La API cuenta con documentación interactiva disponible en los siguientes enlaces:

- [Swagger UI](https://backend-pedidos.fly.dev/swagger/)
- [ReDoc](https://backend-pedidos.fly.dev/redoc/)


# Virtual Environment Setup

This document explains how to set up and use the Python virtual environment for this project.

## Setting up the virtual environment

The virtual environment has already been created in the `venv` directory. To use it:

### On Windows:
```
venv\Scripts\activate
```

### On macOS/Linux:
```
source venv/bin/activate
```

## Installing dependencies

After activating the virtual environment, install the required dependencies:

```
pip install -r requirements.txt
```

## Deactivating the virtual environment

When you're done working on the project, you can deactivate the virtual environment:

```
deactivate
```

## Notes

- Always make sure the virtual environment is activated before working on the project
- If you add new dependencies to the project, update the requirements.txt file:
  ```
  pip freeze > requirements.txt
  ```
