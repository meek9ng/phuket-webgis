# Phuket WebGIS

Interactive WebGIS for Phuket land use & livability analysis.

## Local development

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Open http://127.0.0.1:8000

## Deployment (Render)

This repo includes `render.yaml`. To deploy:

1. Push this repo to GitHub.
2. Go to https://dashboard.render.com → New → Blueprint.
3. Connect the GitHub repo. Render reads `render.yaml` and provisions the service.
4. Wait for build to finish; your URL will be `https://phuket-webgis.onrender.com`.

Note: the free plan spins down after 15 min idle (first request after sleep takes ~30s to wake).
