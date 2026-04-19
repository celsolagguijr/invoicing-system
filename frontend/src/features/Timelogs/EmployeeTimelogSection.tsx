import React from "react";
import { Card, Button, Table, Space, Empty, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { PendingEntry } from "@features/Timelogs/types";

interface EmployeeSectionProps {
  employee: any;
  entries: PendingEntry[];
  formState: PendingEntry[];
  onAddNewRow: (employeeId: number) => void;
  onRemoveEmployee: (employeeId: number) => void;
  getEmployeeClientColumns: (employeeId: number) => TableColumnsType<any>;
}

const EmployeeTimelogSection: React.FC<EmployeeSectionProps> = ({
  employee,
  entries,
  formState,
  onAddNewRow,
  onRemoveEmployee,
  getEmployeeClientColumns,
}) => {
  // Map entries to include their index in formState
  const tableData = entries.map((entry) => ({
    ...entry,
    _index: formState.findIndex(
      (item) =>
        item.key === entry.key &&
        item.employee_id === entry.employee_id &&
        item.customer_id === entry.customer_id &&
        item.working_hours === entry.working_hours &&
        item.ot_working_hours === entry.ot_working_hours &&
        item.date === entry.date &&
        item.remarks === entry.remarks
    ),
  }));

  const totalHours = entries.reduce(
    (sum, entry) => sum + entry.working_hours,
    0
  );
  const totalOtHours = entries.reduce(
    (sum, entry) => sum + Number(entry.ot_working_hours || 0),
    0
  );

  return (
    <Card
      title={employee.employee_name}
      extra={
        <Popconfirm
          title="Remove Employee"
          description={`Are you sure you want to remove ${employee.employee_name}?`}
          onConfirm={() => onRemoveEmployee(employee.employee_id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="primary"
            danger
            size="large"
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      }
      headStyle={{ backgroundColor: "#f5f5f5" }}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        {tableData.length > 0 ? (
          <Table
            columns={getEmployeeClientColumns(employee.employee_id)}
            dataSource={tableData}
            pagination={false}
            size="small"
            rowKey={(record) => record.key}
          />
        ) : (
          <Empty description="No timelogs added yet" />
        )}
        <div
          style={{
            fontWeight: "bold",
            fontSize: "16px",
            padding: "12px 16px",
            backgroundColor: "#f5f5f5",
            border: "1px solid #d9d9d9",
            borderRadius: "6px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => onAddNewRow(employee.employee_id)}
          >
            Add Timelog
          </Button>
          <span>
            Total Hours: {totalHours.toFixed(1)} | Total OT Hours:{" "}
            {totalOtHours.toFixed(1)}
          </span>
        </div>
      </Space>
    </Card>
  );
};

export default EmployeeTimelogSection;
