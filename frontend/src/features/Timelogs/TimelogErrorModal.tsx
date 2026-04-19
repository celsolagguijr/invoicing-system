import React from "react";
import { Modal, Table } from "antd";
import type { TableColumnsType } from "antd";

interface ErrorDetail {
  path?: string | null;
  client?: string | null;
  employee?: string | null;
  row?: number | null;
  field?: string | null;
  message: string;
}

interface ErrorRow {
  key: string;
  client: string;
  employee: string;
  message: string;
}

interface TimelogErrorModalProps {
  open: boolean;
  summary: string;
  details: ErrorDetail[];
  onClose: () => void;
}

const errorColumns: TableColumnsType<ErrorRow> = [
  {
    title: "Client",
    dataIndex: "client",
    key: "client",
    width: 180,
  },
  {
    title: "Employee",
    dataIndex: "employee",
    key: "employee",
    width: 180,
  },
  {
    title: "Error",
    dataIndex: "message",
    key: "message",
  },
];

const TimelogErrorModal: React.FC<TimelogErrorModalProps> = ({
  open,
  summary,
  details,
  onClose,
}) => {
  const errorTableData: ErrorRow[] = details.map((detail, index) => ({
    key: `${detail.path ?? "general"}-${detail.employee ?? "employee"}-${detail.client ?? "client"}-${index}`,
    client: detail.client || "-",
    employee: detail.employee || detail.field || "-",
    message: detail.message,
  }));

  return (
    <Modal
      title="Unable to save timelogs"
      open={open}
      onOk={onClose}
      onCancel={onClose}
      okText="Review"
      cancelButtonProps={{ style: { display: "none" } }}
      centered
      width={820}
    >
      <p>{summary}</p>
      {errorTableData.length > 0 && (
        <Table
          size="small"
          columns={errorColumns}
          dataSource={errorTableData}
          pagination={false}
          style={{ marginTop: 12 }}
          scroll={{ y: 280 }}
        />
      )}
    </Modal>
  );
};

export default TimelogErrorModal;
