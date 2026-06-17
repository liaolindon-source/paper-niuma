import React, { useState } from 'react';
import { RefreshCw, Edit3, CheckCircle, Search, FileText } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import './ReferenceAnalysis.css';

const ReferenceAnalysis = () => {
  const [file, setFile] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [logicResult, setLogicResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleUpload = async (uploadedFile) => {
    setFile(uploadedFile);
    if (uploadedFile) {
      try {
        const response = await fetch('http://localhost:8000/api/ocr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ file_path: uploadedFile.name }) // using name as mock path
        });
        const result = await response.json();
        if (result.status === 'success') {
          setOcrText(result.text);
        }
      } catch (err) {
        console.error("OCR failed", err);
      }
    } else {
      setOcrText('');
      setLogicResult(null);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:8000/api/generate/logic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ocr_text: ocrText })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setLogicResult(result);
      }
    } catch (err) {
      console.error("Logic analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="reference-analysis-page animate-fade-in">
      <h1 className="page-title">参考片段分析</h1>
      <p className="page-subtitle">上传优秀论文片段截图，系统将提取其写作逻辑作为模板。</p>
      
      <div className="analysis-layout">
        <div className="left-panel">
          <div className="card">
            <h3>1. 上传文献截图</h3>
            <FileUpload 
              accept="image/png, image/jpeg" 
              onUpload={handleUpload} 
              description="支持 PNG, JPG, JPEG 格式图片"
            />
          </div>

          {ocrText && (
            <div className="card ocr-result-card animate-fade-in">
              <div className="card-header">
                <h3>2. OCR 识别内容</h3>
                <button className="btn btn-outline" onClick={() => setIsEditing(!isEditing)}>
                  <Edit3 size={16} />
                  {isEditing ? '完成编辑' : '编辑文本'}
                </button>
              </div>
              
              {isEditing ? (
                <textarea 
                  className="input-field ocr-textarea"
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  rows={6}
                />
              ) : (
                <div className="ocr-text-display">
                  {ocrText}
                </div>
              )}
              
              <div className="card-footer">
                <button 
                  className="btn btn-primary" 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? <RefreshCw className="spin" size={16} /> : <Search size={16} />}
                  分析写作逻辑
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="right-panel">
          {logicResult ? (
            <div className="card logic-result-card animate-fade-in">
              <div className="card-header">
                <h3>写作逻辑分析结果</h3>
                <span className="badge">识别成功</span>
              </div>
              
              <div className="logic-section">
                <h4>段落类型</h4>
                <p>{logicResult.type}</p>
              </div>
              
              <div className="logic-section">
                <h4>写作逻辑框架</h4>
                <ol className="logic-steps">
                  {logicResult.steps.map((step, index) => (
                    <li key={index}>
                      <span className="step-num">{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              
              <div className="logic-section">
                <h4>可迁移写作模板</h4>
                <div className="template-box">
                  {logicResult.template}
                </div>
              </div>
              
              <div className="card-footer">
                <button className="btn btn-primary">
                  <CheckCircle size={16} />
                  保存为写作模板
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <FileText size={48} className="empty-icon" />
              <p>分析结果将在这里显示</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferenceAnalysis;
