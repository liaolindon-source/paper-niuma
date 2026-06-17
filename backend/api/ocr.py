from functools import lru_cache
import os
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class OCRRequest(BaseModel):
    file_path: str


def _resolve_uploaded_path(file_path: str) -> Path:
    path = Path(file_path)
    if not path.is_absolute():
        path = Path(__file__).resolve().parents[1] / file_path
    path = path.resolve()
    uploads_dir = (Path(__file__).resolve().parents[1] / "data" / "uploads").resolve()
    if uploads_dir not in path.parents and path != uploads_dir:
        raise HTTPException(status_code=400, detail="File path is outside upload directory")
    if not path.exists():
        raise HTTPException(status_code=404, detail="Uploaded image file not found")
    if path.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
        raise HTTPException(status_code=400, detail="OCR only supports PNG/JPG/JPEG images")
    return path


@lru_cache(maxsize=1)
def _get_ocr_engine():
    os.environ.setdefault("FLAGS_use_mkldnn", "0")
    os.environ.setdefault("FLAGS_use_onednn", "0")
    os.environ.setdefault("FLAGS_enable_pir_api", "0")
    os.environ.setdefault("PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK", "True")
    try:
        from paddleocr import PaddleOCR
    except Exception as exc:
        raise RuntimeError(f"PaddleOCR is not installed correctly: {exc}") from exc

    try:
        return PaddleOCR(
            lang="ch",
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False,
            enable_mkldnn=False,
            cpu_threads=2,
        )
    except TypeError:
        return PaddleOCR(lang="ch")


def _flatten_ocr_result(result: Any) -> tuple[list[str], list[float]]:
    texts: list[str] = []
    scores: list[float] = []

    def walk(node: Any):
        if isinstance(node, dict):
            if "rec_texts" in node:
                texts.extend(str(text) for text in node.get("rec_texts") or [])
            if "rec_scores" in node:
                scores.extend(float(score) for score in node.get("rec_scores") or [])
            for value in node.values():
                walk(value)
        elif isinstance(node, (list, tuple)):
            if len(node) >= 2 and isinstance(node[1], (list, tuple)) and len(node[1]) >= 2:
                text, score = node[1][0], node[1][1]
                if isinstance(text, str):
                    texts.append(text)
                    try:
                        scores.append(float(score))
                    except (TypeError, ValueError):
                        pass
            for item in node:
                walk(item)

    walk(result)
    return texts, scores


@router.post("/")
async def perform_ocr(request: OCRRequest):
    image_path = _resolve_uploaded_path(request.file_path)
    try:
        engine = _get_ocr_engine()
        if hasattr(engine, "predict"):
            raw_result = engine.predict(str(image_path))
        else:
            raw_result = engine.ocr(str(image_path), cls=True)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OCR failed: {exc}") from exc

    texts, scores = _flatten_ocr_result(raw_result)
    clean_lines = [line.strip() for line in texts if line and line.strip()]
    text = "\n".join(clean_lines)
    if not text:
        raise HTTPException(status_code=422, detail="OCR result is empty")

    confidence = round(sum(scores) / len(scores), 4) if scores else None
    return {
        "status": "success",
        "text": text,
        "confidence": confidence,
        "lines": clean_lines,
    }
