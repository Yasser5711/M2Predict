from inference.predict import predict

result = predict({
    "code_postal": "75011",
    "surface_reelle_bati": 42,
    "nombre_pieces_principales": 2,
    "type_local": "Appartement",
})

print(result)
