"""Deploy apps/ml to Hugging Face Spaces (Docker SDK)."""

from pathlib import Path

from huggingface_hub import CommitOperationAdd, HfApi

REPO_ID = "username/m2predict"
IGNORE = [
    ".venv/**",
    "**/__pycache__/**",
    "training/**",
    "**/*.pyc",
    "deploy_hf.py",
    ".dockerignore",
    ".gitignore",
    "note.md",
]

api = HfApi()

print("1/3  Creating Space (if needed)...")
api.create_repo(
    REPO_ID,
    repo_type="space",
    space_sdk="docker",
    exist_ok=True,
)

print("2/3  Uploading code...")
api.upload_folder(
    repo_id=REPO_ID,
    repo_type="space",
    folder_path=".",
    ignore_patterns=IGNORE,
)

# artifacts/ is in .gitignore so upload_folder skips it.
# Upload each file individually via CommitOperationAdd.
print("3/3  Uploading model artifacts...")
artifacts_dir = Path("artifacts")
operations = []
for p in sorted(artifacts_dir.rglob("*")):
    if p.is_file():
        repo_path = p.as_posix()  # e.g. artifacts/models/v1_rf_te/model.joblib
        print(f"  + {repo_path}")
        operations.append(
            CommitOperationAdd(path_in_repo=repo_path, path_or_fileobj=str(p))
        )

if operations:
    api.create_commit(
        repo_id=REPO_ID,
        repo_type="space",
        operations=operations,
        commit_message="Add model artifacts",
    )

print(f"Done! https://huggingface.co/spaces/{REPO_ID}")
