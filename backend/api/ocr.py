from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import asyncio

router = APIRouter()

class OCRRequest(BaseModel):
    file_path: str

@router.post("/")
async def perform_ocr(request: OCRRequest):
    # 模拟 OCR 识别延迟
    await asyncio.sleep(1.5)
    
    # 真实场景会在这里调用 PaddleOCR:
    # from paddleocr import PaddleOCR
    # ocr = PaddleOCR(use_angle_cls=True, lang="ch")
    # result = ocr.ocr(request.file_path, cls=True)
    
    mock_text = "随着水胶比的增加，砂浆体系的屈服应力呈明显下降趋势。这表明水胶比的提高削弱了胶凝材料颗粒之间的相互作用，使体系内部絮凝结构稳定性下降。"
    
    return {
        "status": "success",
        "text": mock_text,
        "confidence": 0.96
    }
