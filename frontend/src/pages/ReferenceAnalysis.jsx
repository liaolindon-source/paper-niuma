import { useState } from 'react';
import { CheckCircle, Edit3, FileText, RefreshCw, Search } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { apiJson, getFlowState, updateFlowState, uploadFile } from '../api';
import './ReferenceAnalysis.css';

const ReferenceAnalysis = () => {
  const [uploaded, setUploaded] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrConfidence, setOcrConfidence] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [logicResult, setLogicResult] = useState(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (file) => {
    setError('');
    setLogicResult(null);
    setOcrText('');
    setUploaded(null);
    if (!file) return;

    setIsOcrLoading(true);
    try {
      const uploadResult = await uploadFile(file);
      setUploaded(uploadResult);
      const ocrResult = await apiJson('/ocr/', { file_path: uploadResult.saved_path });
      setOcrText(ocrResult.text);
      setOcrConfidence(ocrResult.confidence);
      updateFlowState({
        referenceFile: uploadResult,
        ocrText: ocrResult.text,
        ocrConfidence: ocrResult.confidence,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setError('');
    setIsAnalyzing(true);
    try {
      const result = await apiJson('/generate/logic', { ocr_text: ocrText });
      setLogicResult(result);
      updateFlowState({ ocrText, writingLogic: result });
      const { project, referenceFile } = getFlowState();
      if (project?.id) {
        apiJson('/project/reference', {
          project_id: project.id,
          image_path: referenceFile?.saved_path || uploaded?.saved_path || '',
          original_ocr_text: ocrText,
          cleaned_ocr_text: ocrText,
          writing_logic: result,
        }).then((saved) => updateFlowState({ referenceRecord: saved.reference })).catch(() => {});
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="reference-analysis-page animate-fade-in">
      <h1 className="page-title">参考片段分析</h1>
      <p className="page-subtitle">上传论文截图，提取文字并整理为可迁移的写作逻辑。</p>

      {error && <div className="feedback-alert warning">{error}</div>}

      <div className="analysis-layout">
        <div className="left-panel">
          <div className="card">
            <h3>1. 上传文献截图</h3>
            <FileUpload
              accept="image/png, image/jpeg"
              onUpload={handleUpload}
              description="支持 PNG、JPG、JPEG"
            />
            {isOcrLoading && <p className="page-subtitle">正在上传并识别图片...</p>}
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

              {ocrConfidence !== null && (
                <span className="badge">置信度 {Math.round(ocrConfidence * 100)}%</span>
              )}

              {isEditing ? (
                <textarea
                  className="input-field ocr-textarea"
                  value={ocrText}
                  onChange={(event) => setOcrText(event.target.value)}
                  rows={8}
                />
              ) : (
                <div className="ocr-text-display">{ocrText}</div>
              )}

              <div className="card-footer">
                <button className="btn btn-primary" onClick={handleAnalyze} disabled={isAnalyzing}>
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
                <span className="badge">已生成</span>
              </div>

              <div className="logic-section">
                <h4>段落类型</h4>
                <p>{logicResult.type}</p>
              </div>

              <div className="logic-section">
                <h4>写作逻辑框架</h4>
                <ol className="logic-steps">
                  {logicResult.steps.map((step, index) => (
                    <li key={step}>
                      <span className="step-num">{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="logic-section">
                <h4>可迁移写作模板</h4>
                <div className="template-box">{logicResult.template}</div>
              </div>

              <div className="card-footer">
                <button className="btn btn-primary" onClick={() => updateFlowState({ writingLogic: logicResult, referenceFile: uploaded })}>
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
