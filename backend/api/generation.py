from fastapi import APIRouter
from pydantic import BaseModel
import asyncio

router = APIRouter()

class LogicRequest(BaseModel):
    ocr_text: str

class ParagraphRequest(BaseModel):
    section_type: str
    style: str
    data_context: str
    template: str

class RiskRequest(BaseModel):
    generated_text: str
    original_text: str

@router.post("/logic")
async def analyze_logic(request: LogicRequest):
    await asyncio.sleep(1)
    return {
        "status": "success",
        "type": "结果与讨论",
        "steps": [
            "先说明变量变化对性能指标的总体影响",
            "再列举典型数据进行对比",
            "从材料微观结构和颗粒作用角度解释原因",
            "最后总结该因素对目标性能的影响"
        ],
        "template": "随着 X 的增加，Y 呈现 ____ 趋势。当 X 由 A 增加至 B 时，Y 由 C 变化至 D，变化幅度为 E。该现象说明 ____。其原因可能与 ____ 有关。"
    }

@router.post("/paragraph")
async def generate_paragraph(request: ParagraphRequest):
    await asyncio.sleep(1.5)
    mock_paragraph = (
        f"[{request.style}] 随着自变量的增加，体系的相关因变量呈明显下降趋势。"
        "当数据变化时，降幅显著。这表明该因素的提高削弱了内部的相互作用，"
        "使体系内部结构稳定性下降，从而降低了反应所需克服的临界值。"
    )
    return {
        "status": "success",
        "paragraph": mock_paragraph
    }

@router.post("/risk")
async def check_risk(request: RiskRequest):
    await asyncio.sleep(0.5)
    return {
        "status": "success",
        "risk_level": "中风险",
        "alerts": [
            "此处涉及机理解释，建议添加相关参考文献。",
            "部分句式结构与原文过于相似，建议进一步结合实验数据改写。"
        ]
    }
