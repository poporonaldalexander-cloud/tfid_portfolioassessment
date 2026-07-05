'use client';
import { useEffect, useRef } from 'react';

export default function Page() {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    import('../lib/app').then((m) => m.default());
  }, []);

  return (
    <>
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <div className="logo">
              <img className="brand-mark" src="/logo-mark.png" alt="Tanoto Foundation" />
              <div>
                <div className="name">Tanoto Foundation</div>
                <div className="sub">Portfolio Assessment</div>
              </div>
            </div>
          </div>
          <nav className="nav" id="nav"></nav>
          <div className="side-foot">TFID Portfolio Assessment<br />Workbook v1.0 · Tanoto Foundation</div>
        </aside>
        <div className="main">
          <div className="topbar">
            <div>
              <h1 id="pageTitle">Dashboard</h1>
              <div className="crumb" id="pageCrumb"></div>
            </div>
            <div className="spacer"></div>
            <span className="sync" id="syncDot">Ready</span>
            <div className="dl-wrap"><button className="btn" id="dlBtn">⤓ Download</button><div className="dl-menu" id="dlMenu"></div></div>
            <div id="topActions"></div>
          </div>
          <div className="content" id="view"></div>
        </div>
      </div>
      <div className="overlay" id="overlay"><div className="modal" id="modal"></div></div>
      <div className="toast" id="toast"></div>
    </>
  );
}
