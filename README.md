# L'Indice Immo

Application d'estimation immobilière indicative, fondée sur les ventes réelles enregistrées dans les communes françaises.

## But de l'application

L'Indice Immo permet d'estimer la valeur d'un bien immobilier à partir de son adresse et de sa surface. L'estimation s'appuie sur les ventes réelles récentes de la commune, issues des données ouvertes de l'État.

## Sources de données

- **Base Adresse Nationale (BAN)** — recherche et validation des adresses (adresse.data.gouv.fr).
- **Demandes de Valeurs Foncières (DVF)** — ventes enregistrées, issues des fichiers géolocalisés geo-dvf publiés sur data.gouv.fr (Etalab / Cerema).

## Mode secours

Lorsque le serveur des données foncières est momentanément indisponible, l'application bascule en mode secours : l'estimation est alors calculée à partir d'un dictionnaire statique de prix moyens au m² par commune. Ce mode est moins précis qu'une estimation fondée sur les ventes récentes.

## Lancement local

```bash
# Environnement complet (backend + frontend)
base44 dev

# Frontend uniquement, connecté au backend hébergé
npm run dev
```

Pour le frontend seul, créez un fichier `.env.local` avec :

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

## Avertissement

Les estimations fournies sont **indicatives**. Elles ne constituent pas une expertise et ne remplacent pas l'avis d'un professionnel de l'immobilier.