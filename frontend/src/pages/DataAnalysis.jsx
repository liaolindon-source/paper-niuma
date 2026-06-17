import React, { useState } from 'react';
import { BarChart2, Table as TableIcon } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import './DataAnalysis.css';

const mockData = [
  { "水胶比": 0.30, "砂胶比": 1.5, "屈服应力(Pa)": 145.2, "稠度系数(Pa·s)": 12.5 },
  { "水胶比": 0.35, "砂胶比": 1.5, "屈服应力(Pa)": 110.8, "稠度系数(Pa·s)": 9.2 },
  { "水胶比": 0.40, "砂胶比": 1.5, "屈服应力(Pa)": 86.3, "稠度系数(Pa·s)": 6.8 },
  { "水胶比": 0.45, "砂胶比": 1.5, "屈服应力(Pa)": 55.4, "稠度系数(Pa·s)": 4.1 },
];

const DataAnalysis = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const [independentVar, setIndependentVar] = useState('');
  const [dependentVar, setDependentVar] = useState('');

  const handleUpload = async (uploadedFile) => {
    setFile(uploadedFile);
    if (uploadedFile) {
      // Call backend parse API
      try {
        const response = await fetch('http://localhost:8000/api/data/parse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ file_path: uploadedFile.name }) // Passing name as mock path
        });
        const result = await response.json();
        if (result.status === 'success') {
          setData(result.preview);
          setIndependentVar(result.columns[0]);
          setDependentVar(result.columns[2] || result.columns[1]);
        }
      } catch (err) {
        console.error("Failed to parse data", err);
      }
    } else {
      setData(null);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/data/trend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          file_path: file.name,
          independent_var: independentVar,
          dependent_var: dependentVar
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setAnalysisResult(result);
      }
    } catch (err) {
      console.error("Failed to analyze trend", err);
    }
  };

  return (
    <div className="data-analysis-page animate-fade-in">
      <h1 className="page-title">实验数据分析</h1>
      <p className="page-subtitle">上传 Excel 或 CSV 数据，自动识别变量并生成变化趋势结论。</p>
      
      <div className="card mb-4">
        <h3>上传数据文件</h3>
        <FileUpload 
          accept=".xlsx, .xls, .csv" 
          onUpload={handleUpload} 
          description="支持 Excel 和 CSV 格式"
        />
      </div>

      {data && (
        <div className="analysis-layout">
          <div className="left-panel">
            <div className="card">
              <div className="card-header">
                <h3><TableIcon size={20} style={{display:'inline', marginRight:8, verticalAlign:'sub'}}/>数据预览</h3>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      {Object.keys(data[0]).map(key => <th key={key}>{key}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => <td key={j}>{val}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3>变量设置</h3>
              <div className="form-group">
                <label className="label">选择自变量 (X轴)</label>
                <select 
                  className="input-field" 
                  value={independentVar}
                  onChange={(e) => setIndependentVar(e.target.value)}
                >
                  {Object.keys(data[0]).map(key => <option key={key} value={key}>{key}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">选择因变量 (Y轴)</label>
                <select 
                  className="input-field"
                  value={dependentVar}
                  onChange={(e) => setDependentVar(e.target.value)}
                >
                  {Object.keys(data[0]).map(key => <option key={key} value={key}>{key}</option>)}
                </select>
              </div>
              <div className="card-footer">
                <button className="btn btn-primary" onClick={handleAnalyze}>
                  生成趋势分析
                </button>
              </div>
            </div>
          </div>

          <div className="right-panel">
            {analysisResult ? (
              <div className="card logic-result-card animate-fade-in">
                <div className="card-header">
                  <h3><BarChart2 size={20} style={{display:'inline', marginRight:8, verticalAlign:'sub'}}/>分析结果</h3>
                </div>
                
                <div className="result-grid">
                  <div className="result-item">
                    <span className="result-label">自变量</span>
                    <span className="result-value">{analysisResult.independent}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">因变量</span>
                    <span className="result-value">{analysisResult.dependent}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">整体趋势</span>
                    <span className="result-value text-primary">{analysisResult.trend}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">最大值</span>
                    <span className="result-value">{analysisResult.max}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">最小值</span>
                    <span className="result-value">{analysisResult.min}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">变化幅度</span>
                    <span className="result-value">{analysisResult.rate}</span>
                  </div>
                </div>

                <div className="logic-section mt-4">
                  <h4>初步结论</h4>
                  <div className="template-box">
                    {analysisResult.conclusion}
                  </div>
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
