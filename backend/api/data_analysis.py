from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json

router = APIRouter()

class ParseRequest(BaseModel):
    file_path: str

class TrendRequest(BaseModel):
    file_path: str
    independent_var: str
    dependent_var: str

@router.post("/parse")
async def parse_data(request: ParseRequest):
    # 返回纯 Mock 数据
    return {
        "status": "success",
        "columns": ["水胶比", "砂胶比", "屈服应力(Pa)", "稠度系数(Pa·s)"],
        "preview": [
            {"水胶比": 0.30, "砂胶比": 1.5, "屈服应力(Pa)": 145.2, "稠度系数(Pa·s)": 12.5},
            {"水胶比": 0.35, "砂胶比": 1.5, "屈服应力(Pa)": 110.8, "稠度系数(Pa·s)": 9.2},
            {"水胶比": 0.40, "砂胶比": 1.5, "屈服应力(Pa)": 86.3, "稠度系数(Pa·s)": 6.8},
            {"水胶比": 0.45, "砂胶比": 1.5, "屈服应力(Pa)": 55.4, "稠度系数(Pa·s)": 4.1}
        ],
        "total_rows": 4,
        "mocked": True
    }

@router.post("/trend")
async def analyze_trend(request: TrendRequest):
    # 此处省略复杂的 DataFrame 计算，直接用 Mock 返回
    # 真实实现：
    # df = pd.read_excel(request.file_path)
    # x = df[request.independent_var]
    # y = df[request.dependent_var]
    # ... 计算 min, max, 变化率, 并判断单调性
    
    return {
        "status": "success",
        "independent": request.independent_var,
        "dependent": request.dependent_var,
        "trend": "持续下降",
        "max": "145.2",
        "min": "55.4",
        "rate": "下降 61.8%",
        "conclusion": f"随着{request.independent_var}增加，{request.dependent_var}明显降低，说明体系流变性能发生改变。"
    }
