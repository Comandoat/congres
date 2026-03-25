# Credentials — Référence

> ⚠️ Ce fichier ne contient PAS les valeurs des tokens.
> Les tokens sont fournis dans le contexte de conversation.
> L'utilisateur DOIT les révoquer après la session.

## Tokens disponibles
- **GitHub PAT** : Pour créer le repo `congres` et push le code
- **Vercel Token** : Pour créer le projet Vercel et déployer
- **Supabase Access Token** : Pour créer le projet et configurer les tables via MCP

## Variables d'environnement du projet
| Variable | Source | Usage |
|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Client-side Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Client-side Supabase (anon) |
