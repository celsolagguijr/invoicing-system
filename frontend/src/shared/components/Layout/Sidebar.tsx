import React, { useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  SwapOutlined,
  ProfileOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "@contexts/SidebarContext";
import "./styles.less";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed } = useSidebar();
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const saved = localStorage.getItem("sidebar_open_keys");
    return saved ? JSON.parse(saved) : [];
  });

  const getSelectedKey = () => {
    const pathname = location.pathname;
    if (pathname.includes("reports/overall-timelog-summary"))
      return "reports-overall-timelog-summary";
    if (pathname.includes("reports/employee-timelogs"))
      return "reports-employee-timelogs";
    if (pathname.includes("employees")) return "employees";
    if (pathname.includes("clients")) return "clients";
    if (pathname.includes("invoices")) return "invoices";
    if (pathname.includes("timelogs")) return "timelogs";
    if (pathname.includes("settings")) return "settings";
    return "dashboard";
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "transactions",
      icon: <SwapOutlined />,
      label: "Transactions",
      children: [
        {
          key: "invoices",
          icon: <FileTextOutlined />,
          label: "Invoices",
          onClick: () => navigate("/invoices"),
        },
        {
          key: "timelogs",
          icon: <ClockCircleOutlined />,
          label: "Timelogs",
          onClick: () => navigate("/timelogs"),
        },
      ],
    },
    {
      key: "masterlist",
      icon: <UnorderedListOutlined />,
      label: "Masterlist",
      children: [
        {
          key: "employees",
          icon: <UserOutlined />,
          label: "Employees",
          onClick: () => navigate("/employees"),
        },
        {
          key: "clients",
          icon: <EnvironmentOutlined />,
          label: "Clients",
          onClick: () => navigate("/clients"),
        },
      ],
    },
    {
      key: "reports",
      icon: <BarChartOutlined />,
      label: "Report",
      children: [
        {
          key: "reports-employee-timelogs",
          icon: <ClockCircleOutlined />,
          label: "Employee Timelogs",
          onClick: () => navigate("/reports/employee-timelogs"),
        },
        {
          key: "reports-overall-timelog-summary",
          icon: <BarChartOutlined />,
          label: "Overall Timelog Summary",
          onClick: () => navigate("/reports/overall-timelog-summary"),
        },
      ],
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      children: [
        {
          key: "user-profile",
          icon: <ProfileOutlined />,
          label: "Profile",
          onClick: () => navigate("/user-profile"),
        },
      ],
    },
  ];

  useEffect(() => {
    localStorage.setItem("sidebar_open_keys", JSON.stringify(openKeys));
  }, [openKeys]);

  return (
    <Sider
      collapsed={collapsed}
      collapsible
      trigger={null}
      theme="light"
      style={{
        boxShadow: `2px 0 8px rgba(0, 0, 0, 0.15)`,
        overflowY: "auto",
        backgroundColor: "#1890ff",
      }}
    >
      <div className={`sidebar-logo${collapsed ? " collapsed" : ""}`}>
        <img
          src="/logo.png"
          alt="GH Caregroup Services"
          className="sidebar-logo-image"
        />
        {!collapsed && <h2>Invoicing System</h2>}
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        items={menuItems}
        style={{ borderRight: "none", backgroundColor: "transparent" }}
      />
    </Sider>
  );
};

export default Sidebar;
