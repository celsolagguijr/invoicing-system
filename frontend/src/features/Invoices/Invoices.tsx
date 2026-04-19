import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Space,
  Spin,
  Table,
} from "antd";
import {
  DeleteOutlined,
  ExportOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import Page from "@app/shared/components/Page";
import { Layout } from "@components/Layout";
import { useMessage } from "@app/contexts/MessageContext";
import SearchableSelect, {
  type SearchOption,
} from "@components/SearchableSelect";
import { useService } from "@contexts/ServiceContext";
import type {
  InvoiceItem,
  SearchInvoiceParams,
} from "@app/services/InvoiceService";
import useInvoices from "./useInvoices";
import InvoiceCreateModal from "./InvoiceCreateModal";

type InvoiceSearchForm = {
  invoice_no?: string;
  client_id?: number;
  invoice_date_from?: dayjs.Dayjs;
  invoice_date_to?: dayjs.Dayjs;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const { warning, error: showError, success: showSuccess } = useMessage();
  const { timelog, invoice: invoiceService } = useService();
  const [form] = Form.useForm<InvoiceSearchForm>();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchInvoiceParams>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { invoices, isFetching, refetch, error } = useInvoices(searchParams);

  useEffect(() => {
    if (!error) {
      return;
    }

    showError(error.message || "Failed to search invoices");
  }, [error, showError]);

  const fetchClientOptions = useCallback(
    async (query: string): Promise<SearchOption[]> => {
      const response = await timelog.searchClients(query);
      return (response.data || []).map((client) => ({
        id: client.id,
        label: `${client.name} (ID: ${client.id})`,
      }));
    },
    [timelog]
  );

  const handleSearch = (values: InvoiceSearchForm) => {
    const nextParams: SearchInvoiceParams = {
      invoice_no: values.invoice_no?.trim() || undefined,
      client_id: values.client_id,
      invoice_date_from: values.invoice_date_from
        ? values.invoice_date_from.format("YYYY-MM-DD")
        : undefined,
      invoice_date_to: values.invoice_date_to
        ? values.invoice_date_to.format("YYYY-MM-DD")
        : undefined,
    };

    if (
      !nextParams.invoice_no &&
      !nextParams.client_id &&
      !nextParams.invoice_date_from &&
      !nextParams.invoice_date_to
    ) {
      warning("Please provide at least one search filter.");
      return;
    }

    setSearchParams(nextParams);
  };

  const handleReset = () => {
    form.resetFields();
    setSearchParams({});
  };

  const handleCreateSuccess = () => {
    if (
      searchParams.invoice_no ||
      searchParams.client_id !== undefined ||
      searchParams.invoice_date_from ||
      searchParams.invoice_date_to
    ) {
      refetch();
    }
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    try {
      setDeletingId(invoiceId);
      await invoiceService.deleteInvoice(invoiceId);
      showSuccess("Invoice deleted successfully");

      if (
        searchParams.invoice_no ||
        searchParams.client_id !== undefined ||
        searchParams.invoice_date_from ||
        searchParams.invoice_date_to
      ) {
        refetch();
      }
    } catch (error: any) {
      showError(error?.response?.data?.message || "Failed to delete invoice");
    } finally {
      setDeletingId(null);
    }
  };

  const columns: TableColumnsType<InvoiceItem> = [
    {
      title: "Invoice No",
      dataIndex: "invoice_no",
      key: "invoice_no",
      width: 160,
    },
    {
      title: "Invoice Date",
      dataIndex: "invoice_date",
      key: "invoice_date",
      width: 140,
      render: (date: string) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Client Details",
      key: "client_details",
      width: 320,
      render: (_, record: InvoiceItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.client?.name || "-"}</div>
          <div>{record.client?.owner || "-"}</div>
          <div>
            {record.client?.address1 || ""}
            {record.client?.address2 ? `, ${record.client.address2}` : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Hourly Rate",
      dataIndex: "hourly_rate",
      key: "hourly_rate",
      width: 140,
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: "OT Hourly Rate",
      dataIndex: "ot_hourly_rate",
      key: "ot_hourly_rate",
      width: 140,
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Total Hours",
      dataIndex: "total_working_hours",
      key: "total_working_hours",
      width: 130,
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      width: 150,
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: "",
      key: "open_new_tab",
      width: 120,
      align: "center",
      render: (_, record: InvoiceItem) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<ExportOutlined />}
            title="Open details"
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/invoices/${record.id}`);
            }}
          />
          <Popconfirm
            title="Delete invoice"
            description="Are you sure you want to delete this invoice?"
            okText="Delete"
            cancelText="Cancel"
            onConfirm={(event) => {
              event?.stopPropagation();
              return handleDeleteInvoice(record.id);
            }}
            onCancel={(event) => event?.stopPropagation()}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deletingId === record.id}
              title="Delete invoice"
              onClick={(event) => event.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Page
        title="Invoices"
        headerTitle="Invoice Search"
        headerAction={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
            >
              New Invoice
            </Button>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={isFetching}
              style={{ borderColor: "#1890ff", color: "#1890ff" }}
            >
              Clear Filters
            </Button>
          </Space>
        }
      >
        <Card style={{ marginBottom: 16 }}>
          <Form form={form} layout="vertical" onFinish={handleSearch}>
            <Space size="middle" wrap style={{ width: "100%" }}>
              <Form.Item
                name="invoice_no"
                label="Invoice No"
                style={{ minWidth: 220, marginBottom: 0 }}
              >
                <Input placeholder="e.g. INV" allowClear />
              </Form.Item>

              <Form.Item
                name="client_id"
                label="Client"
                style={{ minWidth: 260, marginBottom: 0 }}
              >
                <SearchableSelect
                  placeholder="Search client name"
                  fetchOptions={fetchClientOptions}
                  allowClear
                  minCharsToSearch={1}
                />
              </Form.Item>

              <Form.Item
                name="invoice_date_from"
                label="Invoice Date From"
                style={{ minWidth: 180, marginBottom: 0 }}
              >
                <DatePicker format="YYYY-MM-DD" allowClear />
              </Form.Item>

              <Form.Item
                name="invoice_date_to"
                label="Invoice Date To"
                style={{ minWidth: 180, marginBottom: 0 }}
              >
                <DatePicker format="YYYY-MM-DD" allowClear />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  loading={isFetching}
                >
                  Submit
                </Button>
              </Form.Item>
            </Space>
          </Form>
        </Card>

        <Spin spinning={isFetching} tip="Searching invoices...">
          <Table
            columns={columns}
            dataSource={invoices}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1120 }}
            onRow={(record: InvoiceItem) => ({
              onClick: () => navigate(`/invoices/${record.id}`),
              style: { cursor: "pointer" },
            })}
            locale={{
              emptyText:
                searchParams.invoice_no ||
                searchParams.client_id !== undefined ||
                searchParams.invoice_date_from ||
                searchParams.invoice_date_to
                  ? "No invoices found for the provided filters."
                  : "Search created invoices by invoice no, client, or invoice date range.",
            }}
          />
        </Spin>

        <InvoiceCreateModal
          visible={isCreateModalVisible}
          onClose={() => setIsCreateModalVisible(false)}
          onSuccess={handleCreateSuccess}
        />
      </Page>
    </Layout>
  );
};

export default Invoices;
