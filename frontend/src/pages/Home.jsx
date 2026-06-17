import { useNavigate } from 'react-router-dom';
import { Database, FileText, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { apiJson, updateFlowState } from '../api';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('EVA 改性水泥砂浆流变性能分析');
  const [researchField, setResearchField] = useState('工程材料');
  const [error, setError] = useState('');

  const createProject = async () => {
    setError('');
    try {
      const result = await apiJson('/project/save', {
        name: projectName,
        research_field: researchField,
      });
      updateFlowState({ project: result.project });
      navigate('/reference');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="home-page">
      <h1 className="page-title">论文牛马</h1>
      <p className="page-subtitle">从参考截图和实验数据生成论文结果分析段落。</p>

      {error && <div className="feedback-alert warning">{error}</div>}

      <div className="action-grid">
        <div className="action-card primary" onClick={() => navigate('/reference')}>
          <div className="icon-wrapper">
            <PlusCircle size={32} />
          </div>
          <h3>开始 MVP 流程</h3>
          <p>先上传参考论文截图，再上传实验数据，最后生成论文段落。</p>
        </div>

        <div className="action-card" onClick={() => navigate('/reference')}>
          <div className="icon-wrapper">
            <FileText size={32} />
          </div>
          <h3>参考片段分析</h3>
          <p>识别截图文字，提取可迁移的写作逻辑。</p>
        </div>

        <div className="action-card" onClick={() => navigate('/data')}>
          <div className="icon-wrapper">
            <Database size={32} />
          </div>
          <h3>实验数据分析</h3>
          <p>解析 Excel 或 CSV，计算趋势和关键数值。</p>
        </div>
      </div>

      <div className="recent-projects">
        <h3>新建项目</h3>
        <div className="project-list">
          <div className="project-item">
            <div className="project-details">
              <input className="input-field" value={projectName} onChange={(event) => setProjectName(event.target.value)} />
              <input className="input-field" value={researchField} onChange={(event) => setResearchField(event.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={createProject}>创建并开始</button>
          </div>
        </div>
      </div>

      <div className="recent-projects">
        <h3>主流程</h3>
        <div className="project-list">
          <div className="project-item">
            <div className="project-icon"><FileText size={20} /></div>
            <div className="project-details">
              <h4>截图识别 → 逻辑分析 → 数据趋势 → 段落生成</h4>
              <span>当前版本优先支撑最小可用闭环。</span>
            </div>
            <button className="btn btn-outline" onClick={() => navigate('/reference')}>进入流程</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
