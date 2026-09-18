# Hiraya Marketing — Python version

This folder is a Flask migration of the original TanStack React/TypeScript application.

## Run locally

1. Create a virtual environment: `python -m venv .venv`
2. Activate it.
3. Install dependencies: `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and fill in the values.
5. Run: `python app.py`
6. Open http://localhost:5000

## Architecture

- Flask handles routing, authentication flow, forms and server-side rendering.
- Jinja2 replaces React/TanStack route components.
- Supabase remains the database/auth layer, so the existing SQL schema and row-level security can be reused.
- CSS is plain CSS with the original Hiraya palette rather than Tailwind build-time utilities.
- Browser-side JavaScript is intentionally minimal; code that must run in the browser cannot be converted into Python without changing the web architecture.
- The original TypeScript UI remains untouched on the main branch. This migration is isolated in `python_app/` on the `python-migration` branch.

## Production

Use a WSGI server such as Gunicorn:

`gunicorn -w 2 -b 0.0.0.0:5000 app:app`

Set a strong `FLASK_SECRET_KEY` and the Supabase environment variables in the deployment platform.
