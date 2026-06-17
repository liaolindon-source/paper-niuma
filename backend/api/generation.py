import re
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class LogicRequest(BaseModel):
    ocr_text: str


class ParagraphRequest(BaseModel):
    section_type: str
    style: str
    data_context: str | dict[str, Any]
    template: str | dict[str, Any]
    research_field: str | None = None


class RiskRequest(BaseModel):
    generated_text: str
    original_text: str
    data_context: str | dict[str, Any] | None = None


class MarkdownExportRequest(BaseModel):
    title: str = "论文分析结果"
    generated_text: str
    citation_notes: list[str] = []
    risk_alerts: list[str] = []


def _split_sentences(text: str) -> list[str]:
    return [part.strip() for part in re.split(r"[。！？!?]\s*", text) if part.strip()]


@router.post("/logic")
async def analyze_logic(request: LogicRequest):
    text = request.ocr_text.strip()
    sentences = _split_sentences(text)
    variables = sorted(set(re.findall(r"[\u4e00-\u9fa5A-Za-z]+(?:比|量|率|强度|应力|系数|性能)", text)))
    paragraph_type = "结果与讨论" if any(word in text for word in ["增加", "降低", "影响", "趋势", "结果"]) else "论文片段"
    topic = sentences[0][:80] if sentences else "未识别到明确主题"
    steps = [
        "先概括变量变化带来的总体趋势",
        "再给出关键数据或典型对比",
        "随后解释可能的材料结构、反应过程或作用机理",
        "最后总结该因素对目标性能的影响",
    ]

    return {
        "status": "success",
        "type": paragraph_type,
        "topic": topic,
        "research_object": "请结合原文确认研究对象",
        "independent_variables": variables[:3],
        "dependent_variables": variables[3:6] if len(variables) > 3 else [],
        "steps": steps,
        "data_expression_pattern": "总体趋势 + 关键数值对比 + 变化幅度",
        "mechanism_explanation_pattern": "从材料结构、颗粒作用或反应过程解释现象",
        "citation_needed": True,
        "template": "随着 X 的变化，Y 呈现 ____ 趋势。当 X 由 A 变化至 B 时，Y 由 C 变化至 D，变化幅度为 E。该现象可能与 ____ 有关。",
        "compliance_note": "仅提取写作逻辑，不复制、不改写、不仿写原文句子；使用他人观点时请规范引用。",
    }


@router.post("/paragraph")
async def generate_paragraph(request: ParagraphRequest):
    data = request.data_context if isinstance(request.data_context, dict) else {}
    if isinstance(request.data_context, str):
        data = {"conclusion": request.data_context}

    independent = data.get("independent", "自变量")
    dependent = data.get("dependent", "因变量")
    trend = data.get("trend", "变化趋势")
    first_value = data.get("first_value")
    last_value = data.get("last_value")
    rate = data.get("rate", "未计算")
    conclusion = data.get("conclusion", "")

    if first_value is not None and last_value is not None:
        data_sentence = (
            f"当{independent}发生变化时，{dependent}由 {first_value} 变化至 {last_value}，"
            f"变化幅度为{rate}。"
        )
    else:
        data_sentence = conclusion or f"{dependent}随{independent}变化呈{trend}。"

    mechanism = (
        "这一结果说明该因素可能改变了体系内部结构或组分间相互作用，"
        "进而影响材料宏观性能表现。"
    )
    if request.research_field:
        mechanism = (
            f"结合{request.research_field}领域的一般认识，该现象可能与体系内部结构、"
            "颗粒间作用或反应产物分布变化有关。"
        )

    paragraph = (
        f"在{request.section_type}部分，{dependent}随{independent}变化呈{trend}。"
        f"{data_sentence}"
        f"{mechanism}"
        "因此，该变量是影响试验结果的重要因素，后续应结合更多测试结果进一步验证其作用机制。"
    )

    citation_notes = [
        "机理解释涉及已有研究观点，建议补充相关参考文献。",
        "若采用参考论文中的分析角度，请在对应位置添加规范引用。",
    ]

    return {
        "status": "success",
        "paragraph": paragraph,
        "used_data_points": [data_sentence],
        "citation_notes": citation_notes,
    }


@router.post("/risk")
async def check_risk(request: RiskRequest):
    generated_sentences = set(_split_sentences(request.generated_text))
    original_sentences = set(_split_sentences(request.original_text))
    overlap = generated_sentences & original_sentences
    has_data = bool(re.search(r"\d", request.generated_text))
    alerts: list[str] = []

    if overlap:
        alerts.append("生成文本存在与参考片段完全相同的句子，建议重新生成或改写。")
    if not has_data:
        alerts.append("生成文本缺少明确数据支撑，建议加入趋势分析中的关键数值。")
    if any(word in request.generated_text for word in ["可能", "机理", "结构", "作用"]):
        alerts.append("机理解释部分建议添加相关参考文献。")

    if overlap or not has_data:
        risk_level = "高风险"
    elif alerts:
        risk_level = "中风险"
    else:
        risk_level = "低风险"

    return {
        "status": "success",
        "risk_level": risk_level,
        "alerts": alerts,
        "similar_segments": list(overlap),
    }


@router.post("/markdown")
async def export_markdown(request: MarkdownExportRequest):
    citation_block = "\n".join(f"- {item}" for item in request.citation_notes) or "- 暂无"
    risk_block = "\n".join(f"- {item}" for item in request.risk_alerts) or "- 暂无"
    markdown = (
        f"# {request.title}\n\n"
        f"## 生成段落\n\n{request.generated_text}\n\n"
        f"## 引用提醒\n\n{citation_block}\n\n"
        f"## 风险提示\n\n{risk_block}\n"
    )
    return {"status": "success", "markdown": markdown}
