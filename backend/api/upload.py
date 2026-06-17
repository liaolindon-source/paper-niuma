from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from pathlib import Path

router = APIRouter()

# 确保 data 目录存在
DATA_DIR = Path("data/uploads")
DATA_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
        
    try:
        # 生成唯一文件名
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = DATA_DIR / unique_filename
        
        # 保存文件
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "status": "success",
            "file_name": file.filename,
            "saved_path": str(file_path),
            "file_size": file_path.stat().st_size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
