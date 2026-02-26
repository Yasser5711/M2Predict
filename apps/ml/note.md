
# M2Predict — Modèle ML (DVF)

## 🎯 Objectif

Prédire le **prix au m²** d'un bien immobilier en France à partir de :

- `code_postal`
- `surface_reelle_bati`
- `nombre_pieces_principales`
- `type_local` (Maison / Appartement)

On prédit :

```
prix_m2
```

Puis l'application calcule :

```
prix_total = prix_m2 × surface
```

---

# 1️⃣ Dataset

Source : **DVF (Demande de Valeurs Foncières)**

## Nettoyage effectué

On conserve uniquement :

- Maison / Appartement
- surface > 0
- valeur foncière > 0
- nombre de pièces > 0

On calcule :

```
prix_m2 = valeur_fonciere / surface_reelle_bati
```

---

## Suppression des valeurs aberrantes

On garde :

```
surface >= 10
200 <= prix_m2 <= 60000
```

---

## Dataset final

```json
{
  "raw_rows": 1387077,
  "clean_rows": 390644,
  "prix_m2_median": 2685,
  "code_postal_unique": 5830
}
```

---

# 2️⃣ Modèles testés

Modèles comparés :

- RandomForestRegressor (RF)
- HistGradientBoostingRegressor (HGB)

Métriques utilisées :

- MAE (erreur absolue moyenne)
- RMSE (erreur quadratique moyenne)

---

# 🔹 Sans Target Encoding

## Code postal en One-Hot

### RF

```
RMSE: 4176
MAE: 2150
```

### HGB

```
RMSE: 4075
MAE: 2014
```

👉 HGB meilleur que RF.

---

## Département uniquement

### RF

```
RMSE: 4201
MAE: 2012
```

### HGB

```
RMSE: 4217
MAE: 1969
```

👉 Léger gain mais perte de précision géographique.

---

# 3️⃣ Target Encoding (version retenue)

On remplace `code_postal` par :

```
prix_m2 moyen par code postal (calculé uniquement sur le train)
```

Méthode :

- KFold OOF (leakage-safe)
- smoothing = 20
- fallback = moyenne globale

Avantages :

- 1 variable au lieu de 5830 colonnes
- signal géographique plus fort
- meilleure généralisation

---

# 📊 Résultats avec Target Encoding

### RF + TE (v1_rf_te)

```
RMSE: 3737
MAE: 1701
```

### HGB + TE (v1_hgb_te)

```
RMSE: 3823
MAE: 1746
```

👉 **Meilleur modèle précision brute : RandomForest + TE**

---

# 4️⃣ Système de Score de Confiance (V2)

Chaque prédiction retourne maintenant :

```json
{
  "prix_m2": ...,
  "score_confiance": ...,
  "q10": ...,
  "q90": ...,
  "intervalle_largeur": ...
}
```

---

## 🔹 RF — Méthode

- On récupère les prédictions de tous les arbres
- On calcule :
  - q10 = 10e percentile
  - q90 = 90e percentile
- Intervalle = q90 − q10
- Score = largeur normalisée entre p5 et p95 observés au training

Méthode :

```
rf_tree_quantile_width
```

---

## 🔹 HGB — Méthode Bootstrap

- 10 modèles HGB entraînés sur échantillons bootstrap
- On calcule dispersion des prédictions
- Même logique q10/q90

Méthode :

```
hgb_bootstrap_width
```

---

## Interprétation métier

| Score       | Signification |
| ----------- | ------------- |
| ≥ 0.80      | Très fiable   |
| 0.65 – 0.80 | Fiable        |
| 0.50 – 0.65 | Incertain     |
| < 0.50      | Risqué        |

⚠️ Le score est **relatif à la distribution d'incertitude du modèle**,
ce n'est pas une probabilité statistique.

---

# 5️⃣ Artefacts produits

Structure par version :

```
artifacts/models/v1_rf_te/
artifacts/models/v1_hgb_te/
```

Contenu :

- model.joblib
- metadata.json
- target_encoding.json
- (HGB) bootstrap/model_boot_XX.joblib

---

# 6️⃣ API

Endpoint :

```
POST /predict?model_version=v1_rf_te
POST /predict?model_version=v1_hgb_te
```

Input :

```json
{
  "code_postal": "75011",
  "surface_reelle_bati": 42,
  "nombre_pieces_principales": 2,
  "type_local": "Appartement"
}
```

Pipeline interne :

1. departement = first 2 digits(code_postal)
2. cp_te = mapping[cp] ou moyenne globale
3. prédiction via pipeline
4. calcul incertitude
5. retour score_confiance

---

# 🚀 Conclusion actuelle

### 🥇 Meilleur MAE : RF + Target Encoding

### 🧠 Meilleure stabilité : HGB Bootstrap

### 📊 Système d'incertitude opérationnel en production

Amélioration obtenue :

MAE passé de ~2150 → ~1700 €/m²

---

# 🔮 Prochaines améliorations possibles

- CatBoost
- LightGBM / XGBoost
- Modèle combiné RF + HGB
- Validation métier automatique
- Moyenne départementale comparative
- Monitoring dérive données
