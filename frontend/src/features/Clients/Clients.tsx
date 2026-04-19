import React, { useState } from "react";
import { Table, Button, Spin, Space } from "antd";
import { ReloadOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import Page from "@app/shared/components/Page";
import { Layout } from "@components/Layout";
import useClients from "./useClients";
import ClientFormModal from "./ClientFormModal";
import type { Client } from "@app/services/ClientService";

const Clients: React.FC = () => {
  const { clients, isLoading, refetch } = useClients();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();

  const handleCreateClick = () => {
    setSelectedClient(undefined);
    setIsModalVisible(true);
  };

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedClient(undefined);
  };

  const columns: TableColumnsType<Client> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Owner",
      dataIndex: "owner",
      key: "owner",
      width: 150,
    },
    {
      title: "Address 1",
      dataIndex: "address1",
      key: "address1",
      width: 200,
    },
    {
      title: "Address 2",
      dataIndex: "address2",
      key: "address2",
      width: 150,
    },
    {
      title: "Hourly Rate",
      dataIndex: "hourly_rate",
      key: "hourly_rate",
      width: 120,
      render: (rate: number) => {
        return new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(rate);
      },
    },
    {
      title: "OT Working Hours Rate",
      dataIndex: "ot_hourly_rate",
      key: "ot_hourly_rate",
      width: 180,
      render: (rate: number) => {
        return new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(rate);
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: Client["status"]) =>
        status === "active" ? "Active" : "Inactive",
    },

    {
      title: "Actions",
      key: "actions",
      width: 50,
      render: (_, record: Client) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleEditClick(record)}
          style={{ color: "#fff" }}
        />
      ),
    },
  ];

  return (
    <Layout>
      <Page
        title="Clients"
        headerTitle="Clients"
        headerAction={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateClick}
            >
              New Client
            </Button>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
              style={{ borderColor: "#1890ff", color: "#1890ff" }}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Spin spinning={isLoading} tip="Loading clients...">
          <Table
            columns={columns}
            dataSource={clients}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1400 }}
          />
        </Spin>

        <ClientFormModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          onSuccess={() => refetch()}
          client={selectedClient}
        />
      </Page>
    </Layout>
  );
};

export default Clients;
