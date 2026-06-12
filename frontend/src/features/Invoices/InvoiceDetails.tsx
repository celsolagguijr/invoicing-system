import {
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
  PlusOutlined,
  SendOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import Page from "@app/shared/components/Page";
import { Layout } from "@components/Layout";
import {
  adjustmentTable,
  formatMoney,
  timelogSummaryTable,
} from "./DetailsTableSchema";
import InvoiceTotalCard from "./InvoiceTotalCard";
import useInvoiceDetails from "./useInvoiceDetails";

const { Text } = Typography;

const InvoiceDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const invoiceId = id ? Number(id) : undefined;
  const {
    invoice,
    additions,
    deductions,
    isLoading,
    isDownloadingPdf,
    isPreviewingPdf,
    isDeleting,
    isSaving,
    handleDownloadPdf,
    handlePreviewPdf,
    handleDeleteInvoice,
    handleSaveAdjustments,
    handleAddAdjustment,
    handleDeleteItem,
    handleAdjustmentChange,
  } = useInvoiceDetails(invoiceId);

  const pageTitle = invoice
    ? `Invoice ${invoice.invoice_no}`
    : "Invoice Details";

  const totalAdditions = additions.reduce(
    (acc, prev) => acc + prev.quantity * prev.price,
    0
  );

  const totalDeductions = deductions.reduce(
    (acc, prev) => acc + prev.quantity * prev.price,
    0
  );

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
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label="Client Name">
                          {invoice.client?.name || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Regular Rate">
                          {formatMoney(invoice.client?.hourly_rate)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Owner">
                          {invoice.client?.owner || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="OT Rate">
                          {formatMoney(invoice.client?.ot_hourly_rate)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Address 1" span={2}>
                          {invoice.client?.address1 || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Address 2" span={2}>
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

                    <Card title="Timelog Summary" size="small">
                      <Table
                        columns={timelogSummaryTable}
                        dataSource={invoice.invoice_details || []}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 900 }}
                      />
                    </Card>
                    <Card
                      title="Other Charges (+)"
                      size="small"
                      extra={
                        <Button
                          type="primary"
                          size="small"
                          loading={isSaving}
                          icon={<SendOutlined />}
                          onClick={handleSaveAdjustments}
                        >
                          Save
                        </Button>
                      }
                    >
                      <Table
                        columns={adjustmentTable(
                          handleAdjustmentChange,
                          handleDeleteItem
                        )}
                        dataSource={additions}
                        rowKey="rowKey"
                        pagination={false}
                        scroll={{ x: 750 }}
                        locale={{ emptyText: "No additional items" }}
                      />
                      <div
                        style={{
                          marginTop: 12,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Button
                          icon={<PlusOutlined />}
                          size="small"
                          onClick={() => handleAddAdjustment("ADDITIONAL")}
                        >
                          Add Row
                        </Button>
                        <div>
                          <Text strong>Total:</Text>
                          <Text strong style={{ marginLeft: 8 }}>
                            {formatMoney(totalAdditions)}
                          </Text>
                        </div>
                      </div>
                    </Card>

                    <Card
                      title="Adjustments (-)"
                      size="small"
                      extra={
                        <Button
                          type="primary"
                          size="small"
                          loading={isSaving}
                          icon={<SendOutlined />}
                          onClick={handleSaveAdjustments}
                        >
                          Save
                        </Button>
                      }
                    >
                      <Table
                        columns={adjustmentTable(
                          handleAdjustmentChange,
                          handleDeleteItem
                        )}
                        dataSource={deductions}
                        rowKey="rowKey"
                        pagination={false}
                        scroll={{ x: 750 }}
                        locale={{ emptyText: "No deduction items" }}
                      />
                      <div
                        style={{
                          marginTop: 12,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Button
                          icon={<PlusOutlined />}
                          size="small"
                          onClick={() => handleAddAdjustment("DEDUCTION")}
                        >
                          Add Row
                        </Button>
                        <div>
                          <Text strong>Total:</Text>
                          <Text strong style={{ marginLeft: 8 }}>
                            {formatMoney(totalDeductions)}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Space>
                </Col>

                <Col xs={24} lg={8}>
                  <Card title="Invoice Totals" size="small">
                    <InvoiceTotalCard
                      title={"Base Charges (Regular + OT)"}
                      amount={invoice.total_amount}
                      variant="secondary"
                    />

                    {totalAdditions > 0 && (
                      <InvoiceTotalCard
                        title={"Other Charges (+)"}
                        amount={totalAdditions}
                        variant="secondary"
                      />
                    )}
                    {totalDeductions > 0 && (
                      <InvoiceTotalCard
                        title={"Adjustments (-)"}
                        amount={totalDeductions}
                        variant="danger"
                      />
                    )}
                    <InvoiceTotalCard
                      title={"Grand Total"}
                      amount={
                        invoice.total_amount + totalAdditions - totalDeductions
                      }
                      variant="primary"
                    />
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
