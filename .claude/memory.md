# Mémoire persistante — PhishQuiz Congrès

## État actuel
- **Phase** : 0 — Initialisation
- **Date** : 2026-03-25
- **Dernière action** : Création CLAUDE.md et système de mémoire

## Décisions prises
- Stack : Next.js 16 + Supabase + Vercel
- Nom repo GitHub : `congres`
- UI entièrement en français
- Dark theme cyber (bleu/vert néon)
- Auteurs : Antoine CAPUCCIO & Noa BROCA
- Le user ajoutera ses propres images de mails dans /public/mails/
- On fournit 4 mails exemple dans mails.json (3 phishing, 1 légitime)

## Credentials
- GitHub token : fourni par l'utilisateur (ghp_...)
- Vercel token : fourni par l'utilisateur (vcp_...)
- Supabase token : fourni par l'utilisateur (sbp_...)
- ⚠️ L'utilisateur doit révoquer ces tokens après la session

## Blocages connus
- Aucun pour le moment

## Notes
- Public = médecins/internes, zéro connaissance cyber
- Site accessible via QR code sur smartphone → mobile-first critique
- Le leaderboard doit fonctionner en temps réel (Supabase Realtime)
- Pas de feedback immédiat pendant le quiz (suspense)
