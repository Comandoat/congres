# PhishQuiz — Congrès de Biologie Médicale

Site web de sensibilisation au phishing pour un congrès de biologie médicale.
Les participants scannent un QR code et testent leur capacité à détecter les e-mails de phishing.

**Par Antoine CAPUCCIO & Noa BROCA**

## URL du site

🔗 **https://phishquiz-congres.vercel.app**

## Stack technique

- **Frontend** : Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Base de données** : Supabase (Postgres + Realtime)
- **Hébergement** : Vercel

## Modifier les mails

Les mails sont configurés dans `src/data/mails.json`. Chaque entrée a la structure :

```json
{
  "id": 1,
  "image": "/mails/mail-01.png",
  "isPhishing": true,
  "hint": "L'indice de phishing à repérer",
  "explanation": "Explication pédagogique détaillée"
}
```

### Pour ajouter/modifier des mails :

1. Placez vos captures d'écran dans `public/mails/` (format PNG ou JPG)
2. Modifiez `src/data/mails.json` en ajoutant/modifiant les entrées
3. Committez et poussez sur GitHub
4. Redéployez avec : `npx vercel --prod --token VOTRE_TOKEN`

## Relancer un déploiement

```bash
npx vercel --prod --token VOTRE_TOKEN
```

## Vider le leaderboard entre deux sessions

Allez dans le dashboard Supabase du projet `phishquiz-congres` :
1. Table Editor → `scores`
2. Sélectionnez toutes les lignes → Delete

Ou via SQL Editor :
```sql
DELETE FROM public.scores;
```

## Développement local

```bash
npm install
npm run dev
```

Le fichier `.env.local` doit contenir :
```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```
