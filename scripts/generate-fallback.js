#!/usr/bin/env node
/**
 * generate-fallback.js
 * ---------------------------------------------------------------------------
 * Génère un dictionnaire national compressé des prix moyens au m² par commune,
 * destiné au mode dégradé de l'estimation immobilière (ImmoEstime France).
 *
 * Source : « Indicateurs Immobiliers par commune et par année » (data.gouv.fr)
 *   https://www.data.gouv.fr/datasets/indicateurs-immobiliers-par-commune-et-par-annee-prix-et-volumes-sur-la-periode-2014-2024
 *
 * Le script télécharge les fichiers CSV annuels (2024, 2023, 2022), agrège le
 * prix moyen au m² (colonne `Prixm2Moyen`) par code INSEE, en privilégiant
 * l'année la plus récente disponible pour chaque commune, puis écrit :
 *
 *   src/data/fallback_national.json   ->  { "01001": 3258, "01002": 1942, ... }
 *
 * Format volontairement minimaliste : { "<code_insee>": <prix_moyen_m2> }.
 *
 * Utilisation :
 *   node scripts/generate-fallback.js
 *
 * Dépendances : aucune (Node >= 18, fetch + fs natifs).
 * ---------------------------------------------------------------------------
 */

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Fichiers annuels, du plus récent au plus ancien.
// L'ordre compte : on garde la première année qui fournit une valeur pour
// chaque commune (donc la plus récente).
const SOURCES = [
  {
    year: 2024,
    url: "https://static.data.gouv.fr/resources/indicateurs-immobiliers-par-commune-et-par-annee-prix-et-volumes-sur-la-periode-2014-2024/20250707-085855/communesdvf2024.csv",
  },
  {
    year: 2023,
    url: "https://static.data.gouv.fr/resources/indicateurs-immobiliers-par-commune-et-par-annee-prix-et-volumes-sur-la-periode-2014-2021/20240418-112252/dvf2023.csv",
  },
  {
    year: 2022,
    url: "https://static.data.gouv.fr/resources/indicateurs-immobiliers-par-commune-et-par-annee-prix-et-volumes-sur-la-periode-2014-2021/20240418-112252/dvf2022.csv",
  },
];

const OUTPUT_PATH = resolve(__dirname, "..", "src", "data", "fallback_national.json");

/**
 * Télécharge un CSV et renvoie un tableau de lignes (tableau de champs).
 * Le séparateur est la virgule, l'encodage UTF-8.
 */
async function fetchCsvLines(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} sur ${url}`);
  const text = await res.text();
  return text.split(/\r?\n/).filter((l) => l.length > 0);
}

/**
 * Parse une ligne CSV : gère les champs entourés de guillemets (fichiers 2022/2023)
 * comme les champs nus (fichier 2024). Aucune valeur de ce jeu de données ne
 * contient de virgule ou de guillemet échappé, un simple split + nettoyage suffit.
 */
function parseLine(line) {
  return line.split(",").map((f) => f.trim().replace(/^"(.*)"$/, "$1"));
}

async function main() {
  const dict = {}; // code_insee -> prix_m2
  const seenYears = {}; // code_insee -> année retenue (pour le rapport)

  for (const { year, url } of SOURCES) {
    process.stdout.write(`→ ${year} : téléchargement…\n`);
    const lines = await fetchCsvLines(url);
    if (lines.length < 2) {
      process.stdout.write(`  (fichier vide, ignoré)\n`);
      continue;
    }

    const header = parseLine(lines[0]);
    const colInsee = header.indexOf("INSEE_COM");
    const colPrixM2 = header.indexOf("Prixm2Moyen");
    if (colInsee === -1 || colPrixM2 === -1) {
      throw new Error(
        `Colonnes attendues introuvables pour ${year} (INSEE_COM / Prixm2Moyen).`
      );
    }

    let added = 0;
    for (let i = 1; i < lines.length; i++) {
      const fields = parseLine(lines[i]);
      const insee = (fields[colInsee] || "").trim();
      const raw = parseFloat(fields[colPrixM2]);
      if (!insee || !Number.isFinite(raw) || raw <= 0) continue;
      // On ne remplit que les communes pas encore rencontrées (année plus récente).
      if (dict[insee] === undefined) {
        dict[insee] = Math.round(raw);
        seenYears[insee] = year;
        added++;
      }
    }
    process.stdout.write(`  ${added} communes ajoutées (total : ${Object.keys(dict).length})\n`);
  }

  const count = Object.keys(dict).length;
  if (count === 0) throw new Error("Aucune commune extraite — abandon.");

  // Écriture compacte : clé/courte, valeur entière, pas d'indentation.
  await writeFile(OUTPUT_PATH, JSON.stringify(dict));
  process.stdout.write(`\n✓ ${count} communes écrites dans ${OUTPUT_PATH}\n`);
}

main().catch((err) => {
  console.error("Erreur :", err.message);
  process.exit(1);
});