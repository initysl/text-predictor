# Deploying to Railway

The app deploys as **two Railway services from this one repo**:

| Service | Root directory | Serves | Dockerfile |
|---|---|---|---|
| `server` | `/server` | FastAPI on `$PORT` | `server/Dockerfile` |
| `client` | `/client` | Static build via `serve` on `$PORT` | `client/Dockerfile` |

Railway detects each Dockerfile automatically once the root directory is set. Both images already listen on the `PORT` that Railway injects, so no start command is needed.

> `docker-compose.yml` is for local use only. Railway doesn't read it.

---

## 1. Create the project

1. In Railway, create a project from the GitHub repo `initysl/text-predictor`.
2. Railway creates one service. Rename it `server`.
3. Click **+ New → GitHub Repo** and pick the same repo again. Name the second service `client`.

## 2. Configure `server`

**Settings**

| Setting | Value |
|---|---|
| Source → Root Directory | `/server` |
| Source → Watch Paths | `/server/**` |
| Networking | **Generate Domain** (e.g. `server-production-xxxx.up.railway.app`) |
| Deploy → Healthcheck Path | `/health` |

**Variables**

| Variable | Value |
|---|---|
| `CORS_ORIGINS` | The client's public URL, e.g. `https://text-predictor.up.railway.app` |

- `CORS_ORIGINS` is comma-separated. Include `http://localhost:5173` too if you want to point a local client at production.
- If it isn't set, the API **only** allows `http://localhost:5173`, and the deployed client will fail with CORS errors.
- Don't set `PORT` yourself; Railway provides it.

**Resources:** loading the models takes about **7 s** and about **550 MB of RAM** (535 MB measured locally). Make sure your plan's per-service memory limit allows at least 1 GB, or the service will be OOM-killed on boot.

## 3. Configure `client`

**Settings**

| Setting | Value |
|---|---|
| Source → Root Directory | `/client` |
| Source → Watch Paths | `/client/**` |
| Networking | **Generate Domain** (e.g. `text-predictor.up.railway.app`) |

**Variables**

| Variable | Value |
|---|---|
| `VITE_API_URL` | The server's public URL, e.g. `https://server-production-xxxx.up.railway.app` (no trailing slash needed) |

`VITE_API_URL` is baked into the JavaScript **at build time**. Railway passes service variables to the Dockerfile's `ARG VITE_API_URL` during the build. So:

- Set the variable **before** the first build. Without it, the build falls back to `http://localhost:8000`, and every request fails with "Can't reach the prediction server".
- After changing it, **redeploy** the client. Restarting it isn't enough.

You can use Railway's reference syntax so the variable follows the server's domain automatically:

```
VITE_API_URL=https://${{server.RAILWAY_PUBLIC_DOMAIN}}
```

## 4. Wire the two URLs together

The two services need each other's URLs, so do it in this order:

1. Generate domains for both services. You can do this before anything builds.
2. Set `CORS_ORIGINS` on `server` to the client domain.
3. Set `VITE_API_URL` on `client` to the server domain.
4. Deploy (or redeploy) both.

## 5. Verify

```bash
SERVER=https://server-production-xxxx.up.railway.app

curl $SERVER/health
# {"status":"healthy","models_loaded":true,...}

curl -X POST $SERVER/predict -H 'content-type: application/json' \
  -d '{"text":"new york","top_k":3}'
# "source":"trigram", predictions City / Times / ,

curl $SERVER/stats
# includes an "evaluation" block
```

Then open the client URL and check the following:

- The header shows **Model online**.
- Typing shows ghost text, and Tab accepts it.
- The "Model insights" panel has numbers in it.
- The browser console has no CORS errors.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Header says **Offline**; console shows CORS errors | `CORS_ORIGINS` on `server` doesn't exactly match the client origin (scheme included, no trailing slash). Fix it, and the server redeploys. |
| Client requests go to `localhost:8000` or `/api` | `VITE_API_URL` wasn't set when the client was built. Set it and **redeploy** the client. |
| Server deploy fails its healthcheck | Check the deploy logs for `Models loaded successfully!`. An OOM kill or a crash during load means the service needs more memory (see the Resources note in step 2). |
| Server build is missing models | The `.pkl` files in `server/models/` must be committed. They're copied into the image (`COPY models/ ./models/`), and `server/.dockerignore` only excludes `data/` and `tests/`. |
| Pushing client changes redeploys the server (or vice versa) | Set **Watch Paths** on each service as shown above. |
| Deep links 404 | They shouldn't: `serve -s` falls back to `index.html`. If you change the client server, keep SPA fallback. |

## Updating the models

The models ship inside the server image, so to deploy retrained models:

1. Run `python core/train.py` and `python core/evaluate.py` locally (see the README).
2. Commit the updated `server/models/*.pkl`.
3. Push. The `server` service rebuilds; the client is unaffected.

## Optional: Railway CLI

Deploys normally happen on push through the GitHub integration. The CLI is handy for logs and variables:

```bash
npm i -g @railway/cli
railway login
railway link                    # pick the project
railway logs --service server
railway variables --service client
```
