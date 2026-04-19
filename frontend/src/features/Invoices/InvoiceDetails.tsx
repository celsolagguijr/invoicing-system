import React from "react";
import {
  message,
  Button,
  Card,
  Col,
  Descriptions,
  Popconfirm,
  Row,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import Page from "@app/shared/components/Page";
import { Layout } from "@components/Layout";
import { useService } from "@contexts/ServiceContext";
import type { InvoiceDetailItem } from "@app/services/InvoiceService";
import useInvoiceDetails from "./useInvoiceDetails";

const { Text } = Typography;

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const InvoiceDetails: React.FC = () => {
  const navigate = useNavigate();
  const { invoice: invoiceService } = useService();
  const { id } = useParams<{ id: string }>();
  const invoiceId = id ? Number(id) : undefined;
  const { invoice, isLoading } = useInvoiceDetails(invoiceId);
  const [isDownloadingPdf, setIsDownloadingPdf] = React.useState(false);
  const [isPreviewingPdf, setIsPreviewingPdf] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const pageTitle = invoice
    ? `Invoice ${invoice.invoice_no}`
    : "Invoice Details";

  const handleDownloadPdf = async () => {
    if (!invoiceId) {
      return;
    }

    try {
      setIsDownloadingPdf(true);
      const pdfBlob = await invoiceService.downloadInvoicePdf(invoiceId);
      const objectUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${invoice?.invoice_no || `invoice-${invoiceId}`}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      message.error("Failed to download PDF invoice");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePreviewPdf = async () => {
    if (!invoiceId) {
      return;
    }

    try {
      setIsPreviewingPdf(true);
      const pdfBlob = await invoiceService.downloadInvoicePdf(invoiceId);
      const objectUrl = window.URL.createObjectURL(pdfBlob);
      const previewWindow = window.open(objectUrl, "_blank");

      if (!previewWindow) {
        window.URL.revokeObjectURL(objectUrl);
        message.error("Popup blocked. Please allow popups to preview PDF.");
        return;
      }

      window.setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 60_000);
    } catch {
      message.error("Failed to preview PDF invoice");
    } finally {
      setIsPreviewingPdf(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceId) {
      return;
    }

    try {
      setIsDeleting(true);
      await invoiceService.deleteInvoice(invoiceId);
      message.success("Invoice deleted successfully");
      navigate("/invoices");
    } catch {
      message.error("Failed to delete invoice");
    } finally {
      setIsDeleting(false);
    }
  };

  const detailColumns: TableColumnsType<InvoiceDetailItem> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 140,
      render: (value: string) => dayjs(value).format("YYYY-MM-DD"),
    },
    {
      title: "Employee No",
      key: "employee_no",
      width: 150,
      render: (_, record: InvoiceDetailItem) =>
        record.employee?.employee_no || "-",
    },
    {
      title: "Employee Name",
      key: "employee_name",
      width: 220,
      render: (_, record: InvoiceDetailItem) =>
        record.employee?.employee_name || "-",
    },
    {
      title: "Billed Hours",
      dataIndex: "billed_hours",
      key: "billed_hours",
      width: 130,
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Billed OT Hours",
      dataIndex: "billed_ot_hours",
      key: "billed_ot_hours",
      width: 150,
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      width: 280,
      render: (value: string | null) => value || "-",
    },
  ];

  return (
    <Layout>
      <Page
        title={pageTitle}
        headerTitle={pageTitle}
        headerAction={
          <Space>
            <Button
              icon={<EyeOutlined />}
              loading={isPreviewingPdf}
              onClick={handlePreviewPdf}
            >
              Preview PDF
            </Button>
            <Button
              icon={<DownloadOutlined />}
              type="primary"
              loading={isDownloadingPdf}
              onClick={handleDownloadPdf}
            >
              Download PDF
            </Button>
            <Popconfirm
              title="Delete invoice"
              description="Are you sure you want to delete this invoice?"
              okText="Delete"
              cancelText="Cancel"
              onConfirm={handleDeleteInvoice}
            >
              <Button danger icon={<DeleteOutlined />} loading={isDeleting}>
                Delete Invoice
              </Button>
            </Popconfirm>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/invoices")}
            >
              Back to Invoices
            </Button>
          </Space>
        }
      >
        <Spin spinning={isLoading} tip="Loading invoice details...">
          {!invoice ? (
            <Text type="secondary">No invoice data found.</Text>
          ) : (
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                  <Space
                    direction="vertical"
                    size={16}
                    style={{ width: "100%" }}
                  >
                    <Card title="Client Information" size="small">
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Client Name">
                          {invoice.client?.name || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Owner">
                          {invoice.client?.owner || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Address 1">
                          {invoice.client?.address1 || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Address 2">
                          {invoice.client?.address2 || "-"}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>

                    <Card title="Invoice Information" size="small">
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Invoice Date">
                          {dayjs(invoice.invoice_date).format("YYYY-MM-DD")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Due Date">
                          {dayjs(invoice.due_date).format("YYYY-MM-DD")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Coverage Period">
                          {dayjs(invoice.coverage_start).format("YYYY-MM-DD")}{" "}
                          to {dayjs(invoice.coverage_end).format("YYYY-MM-DD")}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>

                    <Card title="Details" size="small">
                      <Table
                        columns={detailColumns}
                        dataSource={invoice.invoice_details || []}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 900 }}
                      />
                    </Card>
                  </Space>
                </Col>

                <Col xs={24} lg={8}>
                  <Card title="Invoice Totals" size="small">
                    <div
                      style={{
                        marginBottom: 10,
                        padding: "10px 12px",
                        background: "#e6f4ff",
                        border: "1px solid #91caff",
                        borderRadius: 8,
                      }}
                    >
                      <Text type="secondary">Hourly Rate</Text>
                      <div>
                        <Text strong style={{ fontSize: 18, color: "#0958d9" }}>
                          {formatMoney(Number(invoice.hourly_rate))}
                        </Text>
                      </div>
                    </div>

                    <div
                      style={{
                        marginBottom: 10,
                        padding: "10px 12px",
                        background: "#fff7e6",
                        border: "1px solid #ffd591",
                        borderRadius: 8,
                      }}
                    >
                      <Text type="secondary">OT Hourly Rate</Text>
                      <div>
                        <Text strong style={{ fontSize: 18, color: "#d46b08" }}>
                          {formatMoney(Number(invoice.ot_hourly_rate))}
                        </Text>
                      </div>
                    </div>

                    <div
                      style={{
                        marginBottom: 10,
                        padding: "10px 12px",
                        background: "#f6ffed",
                        border: "1px solid #b7eb8f",
                        borderRadius: 8,
                      }}
                    >
                      <Text type="secondary">Total Working Hours</Text>
                      <div>
                        <Text strong style={{ fontSize: 18, color: "#237804" }}>
                          {formatMoney(Number(invoice.total_working_hours))}
                        </Text>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        padding: "12px 14px",
                        background: "#f0f5ff",
                        border: "1px solid #d6e4ff",
                        borderRadius: 8,
                      }}
                    >
                      <Text type="secondary">Total Amount</Text>
                      <div>
                        <Text
                          strong
                          style={{
                            fontSize: 24,
                            color: "#1d39c4",
                            lineHeight: 1.2,
                          }}
                        >
                          {formatMoney(Number(invoice.total_amount))}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Space>
          )}
        </Spin>
      </Page>
    </Layout>
  );
};

export default InvoiceDetails;
