# CLAUDE.md — PhishQuiz Congrès Biologie Médicale

## Projet
Site web de sensibilisation au phishing pour un congrès de biologie médicale.
Public cible : médecins et internes, aucune connaissance en cybersécurité.
Accès via QR code sur smartphone.

**Auteurs** : Antoine CAPUCCIO & Noa BROCA

## Stack technique
- **Frontend** : Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Base de données** : Supabase (Postgres + Realtime)
- **Hébergement** : Vercel
- **Repo** : GitHub (`congres`)

## Architecture du projet

```
congres/
├── CLAUDE.md                    # Ce fichier — contexte pour Claude
├── .claude/
│   ├── memory.md                # Mémoire persistante brute (état, décisions, blocages)
│   ├── project-structure.md     # Structure fichiers du projet (mis à jour régulièrement)
│   ├── progress.md              # Avancement des tâches et phases
│   └── credentials.md           # Référence aux credentials (JAMAIS les valeurs)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Layout racine (dark theme, fonts)
│   │   ├── page.tsx             # Écran d'accueil (nom + commencer)
│   │   ├── quiz/
│   │   │   └── page.tsx         # Page du quiz (mails un par un)
│   │   ├── results/
│   │   │   └── page.tsx         # Page de correction
│   │   └── leaderboard/
│   │       └── page.tsx         # Classement temps réel
│   ├── components/
│   │   ├── ui/                  # Composants UI réutilisables
│   │   ├── mail-viewer.tsx      # Affichage mail avec zoom
│   │   ├── timer.tsx            # Timer par mail
│   │   ├── progress-bar.tsx     # Barre de progression
│   │   ├── score-display.tsx    # Affichage score final
│   │   └── leaderboard-table.tsx # Table du classement
│   ├── data/
│   │   └── mails.json           # Configuration des mails (images, réponses, indices)
│   ├── lib/
│   │   ├── supabase.ts          # Client Supabase (browser)
│   │   ├── supabase-server.ts   # Client Supabase (server)
│   │   └── scoring.ts           # Logique de scoring
│   └── types/
│       └── index.ts             # Types TypeScript
├── public/
│   └── mails/                   # Images des mails (ajoutées manuellement)
│       ├── mail-01.png
│       ├── mail-02.png
│       └── ...
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── README.md
```

## Parcours utilisateur (4 étapes)

1. **Accueil** → Saisie nom, bouton Commencer, lien Leaderboard
2. **Quiz** → Mails affichés un par un (images), boutons Phishing/Légitime, timer, barre progression, AUCUN feedback immédiat
3. **Correction** → Score final, rang, récap mail par mail (vert/rouge), explications, bouton Leaderboard
4. **Leaderboard** → Classement temps réel (Supabase Realtime), accessible depuis accueil + correction

## Scoring
- Bonne réponse : 100 pts + bonus rapidité = max(0, 50 - temps × 5)
- Mauvaise réponse : 0 pts
- Score total = somme

## Design
- **Mobile-first** obligatoire (QR code → smartphone)
- Dark theme, accents bleu/vert néon, style "cyber"
- Gros boutons (thumb-friendly)
- Animations légères (framer-motion)
- Images zoomables (tap pour agrandir)
- Responsive (leaderboard projetable sur grand écran)

## Supabase
- Table `scores` : id (uuid), player_name (text), score (int), correct_answers (int), total_questions (int), created_at (timestamptz)
- RLS : INSERT pour anon, SELECT pour anon, pas d'UPDATE/DELETE

## Stratégie d'orchestration des agents

### Phases de déploiement

**Phase 1 — Infrastructure** (séquentiel)
1. Créer projet Supabase (MCP)
2. Configurer tables + RLS (MCP)
3. Init Next.js + dépendances
4. Créer repo GitHub + push initial
5. Déployer sur Vercel + lier Supabase

**Phase 2 — Code applicatif** (parallélisable)
- Agent A : Types + lib (supabase client, scoring, types)
- Agent B : Data (mails.json) + configuration
- Agent C : Layout + page d'accueil

**Phase 3 — Pages principales** (parallélisable)
- Agent A : Page Quiz (mail-viewer, timer, progression, logique)
- Agent B : Page Résultats (correction, score, récap)
- Agent C : Page Leaderboard (realtime, table)

**Phase 4 — Polish & Deploy**
- Animations, transitions
- Tests mobile
- Push final + déploiement prod

### Règles pour les agents
- Toujours lire un fichier avant de le modifier
- Ne jamais hardcoder de secrets — utiliser les variables d'environnement
- Mettre à jour `.claude/progress.md` après chaque phase
- Mettre à jour `.claude/project-structure.md` après création/modification de fichiers
- Code en anglais, UI en français
- Tous les composants sont des Server Components par défaut, `'use client'` uniquement si nécessaire

## Variables d'environnement requises
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Commandes utiles
```bash
npm run dev          # Dev local
npm run build        # Build prod
vercel deploy        # Preview
vercel --prod        # Production
```
