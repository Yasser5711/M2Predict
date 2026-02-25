
# M2Predict — Modèle ML (DVF)

## 🎯 Objectif

Prédire le **prix au m²** d’un bien immobilier en France à partir de :

- `code_postal`
- `surface_reelle_bati`
- `nombre_pieces_principales`
- `type_local` (Maison / Appartement)

On prédit `prix_m2`, puis l’app pourra calculer :

prix_total = prix_m2 × surface

---

# 1️⃣ Dataset

Source : DVF (Demande de Valeurs Foncières)

### Nettoyage effectué

On garde uniquement :
- Maison / Appartement
- surface > 0
- valeur foncière > 0
- nombre de pièces > 0

On calcule :

```

prix_m2 = valeur_fonciere / surface_reelle_bati

```

### Suppression des valeurs aberrantes

On garde :

```

10 <= surface
200 <= prix_m2 <= 60000

````

Dataset final :

```json
{
  "raw_rows": 1387077,
  "clean_rows": 390644,
  "prix_m2_median": 2685,
  "code_postal_unique": 5830
}
````

---

# 2️⃣ Modèles testés

On a comparé :

* RandomForest (RF)
* HistGradientBoosting (HGB)

Métriques :

* MAE (erreur moyenne)
* RMSE (erreur quadratique)

---

# 🔹 Sans target encoding

## Avec code postal (one-hot)

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

## Avec département uniquement

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

👉 Léger gain, mais perte d’information géographique.

---

# 3️⃣ Target Encoding (meilleure version)

On remplace `code_postal` par :

```
prix_m2 moyen par code postal (calculé sur le train)
```

Avantage :

* 1 colonne au lieu de 5830
* meilleur signal géographique
* meilleure performance

---

## Résultats avec Target Encoding

### RF + TE

```
RMSE: 3737
MAE: 1701
```

### HGB + TE

```
RMSE: 3823
MAE: 1746
```

👉 **Meilleur modèle actuel : RandomForest + Target Encoding**

---

# 4️⃣ Artefacts produits

* `dvf_price_m2_pipeline_rf.joblib`
* `target_encoding_code_postal.json`
* `metadata_rf.json`

---

# 5️⃣ Comment prédire

Input :

```json
{
  "code_postal": "75011",
  "surface_reelle_bati": 42,
  "nombre_pieces_principales": 2,
  "type_local": "Appartement"
}
```

Étapes internes :

1. departement = first 2 digits(code_postal)
2. cp_te = mapping[code_postal] ou moyenne globale
3. prédiction via pipeline

---

# 🚀 Conclusion

Le **RandomForest avec Target Encoding** est la version retenue pour la V1.

Amélioration obtenue :

MAE passé de ~2150 → ~1700 €/m²
