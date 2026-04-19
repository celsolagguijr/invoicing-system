import React, { useCallback, useState } from "react";
import { Button, DatePicker, Form, Modal, Spin } from "antd";
import dayjs from "dayjs";
import SearchableSelect, {
  type SearchOption,
} from "@components/SearchableSelect";
import { useService } from "@contexts/ServiceContext";
import { useMessage } from "@contexts/MessageContext";

type InvoiceCreateModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type InvoiceCreateFormValues = {
  client_id: number;
  invoice_date: dayjs.Dayjs;
  due_date: dayjs.Dayjs;
  coverage_start: dayjs.Dayjs;
  coverage_end: dayjs.Dayjs;
};

const InvoiceCreateModal: React.FC<InvoiceCreateModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<InvoiceCreateFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { invoice, timelog } = useService();
  const { success: successMsg, error: errorMsg } = useMessage();

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

  const handleSubmit = async (values: InvoiceCreateFormValues) => {
    try {
      setIsSubmitting(true);

      await invoice.createInvoice({
        client_id: values.client_id,
        invoice_date: values.invoice_date.format("YYYY-MM-DD"),
        due_date: values.due_date.format("YYYY-MM-DD"),
        coverage_start: values.coverage_start.format("YYYY-MM-DD"),
        coverage_end: values.coverage_end.format("YYYY-MM-DD"),
      });

      successMsg("Invoice created successfully!");
      form.resetFields();
      onClose();
      onSuccess();
    } catch (error: any) {
      errorMsg(error.message || "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Create New Invoice"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Spin spinning={isSubmitting}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            invoice_date: dayjs(),
            due_date: dayjs(),
            coverage_start: dayjs().startOf("month"),
            coverage_end: dayjs().endOf("month"),
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Client"
            name="client_id"
            rules={[{ required: true, message: "Please select a client" }]}
          >
            <SearchableSelect
              placeholder="Search client name"
              fetchOptions={fetchClientOptions}
              allowClear
              minCharsToSearch={1}
            />
          </Form.Item>

          <Form.Item
            label="Invoice Date"
            name="invoice_date"
            rules={[{ required: true, message: "Please select invoice date" }]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Due Date"
            name="due_date"
            rules={[{ required: true, message: "Please select due date" }]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Coverage Start"
            name="coverage_start"
            rules={[
              { required: true, message: "Please select coverage start" },
            ]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Coverage End"
            name="coverage_end"
            dependencies={["coverage_start"]}
            rules={[
              { required: true, message: "Please select coverage end" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const coverageStart = getFieldValue("coverage_start") as
                    | dayjs.Dayjs
                    | undefined;
                  if (
                    !value ||
                    !coverageStart ||
                    !value.isBefore(coverageStart, "day")
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Coverage end must be on or after coverage start")
                  );
                },
              }),
            ]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Create
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default InvoiceCreateModal;
