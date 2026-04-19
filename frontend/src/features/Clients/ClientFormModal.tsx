import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Button, Spin, Select } from "antd";
import { useService } from "@contexts/ServiceContext";
import { useMessage } from "@contexts/MessageContext";
import type {
  CreateClientRequest,
  UpdateClientRequest,
  Client,
} from "@app/services/ClientService";

interface ClientFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: Client;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
  client,
}) => {
  const [form] = Form.useForm();
  const { client: clientService } = useService();
  const { success: successMsg, error: errorMsg } = useMessage();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isSubmittingRef = React.useRef(false);

  const isEditMode = !!client;

  useEffect(() => {
    if (visible && client) {
      form.setFieldsValue({
        name: client.name,
        owner: client.owner,
        address1: client.address1,
        address2: client.address2,
        hourly_rate: client.hourly_rate,
        ot_hourly_rate: client.ot_hourly_rate,
        status: client.status,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, client, form]);

  const handleSubmit = async (values: any) => {
    if (isSubmittingRef.current) {
      return;
    }

    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);

      if (isEditMode && client) {
        const payload: UpdateClientRequest = {
          name: values.name,
          owner: values.owner,
          address1: values.address1,
          address2: values.address2,
          hourly_rate: values.hourly_rate,
          ot_hourly_rate: values.ot_hourly_rate,
          status: values.status,
        };
        await clientService.updateClient(client.id, payload);
        successMsg("Client updated successfully!");
      } else {
        const payload: CreateClientRequest = {
          name: values.name,
          owner: values.owner,
          address1: values.address1,
          address2: values.address2,
          hourly_rate: values.hourly_rate,
          ot_hourly_rate: values.ot_hourly_rate,
          status: values.status,
        };
        await clientService.createClient(payload);
        successMsg("Client created successfully!");
      }

      form.resetFields();
      onClose();
      onSuccess();
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      errorMsg(
        backendMessage ||
          error?.message ||
          `Failed to ${isEditMode ? "update" : "create"} client`
      );
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEditMode ? "Edit Client" : "Create New Client"}
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
          initialValues={{ status: "active" }}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="Client Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter client name",
              },
              {
                min: 2,
                message: "Name must be at least 2 characters long",
              },
            ]}
          >
            <Input placeholder="e.g., Acme Corporation" />
          </Form.Item>

          <Form.Item
            label="Owner"
            name="owner"
            rules={[
              {
                required: true,
                message: "Please enter owner name",
              },
              {
                min: 2,
                message: "Owner name must be at least 2 characters long",
              },
            ]}
          >
            <Input placeholder="e.g., John Smith" />
          </Form.Item>

          <Form.Item
            label="Address Line 1"
            name="address1"
            rules={[
              {
                required: true,
                message: "Please enter address",
              },
            ]}
          >
            <Input placeholder="e.g., 123 Business Street" />
          </Form.Item>

          <Form.Item
            label="Address Line 2"
            name="address2"
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Input placeholder="e.g., Suite 100" />
          </Form.Item>

          <Form.Item
            label="Hourly Rate"
            name="hourly_rate"
            rules={[
              {
                required: true,
                message: "Please enter hourly rate",
              },
              {
                validator: (_, value) => {
                  if (value < 0) {
                    return Promise.reject(
                      new Error("Hourly rate must be a non-negative number")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              placeholder="e.g., 150"
              style={{ width: "100%" }}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            label="OT Working Hours Rate"
            name="ot_hourly_rate"
            rules={[
              {
                required: true,
                message: "Please enter OT working hours rate",
              },
              {
                validator: (_, value) => {
                  if (value < 0) {
                    return Promise.reject(
                      new Error(
                        "OT working hours rate must be a non-negative number"
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              placeholder="e.g., 225"
              style={{ width: "100%" }}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {isEditMode ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default ClientFormModal;
