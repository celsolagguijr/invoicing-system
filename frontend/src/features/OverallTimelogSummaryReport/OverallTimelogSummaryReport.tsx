import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Space,
  Spin,
  Table,
} from "antd";
import type { TableColumnsType } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { Layout } from "@components/Layout";
import Page from "@app/shared/components/Page";
import { useService } from "@contexts/ServiceContext";
import { useMessage } from "@contexts/MessageContext";
import type { EmployeeTimelogReportItem } from "@app/services/TimelogService";

type FilterFormValues = {
  start_date?: Dayjs;
  end_date?: Dayjs;
};

type EmployeeSummaryGroup = {
  employeeId: number;
  employeeName: string;
  rows: EmployeeTimelogReportItem[];
  totalHours: number;
  totalOtHours: number;
};

const OverallTimelogSummaryReport: React.FC = () => {
  const [form] = Form.useForm<FilterFormValues>();
  const { timelog } = useService();
  const { error: showError } = useMessage();

  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<EmployeeTimelogReportItem[]>([]);

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
        title: "Client Address",
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
    ],
    []
  );

  const groupedRows = useMemo<EmployeeSummaryGroup[]>(() => {
    const groupMap = new Map<number, EmployeeSummaryGroup>();

    for (const row of rows) {
      const employeeId = Number(row.employee_id || 0);
      const employeeName = row.employee?.employee_name || "Unknown Employee";
      const existing = groupMap.get(employeeId);

      if (!existing) {
        groupMap.set(employeeId, {
          employeeId,
          employeeName,
          rows: [row],
          totalHours: Number(row.working_hours || 0),
          totalOtHours: Number(row.ot_working_hours || 0),
        });
        continue;
      }

      existing.rows.push(row);
      existing.totalHours += Number(row.working_hours || 0);
      existing.totalOtHours += Number(row.ot_working_hours || 0);
    }

    return Array.from(groupMap.values())
      .map((group) => ({
        ...group,
        rows: [...group.rows].sort(
          (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
        ),
      }))
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  }, [rows]);

  const handleSearch = async () => {
    const values = form.getFieldsValue();

    if (!values.start_date || !values.end_date) {
      showError("Please select Start Date and End Date");
      return;
    }

    if (values.start_date.isAfter(values.end_date, "day")) {
      showError("Start Date must be before or equal to End Date");
      return;
    }

    setIsLoading(true);

    try {
      const response = await timelog.getEmployeeTimelogReport({
        start_date: values.start_date.format("YYYY-MM-DD"),
        end_date: values.end_date.format("YYYY-MM-DD"),
      });
      setRows(response.data || []);
    } catch {
      showError("Failed to fetch timelog summary");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Page
        title="Overall Timelog Summary"
        headerTitle="Overall Timelog Summary"
      >
        <Card style={{ marginBottom: 16 }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              start_date: dayjs().startOf("month"),
              end_date: dayjs(),
            }}
          >
            <Space size="middle" wrap style={{ width: "100%" }}>
              <Form.Item
                label="Start Date"
                name="start_date"
                style={{ minWidth: 180, marginBottom: 0 }}
              >
                <DatePicker format="YYYY-MM-DD" allowClear={false} />
              </Form.Item>

              <Form.Item
                label="End Date"
                name="end_date"
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
          {groupedRows.length === 0 ? (
            <div>
              <Empty description="No timelogs found for the selected date range" />
            </div>
          ) : (
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {groupedRows.map((group) => (
                <section key={group.employeeId}>
                  <h3 style={{ margin: "0 0 12px 0" }}>{group.employeeName}</h3>
                  <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={group.rows}
                    pagination={{ pageSize: 10 }}
                    summary={() => (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3}>
                          <strong>Total Hours</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <div style={{ textAlign: "right" }}>
                            <strong>{group.totalHours.toFixed(2)}</strong>
                          </div>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          <div style={{ textAlign: "right" }}>
                            <strong>{group.totalOtHours.toFixed(2)}</strong>
                          </div>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3} />
                      </Table.Summary.Row>
                    )}
                  />
                </section>
              ))}
            </Space>
          )}
        </Spin>
      </Page>
    </Layout>
  );
};

export default OverallTimelogSummaryReport;
