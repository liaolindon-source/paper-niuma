import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FileText, Database, Image, Home, LayoutTemplate } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>论文牛马</h2>
          <span className="subtitle">研析写作助手</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'} end>
            <Home size={20} />
            首页
          </NavLink>
          <NavLink to="/reference" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <FileText size={20} />
            参考分析
          </NavLink>
          <NavLink to="/data" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <Database size={20} />
            数据分析
          </NavLink>
          <NavLink to="/generate" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <LayoutTemplate size={20} />
            段落生成
          </NavLink>
          <NavLink to="/chart" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <Image size={20} />
            图表生成
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <div className="project-info">
            <span className="label">当前项目：</span>
            <strong>EVA改性水泥砂浆流变性能分析</strong>
          </div>
        </header>
        <div className="content-area animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
