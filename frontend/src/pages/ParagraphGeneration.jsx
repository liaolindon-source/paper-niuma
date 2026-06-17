import { useState } from 'react';
import { AlertTriangle, Download, Edit3, PenTool, Settings } from 'lucide-react';
import { apiJson, getFlowState, updateFlowState } from '../api';
import './ParagraphGeneration.css';

const ParagraphGeneration = () => {
  const [sectionType, setSectionType] = useState('结果分析');
  const [style, setStyle] = useState('SCI 论文风格');
  const [researchField, setResearchField] = useState('工程材料');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [riskAlerts, setRiskAlerts] = useState([]);
  const [citationNotes, setCitationNotes] = useState([]);
  const [error, setError] = useState('');

  const flowState = getFlowState();

  const handleGenerate = async () => {
    setError('');
    setIsGenerating(true);
    try {
      const generated = await apiJson('/generate/paragraph', {
        section_type: sectionType,
        style,
        research_field: researchField,
        data_context: flowState.dataAnalysis || {},
        template: flowState.writingLogic || {},
      });
      setResult(generated.paragraph);
      setCitationNotes(generated.citation_notes || []);

      const riskData = await apiJson('/generate/risk', {
        generated_text: generated.paragraph,
        original_text: flowState.ocrText || '',
        data_context: flowState.dataAnalysis || {},
      });
      setRiskAlerts(riskData.alerts || []);
      const nextFlow = updateFlowState({
        generatedText: generated.paragraph,
        citationNotes: generated.citation_notes || [],
        riskAlerts: riskData.alerts || [],
        riskLevel: riskData.risk_level,
      });
      if (nextFlow.project?.id) {
        apiJson('/project/content', {
          project_id: nextFlow.project.id,
          reference_fragment_id: nextFlow.referenceRecord?.id || null,
          dataset_id: nextFlow.datasetRecord?.id || null,
          section_type: sectionType,
          writing_style: style,
          generated_text: generated.paragraph,
          citation_notes: generated.citation_notes || [],
          risk_level: riskData.risk_level,
        }).then((saved) => {
          updateFlowState({ contentRecord: saved.content });
          return apiJson('/project/risk', {
            project_id: nextFlow.project.id,
            generated_content_id: saved.content.id,
            risk_type: 'generation',
            risk_level: riskData.risk_level,
            risk_reason: (riskData.alerts || []).join('；'),
            rewrite_suggestion: '结合更多用户数据并减少参考原文句式依赖。',
          });
        }).catch(() => {});
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportMarkdown = async () => {
    try {
      const exported = await apiJson('/generate/markdown', {
        title: '论文牛马生成结果',
        generated_text: result,
        citation_notes: citationNotes,
        risk_alerts: riskAlerts,
      });
      const blob = new Blob([exported.markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'paper-niuma-result.md';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="paragraph-generation-page animate-fade-in">
      <div className="header-actions">
        <div>
          <h1 className="page-title">段落生成</h1>
          <p className="page-subtitle">基于写作逻辑和实验数据，生成可编辑的论文段落。</p>
        </div>
        {result && (
          <div className="export-actions">
            <button className="btn btn-outline" onClick={handleExportMarkdown}>
              <Download size={16} /> 导出 Markdown
            </button>
          </div>
        )}
      </div>

      {error && <div className="feedback-alert warning">{error}</div>}

      <div className="analysis-layout">
        <div className="left-panel generation-config">
          <div className="card">
            <div className="card-header">
              <h3><Settings size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'sub' }} />生成配置</h3>
            </div>

            <div className="form-group">
              <label className="label">目标章节</label>
              <select className="input-field" value={sectionType} onChange={(event) => setSectionType(event.target.value)}>
                <option>实验方法</option>
                <option>结果分析</option>
                <option>机理解释</option>
                <option>图表说明</option>
                <option>小节总结</option>
                <option>结论部分</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">写作风格</label>
              <select className="input-field" value={style} onChange={(event) => setStyle(event.target.value)}>
                <option>SCI 论文风格</option>
                <option>硕士论文风格</option>
                <option>中文核心期刊风格</option>
                <option>简洁说明风格</option>
                <option>详细讨论风格</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">专业方向</label>
              <input className="input-field" value={researchField} onChange={(event) => setResearchField(event.target.value)} />
            </div>

            <div className="config-summary">
              <p><strong>当前数据：</strong>{flowState.dataAnalysis?.conclusion || '请先完成数据趋势分析'}</p>
              <p><strong>写作模板：</strong>{flowState.writingLogic?.template || '请先完成参考片段分析'}</p>
            </div>

            <div className="card-footer">
              <button className="btn btn-primary w-full" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? <PenTool className="spin" size={16} /> : <PenTool size={16} />}
                {isGenerating ? '正在生成...' : '开始生成段落'}
              </button>
            </div>
          </div>
        </div>

        <div className="right-panel">
          {result ? (
            <div className="card result-content-card animate-fade-in">
              <div className="card-header">
                <h3>生成结果</h3>
                <button className="btn btn-outline btn-sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit3 size={14} /> {isEditing ? '完成' : '编辑'}
                </button>
              </div>

              {(riskAlerts.length > 0 || citationNotes.length > 0) && (
                <div className="feedback-alert warning">
                  <AlertTriangle size={18} className="alert-icon" />
                  <div className="alert-content">
                    <strong>引用提醒与风险提示</strong>
                    {[...citationNotes, ...riskAlerts].map((alert) => <p key={alert}>{alert}</p>)}
                  </div>
                </div>
              )}

              {isEditing ? (
                <textarea className="input-field editor-textarea" value={result} onChange={(event) => setResult(event.target.value)} />
              ) : (
                <div className="generated-text">{result}</div>
              )}

              <div className="card-footer">
                <button className="btn btn-secondary" onClick={() => setResult(result.slice(0, Math.max(80, Math.floor(result.length * 0.75))))}>缩短文本</button>
                <button className="btn btn-primary" style={{ marginLeft: 8 }} onClick={handleGenerate}>重新生成</button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <PenTool size={48} className="empty-icon" />
              <p>完成前两步后点击生成段落</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParagraphGeneration;
