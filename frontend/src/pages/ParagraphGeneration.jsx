import React, { useState } from 'react';
import { PenTool, Download, AlertTriangle, Info, Edit3, Settings } from 'lucide-react';
import './ParagraphGeneration.css';

const ParagraphGeneration = () => {
  const [sectionType, setSectionType] = useState('结果分析');
  const [style, setStyle] = useState('SCI 论文风格');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [riskAlerts, setRiskAlerts] = useState([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:8000/api/generate/paragraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_type: sectionType,
          style: style,
          data_context: "mock data",
          template: "mock template"
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setResult(result.paragraph);
        
        // 调用风险检测
        const riskResp = await fetch('http://localhost:8000/api/generate/risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ generated_text: result.paragraph, original_text: "mock" })
        });
        const riskData = await riskResp.json();
        if (riskData.status === 'success') {
          setRiskAlerts(riskData.alerts);
        }
      }
    } catch (err) {
      console.error("Failed to generate paragraph", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="paragraph-generation-page animate-fade-in">
      <div className="header-actions">
        <div>
          <h1 className="page-title">段落生成</h1>
          <p className="page-subtitle">基于提取的写作逻辑和您的实验数据，生成原创论文段落。</p>
        </div>
        {result && (
          <div className="export-actions">
            <button className="btn btn-outline">
              <Download size={16} /> 导出 Word
            </button>
            <button className="btn btn-outline">
              <Download size={16} /> 导出 Markdown
            </button>
          </div>
        )}
      </div>

      <div className="analysis-layout">
        <div className="left-panel generation-config">
          <div className="card">
            <div className="card-header">
              <h3><Settings size={20} style={{display:'inline', marginRight:8, verticalAlign:'sub'}}/>生成配置</h3>
            </div>
            
            <div className="form-group">
              <label className="label">目标章节</label>
              <select 
                className="input-field" 
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value)}
              >
                <option>实验方法</option>
                <option>结果分析</option>
                <option>机理解释</option>
                <option>图表说明</option>
                <option>结论部分</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="label">写作风格</label>
              <select 
                className="input-field"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                <option>SCI 论文风格</option>
                <option>硕士论文风格</option>
                <option>中文核心期刊风格</option>
                <option>简洁说明风格</option>
              </select>
            </div>

            <div className="config-summary">
              <p><strong>当前数据源：</strong> 水胶比对屈服应力的影响</p>
              <p><strong>使用的模板：</strong> 结果与讨论模板</p>
            </div>

            <div className="card-footer">
              <button 
                className="btn btn-primary w-full" 
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? <PenTool className="spin" size={16} /> : <PenTool size={16} />}
                {isGenerating ? '正在生成原创段落...' : '开始生成段落'}
              </button>
            </div>
          </div>
        </div>

        <div className="right-panel">
          {result ? (
            <div className="card result-content-card animate-fade-in">
              <div className="card-header">
                <h3>生成结果</h3>
                <div className="action-buttons">
                  <button className="btn btn-outline btn-sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit3 size={14} /> {isEditing ? '完成' : '编辑'}
                  </button>
                </div>
              </div>
              
              {riskAlerts.length > 0 && (
                <div className="feedback-alert warning">
                  <AlertTriangle size={18} className="alert-icon" />
                  <div className="alert-content">
                    <strong>引用提醒与风险</strong>
                    {riskAlerts.map((alert, idx) => (
                      <p key={idx}>{alert}</p>
                    ))}
                  </div>
                </div>
              )}

              {isEditing ? (
                <textarea 
                  className="input-field editor-textarea"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                />
              ) : (
                <div className="generated-text">
                  {result}
                </div>
              )}
              
              <div className="card-footer">
                <button className="btn btn-secondary">缩短文本</button>
                <button className="btn btn-secondary" style={{marginLeft: 8}}>优化语言</button>
                <button className="btn btn-primary" style={{marginLeft: 8}}>重新生成</button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <PenTool size={48} className="empty-icon" />
              <p>调整配置后点击生成按钮</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParagraphGeneration;
