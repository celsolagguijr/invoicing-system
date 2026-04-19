import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Input,
  Form,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Layout } from "@components/Layout";
import Page from "@app/shared/components/Page";
import { useService } from "@contexts/ServiceContext";
import { useMessage } from "@contexts/MessageContext";
import type {
  Employee,
  EmployeeTimelogReportItem,
} from "@app/services/TimelogService";
import dayjs, { Dayjs } from "dayjs";

type FilterFormValues = {
  employee_id?: number;
  date_from?: Dayjs;
  date_to?: Dayjs;
};

const EmployeeTimelogsReport: React.FC = () => {
  const [form] = Form.useForm<FilterFormValues>();
  const { timelog, employee } = useService();
  const { error: showError, success: showSuccess } = useMessage();

  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<EmployeeTimelogReportItem[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<Employee[]>([]);
  const [editingRow, setEditingRow] =
    useState<EmployeeTimelogReportItem | null>(null);
  const [editingHours, setEditingHours] = useState<number>(0);
  const [editingOtHours, setEditingOtHours] = useState<number>(0);
  const [editingRemarks, setEditingRemarks] = useState<string>("");
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalHours = useMemo(
    () => rows.reduce((sum, item) => sum + Number(item.working_hours || 0), 0),
    [rows]
  );

  const totalOtHours = useMemo(
    () =>
      rows.reduce((sum, item) => sum + Number(item.ot_working_hours || 0), 0),
    [rows]
  );

  const columns: TableColumnsType<EmployeeTimelogReportItem> = useMemo(
    () => [
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        render: (value: string) =>
          value ? dayjs(value).format("YYYY-MM-DD") : "-",
      },
      {
        title: "Client Name",
        key: "client_name",
        render: (_, record) => record.customer?.name || "-",
      },
      {
        title: "Address",
        key: "client_address",
        render: (_, record) => {
          const address1 = record.customer?.address1 || "";
          const address2 = record.customer?.address2 || "";
          const fullAddress = [address1, address2].filter(Boolean).join(", ");
          return fullAddress || "-";
        },
      },
      {
        title: "Working Hours",
        dataIndex: "working_hours",
        key: "working_hours",
        align: "right",
        render: (value: number) => (
          <div style={{ textAlign: "right" }}>
            {Number(value || 0).toFixed(2)}
          </div>
        ),
      },
      {
        title: "OT Working Hours",
        dataIndex: "ot_working_hours",
        key: "ot_working_hours",
        align: "right",
        render: (value: number) => (
          <div style={{ textAlign: "right" }}>
            {Number(value || 0).toFixed(2)}
          </div>
        ),
      },
      {
        title: "Remarks",
        dataIndex: "remarks",
        key: "remarks",
        render: (value: string | null | undefined) => value || "-",
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space>
            <Button
              title="Edit working hours"
              icon={<EditOutlined />}
              type="primary"
              onClick={() => {
                setEditingRow(record);
                setEditingHours(Number(record.working_hours || 0));
                setEditingOtHours(Number(record.ot_working_hours || 0));
                setEditingRemarks(record.remarks || "");
              }}
            />
            <Popconfirm
              title="Delete transaction"
              description="Are you sure you want to delete this transaction?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleDeleteTransaction(record.id)}
            >
              <Button
                title="Delete transaction"
                danger
                icon={<DeleteOutlined />}
                loading={deletingId === record.id}
              />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deletingId]
  );

  const loadEmployees = async () => {
    try {
      const response = await employee.getEmployees();
      setEmployeeOptions(response.data || []);
    } catch {
      showError("Failed to load employees");
      setEmployeeOptions([]);
    }
  };

  const handleSearch = async () => {
    const values = form.getFieldsValue();

    if (!values.date_from || !values.date_to) {
      showError("Please select Date From and Date To");
      return;
    }

    if (values.date_from.isAfter(values.date_to, "day")) {
      showError("Date From must be before or equal to Date To");
      return;
    }

    setIsLoading(true);

    try {
      const response = await timelog.getEmployeeTimelogReport({
        start_date: values.date_from.format("YYYY-MM-DD"),
        end_date: values.date_to.format("YYYY-MM-DD"),
        employee_id: values.employee_id,
      });
      setRows(response.data || []);
    } catch {
      showError("Failed to fetch employee timelogs report");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateHours = async () => {
    if (!editingRow) return;

    if (!Number.isFinite(editingHours) || editingHours <= 0) {
      showError("Working hours must be a positive number");
      return;
    }

    if (!Number.isFinite(editingOtHours) || editingOtHours < 0) {
      showError("OT working hours must be a non-negative number");
      return;
    }

    setIsSavingHours(true);
    try {
      await timelog.updateWorkingHours(editingRow.id, {
        working_hours: Number(editingHours),
        ot_working_hours: Number(editingOtHours),
        remarks: editingRemarks.trim() ? editingRemarks.trim() : null,
      });
      showSuccess("Working hours updated successfully");
      setEditingRow(null);
      await handleSearch();
    } catch {
      showError("Failed to update working hours");
    } finally {
      setIsSavingHours(false);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    setDeletingId(id);
    try {
      await timelog.deleteTransaction(id);
      showSuccess("Transaction deleted successfully");
      await handleSearch();
    } catch {
      showError("Failed to delete transaction");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <Page title="Employee Timelogs Report" headerTitle="Employee Timelogs">
        <Card style={{ marginBottom: 16 }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              date_from: dayjs().startOf("month"),
              date_to: dayjs(),
            }}
          >
            <Space size="middle" wrap style={{ width: "100%" }}>
              <Form.Item
                label="Employee"
                name="employee_id"
                style={{ minWidth: 260, marginBottom: 0 }}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Select employee"
                  options={employeeOptions.map((item) => ({
                    value: item.id,
                    label: item.employee_name,
                  }))}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onFocus={loadEmployees}
                />
              </Form.Item>

              <Form.Item
                label="Date From"
                name="date_from"
                style={{ minWidth: 180, marginBottom: 0 }}
              >
                <DatePicker format="YYYY-MM-DD" allowClear={false} />
              </Form.Item>

              <Form.Item
                label="Date To"
                name="date_to"
                style={{ minWidth: 180, marginBottom: 0 }}
              >
                <DatePicker format="YYYY-MM-DD" allowClear={false} />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  loading={isLoading}
                >
                  Submit
                </Button>
              </Form.Item>
            </Space>
          </Form>
        </Card>

        <Spin spinning={isLoading}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={rows}
            pagination={{ pageSize: 10 }}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <strong>Total Hours</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <div style={{ textAlign: "right" }}>
                    <strong>{totalHours.toFixed(2)}</strong>
                  </div>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <div style={{ textAlign: "right" }}>
                    <strong>{totalOtHours.toFixed(2)}</strong>
                  </div>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} />
                <Table.Summary.Cell index={4} />
              </Table.Summary.Row>
            )}
          />
        </Spin>

        <Modal
          title="Update Working Hours"
          open={!!editingRow}
          onOk={handleUpdateHours}
          okText="Update"
          onCancel={() => setEditingRow(null)}
          confirmLoading={isSavingHours}
        >
          <Form layout="vertical">
            <Form.Item label="Working Hours" required>
              <InputNumber
                min={0.01}
                step={0.25}
                precision={2}
                style={{ width: "100%" }}
                value={editingHours}
                onChange={(value) => setEditingHours(Number(value || 0))}
              />
            </Form.Item>

            <Form.Item label="OT Working Hours" required>
              <InputNumber
                min={0}
                step={0.25}
                precision={2}
                style={{ width: "100%" }}
                value={editingOtHours}
                onChange={(value) => setEditingOtHours(Number(value || 0))}
              />
            </Form.Item>

            <Form.Item label="Remarks">
              <Input.TextArea
                rows={4}
                maxLength={500}
                placeholder="Optional remarks"
                value={editingRemarks}
                onChange={(event) => setEditingRemarks(event.target.value)}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Page>
    </Layout>
  );
};

export default EmployeeTimelogsReport;
