import React from "react";
import { Layout, Button, Dropdown, Space, Avatar } from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "@contexts/SidebarContext";
import { useService } from "@contexts/ServiceContext";
import "./styles.less";

const { Header } = Layout;

interface TopBarProps {
  onLogout?: () => void;
  userName?: string;
}

const TopBar: React.FC<TopBarProps> = ({ onLogout, userName = "User" }) => {
  const navigate = useNavigate();
  const { collapsed, setCollapsed } = useSidebar();
  const { auth } = useService();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    auth.logout();
    navigate("/login", { replace: true });
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
      onClick: () => navigate("/user-profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogoutClick,
    },
  ];

  return (
    <Header
      className="topbar-header"
      style={{
        padding: "0 24px",
        backgroundColor: "#1890ff",
        boxShadow: `0 2px 8px rgba(0, 0, 0, 0.15)`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Space size="small">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{ color: "#fff" }}
        />
        <div className="topbar-brand">
          <h1>GH CAREGROUP SERVICES</h1>
        </div>
      </Space>

      <Space size="middle">
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <Button
            type="text"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              color: "#fff",
            }}
          >
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: "#fff", color: "#1890ff" }}
            />
            <span>{userName}</span>
          </Button>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default TopBar;
