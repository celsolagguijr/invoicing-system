import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import dayjs from "dayjs";
import Page from "@components/Page";
import { Layout } from "@components/Layout";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import {
  BarChartOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { useService } from "@contexts/ServiceContext";
import type { ApiResponse } from "@app/shared/types/axios";
import type { Employee } from "@app/services/EmployeeService";
import type { Client } from "@app/services/ClientService";
import type { InvoiceItem } from "@app/services/InvoiceService";

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { auth, employee, client, invoice } = useService();
  const [nowTime, setNowTime] = React.useState(dayjs());

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowTime(dayjs());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const now = dayjs();
  const monthStart = now.startOf("month").format("YYYY-MM-DD");
  const monthEnd = now.endOf("month").format("YYYY-MM-DD");

  const employeesQuery = useQuery<ApiResponse<Employee[]>, AxiosError>({
    queryKey: ["dashboard-employees-count"],
    queryFn: async () => employee.getEmployees(),
    retry: 1,
  });

  const clientsQuery = useQuery<ApiResponse<Client[]>, AxiosError>({
    queryKey: ["dashboard-clients-count"],
    queryFn: async () => client.getClients(),
    retry: 1,
  });

  const invoicesQuery = useQuery<ApiResponse<InvoiceItem[]>, AxiosError>({
    queryKey: ["dashboard-month-invoices", monthStart, monthEnd],
    queryFn: async () =>
      invoice.searchInvoices({
        invoice_date_from: monthStart,
        invoice_date_to: monthEnd,
      }),
    retry: 1,
  });

  const employees = employeesQuery.data?.data || [];
  const clients = clientsQuery.data?.data || [];
  const monthInvoices = invoicesQuery.data?.data || [];

  const monthRevenue = monthInvoices.reduce(
    (sum, current) => sum + Number(current.total_amount || 0),
    0
  );

  const recentInvoices = [...monthInvoices]
    .sort(
      (a, b) =>
        new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime()
    )
    .slice(0, 5);

  const userDetails = auth.getUserDetails();
  const userName = userDetails
    ? `${userDetails.firstName} ${userDetails.lastName}`
    : "User";

  const isLoadingSummary =
    employeesQuery.isLoading ||
    clientsQuery.isLoading ||
    invoicesQuery.isLoading;

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <Layout onLogout={handleLogout} userName={userName}>
      <Page title="Dashboard">
        <Card
          style={{
            border: "none",
            borderRadius: 14,
            marginBottom: 16,
            background:
              "linear-gradient(120deg, #0f62fe 0%, #2f86ff 45%, #6ea8ff 100%)",
          }}
          bodyStyle={{ padding: 24 }}
        >
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col xs={24} md={16}>
              <Space direction="vertical" size={6}>
                <Tag
                  color="blue"
                  style={{
                    width: "fit-content",
                    borderRadius: 999,
                    border: "none",
                    background: "#ffffff",
                    color: "#0f62fe",
                    fontWeight: 600,
                  }}
                >
                  {now.format("dddd, MMMM D, YYYY")}
                </Tag>
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 0.6,
                  }}
                >
                  GH CAREGROUP SERVICES
                </Text>
                <Title level={2} style={{ margin: 0, color: "#fff" }}>
                  Welcome back, {userName}
                </Title>
                <Text style={{ color: "#ffffff", fontSize: 15 }}>
                  Here is your billing snapshot for {now.format("MMMM YYYY")}.
                  Monitor your numbers and jump directly to key workflows.
                </Text>
                <Text
                  style={{ color: "#ffffff", fontWeight: 600, fontSize: 16 }}
                >
                  Current Time: {nowTime.format("hh:mm:ss A")}
                </Text>
              </Space>
            </Col>

            <Col xs={24} md={8}>
              <Space wrap style={{ justifyContent: "flex-end", width: "100%" }}>
                <Button onClick={() => navigate("/invoices")}>
                  View Invoices
                </Button>
                <Button onClick={() => navigate("/timelogs")}>
                  View Timelogs
                </Button>
                <Button
                  type="default"
                  style={{
                    background: "#ffffff",
                    borderColor: "#ffffff",
                    color: "#0f62fe",
                    fontWeight: 600,
                  }}
                  onClick={() => navigate("/reports/overall-timelog-summary")}
                >
                  Open Reports
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card loading={isLoadingSummary}>
              <Statistic
                title="Employees"
                value={employees.length}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card loading={isLoadingSummary}>
              <Statistic
                title="Clients"
                value={clients.length}
                prefix={<UsergroupAddOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card loading={isLoadingSummary}>
              <Statistic
                title="Invoices This Month"
                value={monthInvoices.length}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card loading={isLoadingSummary}>
              <Statistic
                title="Revenue This Month"
                value={formatMoney(monthRevenue)}
                prefix={<DollarCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
          <Col xs={24} lg={16}>
            <Card title="Recent Invoices">
              <List
                dataSource={recentInvoices}
                locale={{
                  emptyText: "No invoices found for the current month yet.",
                }}
                renderItem={(item) => (
                  <List.Item
                    onClick={() => navigate(`/invoices/${item.id}`)}
                    style={{
                      cursor: "pointer",
                      borderRadius: 10,
                      paddingInline: 8,
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{ background: "#e6f4ff", color: "#0958d9" }}
                        >
                          {item.invoice_no.slice(-2)}
                        </Avatar>
                      }
                      title={item.invoice_no}
                      description={`${item.client?.name || "Unknown Client"} • ${dayjs(
                        item.invoice_date
                      ).format("YYYY-MM-DD")}`}
                    />
                    <Text strong>
                      {formatMoney(Number(item.total_amount || 0))}
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Quick Actions">
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Button block onClick={() => navigate("/employees")}>
                  Manage Employees
                </Button>
                <Button block onClick={() => navigate("/clients")}>
                  Manage Clients
                </Button>
                <Button block onClick={() => navigate("/timelogs")}>
                  Manage Timelogs
                </Button>
                <Button
                  block
                  type="primary"
                  onClick={() => navigate("/invoices")}
                >
                  Search Invoices
                </Button>
              </Space>

              <Divider style={{ marginBlock: 16 }} />

              <Space direction="vertical" style={{ width: "100%" }} size={8}>
                <Text strong>Month Progress</Text>
                <Progress
                  percent={Math.round((now.date() / now.daysInMonth()) * 100)}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {now.date()} of {now.daysInMonth()} days completed
                </Text>
              </Space>

              <Divider style={{ marginBlock: 16 }} />

              <Space align="start" size={8}>
                <BarChartOutlined style={{ marginTop: 3, color: "#0958d9" }} />
                <Text type="secondary">
                  Tip: Keep timelogs updated daily to keep invoice totals
                  accurate.
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Page>
    </Layout>
  );
};

export default Dashboard;
