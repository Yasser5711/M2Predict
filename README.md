---
title: M2Predict
emoji: 🏠
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# 🏠 M2Predict — Prédiction du prix immobilier au m² en France

M2Predict est un modèle de Machine Learning entraîné sur les données publiques **DVF (Demande de Valeurs Foncières)** pour prédire le **prix au m²** d’un bien immobilier en France.

L’objectif : fournir une estimation rapide, explicable et accompagnée d’un **score de confiance**.

---

# 🎯 Objectif du modèle

Le modèle prédit :

```
prix_m2
```

À partir de :

- `code_postal`
- `surface_reelle_bati`
- `nombre_pieces_principales`
- `type_local` (Maison / Appartement)

Le prix total est ensuite calculé :

```
prix_total = prix_m2 × surface
```

---

# 📊 Dataset

Source : **DVF – Données ouvertes des transactions immobilières en France**

## Nettoyage appliqué

Conservation uniquement :

- Maisons et Appartements
- surface > 0
- valeur foncière > 0
- nombre de pièces > 0

Calcul de la variable cible :

```
prix_m2 = valeur_fonciere / surface_reelle_bati
```

## Suppression des valeurs aberrantes

Contrainte appliquée :

```
surface >= 10 m²
200 <= prix_m2 <= 60 000
````

## Dataset final

```json
{
  "raw_rows": 1387077,
  "clean_rows": 390644,
  "prix_m2_median": 2685,
  "code_postal_unique": 5830
}
````

---

# 🤖 Modèles testés

## Modèles comparés

* RandomForestRegressor (RF)
* HistGradientBoostingRegressor (HGB)

## Métriques utilisées

* MAE (Mean Absolute Error)
* RMSE (Root Mean Squared Error)

---

# 🔹 Sans Target Encoding

## Code postal en One-Hot

| Modèle | RMSE | MAE  |
| ------ | ---- | ---- |
| RF     | 4176 | 2150 |
| HGB    | 4075 | 2014 |

👉 HGB légèrement meilleur.

---

## Département uniquement

| Modèle | RMSE | MAE  |
| ------ | ---- | ---- |
| RF     | 4201 | 2012 |
| HGB    | 4217 | 1969 |

👉 Perte de granularité géographique.

---

# 🧠 Target Encoding (Version retenue)

Le `code_postal` est remplacé par :

```
prix_m2 moyen par code postal
(calculé uniquement sur le train set)
```

Méthode :

* KFold Out-Of-Fold (anti data leakage)
* smoothing = 20
* fallback = moyenne globale

## Avantages

* 1 variable au lieu de 5 830 colonnes one-hot
* signal géographique plus fort
* meilleure généralisation

---

# 📈 Résultats avec Target Encoding

| Modèle   | RMSE | MAE  |
| -------- | ---- | ---- |
| RF + TE  | 3737 | 1701 |
| HGB + TE | 3823 | 1746 |

🥇 **Meilleur modèle : RandomForest + Target Encoding**

Amélioration MAE :
**~2150 → ~1700 €/m²**

---

# 🔐 Système de Score de Confiance

Chaque prédiction retourne :

```json
{
  "prix_m2": ...,
  "score_confiance": ...,
  "q10": ...,
  "q90": ...,
  "intervalle_largeur": ...
}
```

⚠️ Le score est relatif à la dispersion du modèle.
Ce n’est pas une probabilité statistique.

---

## 🔹 RandomForest — Méthode

* Récupération des prédictions de tous les arbres
* Calcul des quantiles :

  * q10
  * q90
* Intervalle = q90 − q10
* Score normalisé entre p5 et p95 observés au training

Méthode interne :

```
rf_tree_quantile_width
```

---

## 🔹 HGB — Méthode Bootstrap

* 10 modèles HGB entraînés sur échantillons bootstrap
* Calcul de la dispersion des prédictions
* Même logique q10/q90

Méthode interne :

```
hgb_bootstrap_width
```

---

## 📊 Interprétation du score

| Score       | Interprétation |
| ----------- | -------------- |
| ≥ 0.80      | Très fiable    |
| 0.65 – 0.80 | Fiable         |
| 0.50 – 0.65 | Incertain      |
| < 0.50      | Risqué         |

---

# ⚙️ Pipeline interne

1. Extraction du département (2 premiers chiffres du CP)
2. Target Encoding
3. Passage dans le pipeline scikit-learn
4. Calcul de l’incertitude
5. Normalisation → score_confiance

---

# 📦 Artefacts produits

Structure par version :

```
artifacts/models/v1_rf_te/
artifacts/models/v1_hgb_te/
```

Contenu :

* model.joblib
* metadata.json
* target_encoding.json
* bootstrap models (HGB)

---

# 🌐 API

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

---

# 🚀 État actuel

🥇 Meilleur MAE : **RF + Target Encoding**
🧠 Meilleure stabilité : **HGB Bootstrap**
📊 Système d’incertitude opérationnel en production

---

# 🔮 Améliorations futures

* CatBoost
* LightGBM
* XGBoost
* Ensemble RF + HGB
* Monitoring de dérive des données
* Validation métier automatique

---

# 📌 Disclaimer

Ce modèle fournit une estimation statistique basée sur les données historiques DVF.
Il ne remplace pas une expertise immobilière professionnelle.



