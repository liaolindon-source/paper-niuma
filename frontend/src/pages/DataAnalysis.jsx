import { useState } from 'react';
import { BarChart2, Table as TableIcon } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { apiJson, getFlowState, updateFlowState, uploadFile } from '../api';
import './DataAnalysis.css';

const DataAnalysis = () => {
  const [uploaded, setUploaded] = useState(null);
  const [data, setData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [numericColumns, setNumericColumns] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [independentVar, setIndependentVar] = useState('');
  const [dependentVar, setDependentVar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (file) => {
    setError('');
    setData(null);
    setAnalysisResult(null);
    setUploaded(null);
    if (!file) return;

    setIsLoading(true);
    try {
      const uploadResult = await uploadFile(file);
      const parsed = await apiJson('/data/parse', { file_path: uploadResult.saved_path });
      setUploaded(uploadResult);
      setData(parsed.preview);
      setColumns(parsed.columns);
      setNumericColumns(parsed.numeric_columns);
      setIndependentVar(parsed.columns[0] || '');
      setDependentVar(parsed.numeric_columns[0] || parsed.columns[1] || '');
      updateFlowState({ dataFile: uploadResult, parsedData: parsed });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploaded) return;
    setError('');
    try {
      const result = await apiJson('/data/trend', {
        file_path: uploaded.saved_path,
        independent_var: independentVar,
        dependent_var: dependentVar,
      });
      setAnalysisResult(result);
      updateFlowState({ dataAnalysis: result });
      const { project, dataFile } = getFlowState();
      if (project?.id) {
        apiJson('/project/dataset', {
          project_id: project.id,
          file_name: dataFile?.file_name || uploaded.file_name,
          file_path: uploaded.saved_path,
          variables: [independentVar],
          indicators: [dependentVar],
          analysis_result: result,
        }).then((saved) => updateFlowState({ datasetRecord: saved.dataset })).catch(() => {});
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="data-analysis-page animate-fade-in">
      <h1 className="page-title">实验数据分析</h1>
      <p className="page-subtitle">上传 Excel 或 CSV，选择变量后生成趋势分析。</p>

      {error && <div className="feedback-alert warning">{error}</div>}

      <div className="card mb-4">
        <h3>上传数据文件</h3>
        <FileUpload accept=".xlsx, .xls, .csv" onUpload={handleUpload} description="支持 Excel 和 CSV" />
        {isLoading && <p className="page-subtitle">正在解析数据...</p>}
      </div>

      {data && data.length > 0 && (
        <div className="analysis-layout">
          <div className="left-panel">
            <div className="card">
              <div className="card-header">
                <h3><TableIcon size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'sub' }} />数据预览</h3>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>{columns.map((key) => <th key={key}>{key}</th>)}</tr>
                  </thead>
                  <tbody>
                    {data.map((row, rowIndex) => (
                      <tr key={`${rowIndex}-${Object.values(row).join('-')}`}>
                        {columns.map((key) => <td key={key}>{row[key]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3>变量设置</h3>
              <div className="form-group">
                <label className="label">选择自变量 X</label>
                <select className="input-field" value={independentVar} onChange={(event) => setIndependentVar(event.target.value)}>
                  {columns.map((key) => <option key={key} value={key}>{key}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">选择因变量 Y</label>
                <select className="input-field" value={dependentVar} onChange={(event) => setDependentVar(event.target.value)}>
                  {(numericColumns.length ? numericColumns : columns).map((key) => <option key={key} value={key}>{key}</option>)}
                </select>
              </div>
              <div className="card-footer">
                <button className="btn btn-primary" onClick={handleAnalyze}>生成趋势分析</button>
              </div>
            </div>
          </div>

          <div className="right-panel">
            {analysisResult ? (
              <div className="card logic-result-card animate-fade-in">
                <div className="card-header">
                  <h3><BarChart2 size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'sub' }} />分析结果</h3>
                </div>

                <div className="result-grid">
                  <div className="result-item"><span className="result-label">自变量</span><span className="result-value">{analysisResult.independent}</span></div>
                  <div className="result-item"><span className="result-label">因变量</span><span className="result-value">{analysisResult.dependent}</span></div>
                  <div className="result-item"><span className="result-label">趋势</span><span className="result-value text-primary">{analysisResult.trend}</span></div>
                  <div className="result-item"><span className="result-label">最大值</span><span className="result-value">{analysisResult.max}</span></div>
                  <div className="result-item"><span className="result-label">最小值</span><span className="result-value">{analysisResult.min}</span></div>
                  <div className="result-item"><span className="result-label">变化幅度</span><span className="result-value">{analysisResult.rate}</span></div>
                </div>

                <div className="logic-section mt-4">
                  <h4>初步结论</h4>
                  <div className="template-box">{analysisResult.conclusion}</div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <BarChart2 size={48} className="empty-icon" />
                <p>配置变量后点击生成趋势分析</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnalysis;
