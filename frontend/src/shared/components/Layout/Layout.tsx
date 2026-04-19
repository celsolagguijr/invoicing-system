import React from "react";
import { Layout as AntLayout } from "antd";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "./styles.less";

const { Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
  userName?: string;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userName, onLogout }) => {
  return (
    <AntLayout
      style={{
        height: "100vh",
        backgroundColor: "#fff",
      }}
    >
      <Sidebar />
      <AntLayout style={{ display: "flex", flexDirection: "column" }}>
        <TopBar onLogout={onLogout} userName={userName} />
        <Content
          style={{
            padding: "24px",
            background: "#f5f5f5",
            overflowY: "auto",
            flex: 1,
            minHeight: 0,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              color: "#000",
              width: "100%",
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
