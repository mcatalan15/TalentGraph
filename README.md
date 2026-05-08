# TalentGraph

This workspace boots two TypeScript containers:

- `api`: Fastify on port `3000`
- `client`: Vue + Vite on port `8080`

Run them with:

```bash
make up
```

Then open:

- Client: http://localhost:8080
- API health: http://localhost:3000/health
