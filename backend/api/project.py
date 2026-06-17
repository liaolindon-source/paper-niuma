from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.db import get_connection, init_db, row_to_dict, to_json

router = APIRouter()
init_db()


class ProjectData(BaseModel):
    name: str
    research_field: str = ""
    paper_title: str = ""
    main_indicators: str = ""


class ReferenceFragmentData(BaseModel):
    project_id: int
    image_path: str = ""
    original_ocr_text: str = ""
    cleaned_ocr_text: str = ""
    writing_logic: dict[str, Any] | None = None


class DatasetData(BaseModel):
    project_id: int
    file_name: str = ""
    file_path: str = ""
    variables: list[str] = []
    indicators: list[str] = []
    analysis_result: dict[str, Any] | None = None


class GeneratedContentData(BaseModel):
    project_id: int
    reference_fragment_id: int | None = None
    dataset_id: int | None = None
    section_type: str = ""
    writing_style: str = ""
    generated_text: str
    citation_notes: list[str] = []
    risk_level: str = "unknown"


class RiskRecordData(BaseModel):
    project_id: int
    generated_content_id: int | None = None
    risk_type: str = ""
    risk_level: str = ""
    risk_reason: str = ""
    rewrite_suggestion: str = ""


@router.post("/save")
async def save_project(data: ProjectData):
    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO projects (project_name, research_field, paper_title, main_indicators)
            VALUES (?, ?, ?, ?)
            """,
            (data.name, data.research_field, data.paper_title, data.main_indicators),
        )
        project_id = cursor.lastrowid
        row = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
    return {"status": "success", "project": row_to_dict(row)}


@router.get("/list")
async def list_projects():
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM projects WHERE status != 'deleted' ORDER BY updated_at DESC"
        ).fetchall()
    return {"status": "success", "projects": [row_to_dict(row) for row in rows]}


@router.get("/{project_id}")
async def get_project(project_id: int):
    with get_connection() as conn:
        project = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        references = conn.execute(
            "SELECT * FROM reference_fragments WHERE project_id = ? ORDER BY id DESC",
            (project_id,),
        ).fetchall()
        datasets = conn.execute(
            "SELECT * FROM datasets WHERE project_id = ? ORDER BY id DESC",
            (project_id,),
        ).fetchall()
        contents = conn.execute(
            "SELECT * FROM generated_contents WHERE project_id = ? ORDER BY id DESC",
            (project_id,),
        ).fetchall()
    return {
        "status": "success",
        "project": row_to_dict(project),
        "references": [row_to_dict(row) for row in references],
        "datasets": [row_to_dict(row) for row in datasets],
        "contents": [row_to_dict(row) for row in contents],
    }


@router.post("/reference")
async def save_reference_fragment(data: ReferenceFragmentData):
    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO reference_fragments
            (project_id, image_path, original_ocr_text, cleaned_ocr_text, writing_logic_json)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                data.project_id,
                data.image_path,
                data.original_ocr_text,
                data.cleaned_ocr_text,
                to_json(data.writing_logic or {}),
            ),
        )
        row = conn.execute("SELECT * FROM reference_fragments WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return {"status": "success", "reference": row_to_dict(row)}


@router.post("/dataset")
async def save_dataset(data: DatasetData):
    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO datasets
            (project_id, file_name, file_path, variables_json, indicators_json, analysis_result_json)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                data.project_id,
                data.file_name,
                data.file_path,
                to_json(data.variables),
                to_json(data.indicators),
                to_json(data.analysis_result or {}),
            ),
        )
        row = conn.execute("SELECT * FROM datasets WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return {"status": "success", "dataset": row_to_dict(row)}


@router.post("/content")
async def save_generated_content(data: GeneratedContentData):
    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO generated_contents
            (project_id, reference_fragment_id, dataset_id, section_type, writing_style,
             generated_text, citation_notes_json, risk_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data.project_id,
                data.reference_fragment_id,
                data.dataset_id,
                data.section_type,
                data.writing_style,
                data.generated_text,
                to_json(data.citation_notes),
                data.risk_level,
            ),
        )
        row = conn.execute("SELECT * FROM generated_contents WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return {"status": "success", "content": row_to_dict(row)}


@router.post("/risk")
async def save_risk_record(data: RiskRecordData):
    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO risk_records
            (project_id, generated_content_id, risk_type, risk_level, risk_reason, rewrite_suggestion)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                data.project_id,
                data.generated_content_id,
                data.risk_type,
                data.risk_level,
                data.risk_reason,
                data.rewrite_suggestion,
            ),
        )
        row = conn.execute("SELECT * FROM risk_records WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return {"status": "success", "risk": row_to_dict(row)}
