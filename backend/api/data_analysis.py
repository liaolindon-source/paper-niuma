from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class ParseRequest(BaseModel):
    file_path: str


class TrendRequest(BaseModel):
    file_path: str
    independent_var: str
    dependent_var: str


def _resolve_uploaded_path(file_path: str) -> Path:
    path = Path(file_path)
    if not path.is_absolute():
        path = Path(__file__).resolve().parents[1] / file_path
    path = path.resolve()
    uploads_dir = (Path(__file__).resolve().parents[1] / "data" / "uploads").resolve()
    if uploads_dir not in path.parents and path != uploads_dir:
        raise HTTPException(status_code=400, detail="File path is outside upload directory")
    if not path.exists():
        raise HTTPException(status_code=404, detail="Uploaded data file not found")
    return path


def _read_dataframe(file_path: str) -> pd.DataFrame:
    path = _resolve_uploaded_path(file_path)
    suffix = path.suffix.lower()
    try:
        if suffix in {".xlsx", ".xls"}:
            return pd.read_excel(path)
        if suffix == ".csv":
            return pd.read_csv(path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to parse data file: {exc}") from exc
    raise HTTPException(status_code=400, detail=f"Unsupported data file type: {suffix}")


def _json_safe(value: Any) -> Any:
    if pd.isna(value):
        return None
    if hasattr(value, "item"):
        return value.item()
    return value


def _detect_trend(values: list[float]) -> str:
    if len(values) < 2:
        return "数据不足"
    diffs = [values[i + 1] - values[i] for i in range(len(values) - 1)]
    positive = sum(diff > 0 for diff in diffs)
    negative = sum(diff < 0 for diff in diffs)
    if positive == len(diffs):
        return "持续上升"
    if negative == len(diffs):
        return "持续下降"
    max_index = values.index(max(values))
    min_index = values.index(min(values))
    if 0 < max_index < len(values) - 1:
        return "先升后降"
    if 0 < min_index < len(values) - 1:
        return "先降后升"
    if positive or negative:
        return "波动变化"
    return "无明显规律"


@router.post("/parse")
async def parse_data(request: ParseRequest):
    df = _read_dataframe(request.file_path)
    df = df.dropna(how="all")
    columns = [str(col) for col in df.columns]
    numeric_columns = [col for col in columns if pd.api.types.is_numeric_dtype(df[col])]
    missing_report = {
        col: int(df[col].isna().sum())
        for col in columns
        if int(df[col].isna().sum()) > 0
    }
    preview = [
        {str(key): _json_safe(value) for key, value in row.items()}
        for row in df.head(20).to_dict(orient="records")
    ]

    return {
        "status": "success",
        "columns": columns,
        "numeric_columns": numeric_columns,
        "preview": preview,
        "total_rows": int(len(df)),
        "missing_value_report": missing_report,
        "validation_status": "valid" if len(columns) >= 2 else "invalid",
        "validation_message": "数据已解析" if len(columns) >= 2 else "数据至少需要两列",
    }


@router.post("/trend")
async def analyze_trend(request: TrendRequest):
    df = _read_dataframe(request.file_path)
    if request.independent_var not in df.columns or request.dependent_var not in df.columns:
        raise HTTPException(status_code=400, detail="Selected columns do not exist in dataset")

    x = df[request.independent_var]
    y = pd.to_numeric(df[request.dependent_var], errors="coerce")
    valid = pd.DataFrame({"x": x, "y": y}).dropna(subset=["y"])
    if valid.empty:
        raise HTTPException(status_code=400, detail="Dependent variable has no numeric values")

    valid = valid.sort_values("x") if pd.api.types.is_numeric_dtype(valid["x"]) else valid
    y_values = [float(v) for v in valid["y"].tolist()]
    first = y_values[0]
    last = y_values[-1]
    change_rate = None if first == 0 else ((last - first) / abs(first)) * 100
    trend = _detect_trend(y_values)
    direction = "上升" if last > first else "下降" if last < first else "无变化"
    rate_text = "无法计算" if change_rate is None else f"{direction} {abs(change_rate):.1f}%"
    max_value = max(y_values)
    min_value = min(y_values)
    mean_value = sum(y_values) / len(y_values)
    std_value = float(pd.Series(y_values).std(ddof=1)) if len(y_values) > 1 else 0.0

    conclusion = (
        f"随着{request.independent_var}变化，{request.dependent_var}呈{trend}。"
        f"{request.dependent_var}由 {first:.3g} 变化至 {last:.3g}，变化幅度为{rate_text}。"
    )

    return {
        "status": "success",
        "independent": request.independent_var,
        "dependent": request.dependent_var,
        "trend": trend,
        "max": round(max_value, 4),
        "min": round(min_value, 4),
        "mean": round(mean_value, 4),
        "std": round(std_value, 4),
        "rate": rate_text,
        "first_value": round(first, 4),
        "last_value": round(last, 4),
        "conclusion": conclusion,
        "points": [
            {"x": _json_safe(row["x"]), "y": round(float(row["y"]), 4)}
            for _, row in valid.iterrows()
        ],
    }
