import { Button, Input, InputNumber, Popconfirm } from "antd";
import type { InvoiceDetailItem } from "@app/services/InvoiceService";
import type { InvoiceAdjustmentTableDetails } from "@app/shared/types/services/invoice";
import type { TableColumnsType } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const timelogSummaryTable: TableColumnsType<InvoiceDetailItem> = [
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
    title: "Working Hours",
    dataIndex: "billed_hours",
    key: "billed_hours",
    width: 130,
    align: "right",
    render: (value: number) => formatMoney(value),
  },
  {
    title: "OT",
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

const adjustmentTable = (
  onRowChange: <K extends keyof InvoiceAdjustmentTableDetails>(
    key: string,
    field: K,
    value: InvoiceAdjustmentTableDetails[K]
  ) => void,
  onDelete: (key: string) => void
): TableColumnsType<InvoiceAdjustmentTableDetails> => [
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    render: (_, record) => (
      <Input
        value={record.description}
        placeholder="Write something..."
        onChange={(event) =>
          onRowChange(record.rowKey, "description", event.target.value)
        }
      />
    ),
  },
  {
    title: "Qty",
    dataIndex: "quantity",
    key: "quantity",
    width: 120,
    render: (_, record) => (
      <InputNumber
        min={0}
        value={record.quantity}
        style={{ width: "100%" }}
        onChange={(value) => onRowChange(record.rowKey, "quantity", value ?? 0)}
      />
    ),
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
    width: 150,
    render: (_, record) => (
      <InputNumber
        min={0}
        step={0.01}
        value={record.price}
        style={{ width: "100%" }}
        onChange={(value) => onRowChange(record.rowKey, "price", value ?? 0)}
      />
    ),
  },
  {
    title: "Amount",
    key: "amount",
    width: 160,
    align: "right",
    render: (_, record) => formatMoney(record.quantity * record.price),
  },
  {
    title: "Action",
    key: "actions",
    width: 100,
    align: "center",
    render: (_, record) => (
      <Popconfirm
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        okText="Delete"
        cancelText="Cancel"
        onConfirm={(event) => {
          event?.stopPropagation();
          return onDelete(record.rowKey);
        }}
        onCancel={(event) => event?.stopPropagation()}
      >
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          title="Delete invoice"
          onClick={(event) => event.stopPropagation()}
        />
      </Popconfirm>
    ),
  },
];

export { timelogSummaryTable, adjustmentTable };
