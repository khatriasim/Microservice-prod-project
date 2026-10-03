import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter()

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def is_valid_image(contents: bytes, extension: str) -> bool:
    """Verify that the file bytes match the extension we are about to serve."""
    signatures = {
        ".jpg": lambda data: data.startswith(b"\xff\xd8\xff"),
        ".jpeg": lambda data: data.startswith(b"\xff\xd8\xff"),
        ".png": lambda data: data.startswith(b"\x89PNG\r\n\x1a\n"),
        ".gif": lambda data: data.startswith((b"GIF87a", b"GIF89a")),
        ".webp": lambda data: data.startswith(b"RIFF") and data[8:12] == b"WEBP",
    }
    return bool(contents) and signatures[extension](contents)

@router.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: JPG, PNG, WebP, GIF")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5 MB")
    if not is_valid_image(contents, ext):
        raise HTTPException(status_code=400, detail="File content does not match its image type")

    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    return {"image_url": f"/static/uploads/{filename}"}
