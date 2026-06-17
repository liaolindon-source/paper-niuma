from fastapi import APIRouter
from pydantic import BaseModel
import uuid
import datetime

router = APIRouter()

class ProjectData(BaseModel):
    name: str
    research_field: str

@router.post("/save")
async def save_project(data: ProjectData):
    # 此处省略数据库保存操作，模拟返回保存成功的结果
    project_id = str(uuid.uuid4())
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    return {
        "status": "success",
        "project_id": project_id,
        "name": data.name,
        "saved_at": now
    }
