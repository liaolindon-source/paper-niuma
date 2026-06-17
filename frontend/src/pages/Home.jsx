import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, Database } from 'lucide-react';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <h1 className="page-title">欢迎使用论文牛马</h1>
      <p className="page-subtitle">专为理工科研究生打造的科研写作辅助工具</p>
      
      <div className="action-grid">
        <div className="action-card primary" onClick={() => navigate('/reference')}>
          <div className="icon-wrapper">
            <PlusCircle size={32} />
          </div>
          <h3>新建分析项目</h3>
          <p>从上传参考论文或实验数据开始您的写作</p>
        </div>
        
        <div className="action-card" onClick={() => navigate('/reference')}>
          <div className="icon-wrapper">
            <FileText size={32} />
          </div>
          <h3>参考片段分析</h3>
          <p>上传文献截图，提取优秀写作逻辑</p>
        </div>
        
        <div className="action-card" onClick={() => navigate('/data')}>
          <div className="icon-wrapper">
            <Database size={32} />
          </div>
          <h3>实验数据分析</h3>
          <p>导入您的数据，自动分析趋势与规律</p>
        </div>
      </div>
      
      <div className="recent-projects">
        <h3>最近项目</h3>
        <div className="project-list">
          <div className="project-item">
            <div className="project-icon"><FileText size={20} /></div>
            <div className="project-details">
              <h4>EVA改性水泥砂浆流变性能分析</h4>
              <span>2026-06-17 • 包含 2 个参考片段, 1 份数据</span>
            </div>
            <button className="btn btn-outline" onClick={() => navigate('/generate')}>继续写作</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
