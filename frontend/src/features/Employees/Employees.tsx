import React, { useState } from "react";
import { Table, Button, Spin, Space } from "antd";
import { ReloadOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import Page from "@app/shared/components/Page";
import { Layout } from "@components/Layout";
import useEmployees from "./useEmployees";
import EmployeeFormModal from "./EmployeeFormModal";
import type { Employee } from "@app/services/EmployeeService";

const Employees: React.FC = () => {
  const { employees, isLoading, refetch } = useEmployees();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<
    Employee | undefined
  >();

  const handleCreateClick = () => {
    setSelectedEmployee(undefined);
    setIsModalVisible(true);
  };

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedEmployee(undefined);
  };

  const columns: TableColumnsType<Employee> = [
    {
      title: "Emp. No",
      dataIndex: "employee_no",
      key: "employee_no",
      width: 120,
    },
    {
      title: "Name",
      dataIndex: "employee_name",
      key: "employee_name",
      width: 200,
    },
    {
      title: "Date of Birth",
      dataIndex: "date_of_birth",
      key: "date_of_birth",
      width: 150,
      render: (date: string) => {
        return date ? new Date(date).toLocaleDateString() : "-";
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: Employee["status"]) =>
        status === "active" ? "Active" : "Inactive",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (date: string) => {
        return date ? new Date(date).toLocaleString() : "-";
      },
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 180,
      render: (date: string) => {
        return date ? new Date(date).toLocaleString() : "-";
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 50,
      render: (_, record: Employee) => (
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
        title="Employees"
        headerTitle="Employees"
        headerAction={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateClick}
            >
              New Employee
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
        <Spin spinning={isLoading} tip="Loading employees...">
          <Table
            columns={columns}
            dataSource={employees}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
          />
        </Spin>

        <EmployeeFormModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          onSuccess={() => refetch()}
          loading={isLoading}
          employee={selectedEmployee}
        />
      </Page>
    </Layout>
  );
};

export default Employees;
