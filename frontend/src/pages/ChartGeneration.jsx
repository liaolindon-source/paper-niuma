import { useState } from 'react';
import { Download, FileSpreadsheet, Image as ImageIcon, PieChart } from 'lucide-react';
import './ChartGeneration.css';

const ChartGeneration = () => {
  const [chartType, setChartType] = useState('折线图');
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="chart-generation-page animate-fade-in">
      <div className="header-actions">
        <div>
          <h1 className="page-title">图表与表格生成</h1>
          <p className="page-subtitle">P1 功能预留：后续接入真实数据图表和三线表导出。</p>
        </div>
      </div>

      <div className="analysis-layout">
        <div className="left-panel generation-config">
          <div className="card">
            <div className="card-header">
              <h3><PieChart size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'sub' }} />图表配置</h3>
            </div>

            <div className="form-group">
              <label className="label">图表类型</label>
              <select className="input-field" value={chartType} onChange={(event) => setChartType(event.target.value)}>
                <option>折线图</option>
                <option>三线表</option>
                <option>柱状图</option>
                <option>散点图</option>
                <option>拟合曲线</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">图题 / 表题</label>
              <input type="text" className="input-field" defaultValue="水胶比对砂浆屈服应力的影响" />
            </div>

            <div className="card-footer">
              <button className="btn btn-primary w-full" onClick={() => setShowResult(true)}>
                <ImageIcon size={16} />
                生成预览
              </button>
            </div>
          </div>
        </div>

        <div className="right-panel">
          {showResult ? (
            <div className="card result-content-card animate-fade-in">
              <div className="card-header">
                <h3>生成结果预览</h3>
                <div className="export-actions">
                  <button className="btn btn-outline btn-sm"><Download size={14} /> 导出图片</button>
                  <button className="btn btn-outline btn-sm"><FileSpreadsheet size={14} /> 导出数据</button>
                </div>
              </div>

              <div className="chart-preview-area">
                {chartType === '三线表' ? (
                  <div className="table-preview">
                    <div className="table-title">表 3-5 不同水胶比下砂浆流变参数变化</div>
                    <table className="three-line-table">
                      <thead>
                        <tr><th>水胶比</th><th>屈服应力(Pa)</th><th>稠度系数(Pa·s)</th></tr>
                      </thead>
                      <tbody>
                        <tr><td>0.30</td><td>145.2</td><td>12.5</td></tr>
                        <tr><td>0.35</td><td>110.8</td><td>9.2</td></tr>
                        <tr><td>0.40</td><td>86.3</td><td>6.8</td></tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="chart-placeholder">
                    <ImageIcon size={64} className="placeholder-icon" />
                    <p className="placeholder-title">图 3-4 水胶比对砂浆屈服应力的影响</p>
                    <p className="placeholder-desc">当前是 {chartType} 预览占位，真实图表生成放到 P1 阶段。</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <PieChart size={48} className="empty-icon" />
              <p>配置图表后点击生成预览</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartGeneration;
