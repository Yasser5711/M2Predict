
# sans target encoding
## avec code postal
    ```bash
    python training\src\train_rf.py
    train_rf: 100%|████████████████████████████████████████████████| 6/6 [00:29<00:00,  4.96s/step, Sauvegarde métadonnées]
    ✅ Saved: C:\Users\miche\Desktop\Projects\M2Predict\apps\ml\artifacts\dvf_price_m2_pipeline_rf.joblib
    📄 Meta: C:\Users\miche\Desktop\Projects\M2Predict\apps\ml\artifacts\metadata_rf.json
    RMSE €/m²: 4176.480842180856
    MAE  €/m²: 2150.131547328244
    Sample prix_m2: 4866.411146102584
    ```


```bash
python training\src\train_hgb.py
train_hgb: 100%|███████████████████████████████████████████████| 6/6 [03:31<00:00, 35.32s/step, Sauvegarde métadonnées]
✅ Saved: C:\Users\miche\Desktop\Projects\M2Predict\apps\ml\artifacts\dvf_price_m2_pipeline_hgb.joblib
📄 Meta: C:\Users\miche\Desktop\Projects\M2Predict\apps\ml\artifacts\metadata_hgb.json
RMSE €/m²: 4075.6592566106874
MAE  €/m²: 2014.158865821951
Sample prix_m2: 8892.59619038365
```
## avec departement
```bash
python training\src\train_rf.py
train_rf: 100%|████████████████████████████████████████████████| 6/6 [00:45<00:00,  7.62s/step, Sauvegarde métadonnées]
✅ Saved: C:\Users\miche\Desktop\Projects\M2Predict\apps\ml\artifacts\dvf_price_m2_pipeline_rf.joblib
📄 Meta: C:\Users\miche\Desktop\Projects\M2Predict\apps\ml\artifacts\metadata_rf.json
RMSE €/m²: 4201.960296218968
MAE  €/m²: 2012.2160806876964
Sample prix_m2: 9871.171294941854
```

```bash
python training\src\train_hgb.py
train_hgb: 100%|███████████████████████████████████████████████| 6/6 [00:07<00:00,  1.29s/step, Sauvegarde métadonnées]
✅ Saved: C:\Users\miche\Desktop\Projects\M2Predict\apps\ml\artifacts\dvf_price_m2_pipeline_hgb.joblib
📄 Meta: C:\Users\miche\Desktop\Projects\M2Predict\apps\ml\artifacts\metadata_hgb.json
RMSE €/m²: 4217.45530380619
MAE  €/m²: 1969.72081255088
Sample prix_m2: 10910.186900233704
```

# avec target encoding
on calculera le prix_m2 moyen par code postal

```bash