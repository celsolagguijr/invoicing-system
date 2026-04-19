import React from "react";
import { Card, Space, Empty, Spin, Button, Divider } from "antd";
import { SendOutlined } from "@ant-design/icons";
import Page from "@app/shared/components/Page";
import { Layout } from "@components/Layout";
import EmployeeSelector from "./EmployeeSelector";
import EmployeeTimelogSection from "./EmployeeTimelogSection";
import TimelogErrorModal from "./TimelogErrorModal";
import useTimelogs from "./useTimelogs";
import { useService } from "@contexts/ServiceContext";

const Timelogs: React.FC = () => {
  const {
    employeeTimelogs,
    isLoading,
    isSubmitting,
    searchEmployees,
    formState,
    handleAddNewRow,
    handleEmployeeSelect,
    handleRemoveEmployee,
    getEmployeeEntries,
    getEmployeeClientColumns,
    handleCustomSubmit,
    errorPrompt,
    closeErrorPrompt,
  } = useTimelogs();
  const { employee: employeeService } = useService();

  const getAllEmployees = async () => {
    try {
      const response = await employeeService.getEmployees();
      return response.data || [];
    } catch {
      return [];
    }
  };

  return (
    <Layout>
      <Page
        title="Timelogs"
        headerTitle="Timelogs"
        headerAction={
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={handleCustomSubmit}
            loading={isSubmitting}
            disabled={formState.length === 0}
          >
            Submit Timelogs
          </Button>
        }
      >
        <TimelogErrorModal
          open={errorPrompt.isOpen}
          summary={errorPrompt.summary}
          details={errorPrompt.details}
          onClose={closeErrorPrompt}
        />
        <Spin spinning={isLoading || isSubmitting}>
          <Card style={{ marginBottom: 24 }}>
            <EmployeeSelector
              onSelect={handleEmployeeSelect}
              searchEmployees={searchEmployees}
              getAllEmployees={getAllEmployees}
              placeholder="Search employees..."
            />
            <Divider />

            {employeeTimelogs.length > 0 ? (
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="large"
              >
                {employeeTimelogs.map((employee) => (
                  <EmployeeTimelogSection
                    key={employee.employee_id}
                    employee={employee}
                    entries={getEmployeeEntries(employee.employee_id)}
                    formState={formState}
                    onAddNewRow={handleAddNewRow}
                    onRemoveEmployee={handleRemoveEmployee}
                    getEmployeeClientColumns={(employeeId) =>
                      getEmployeeClientColumns(employeeId)
                    }
                  />
                ))}
              </Space>
            ) : (
              <Empty
                description="Add an employee to get started"
                style={{ marginTop: 64 }}
              />
            )}
          </Card>
        </Spin>
      </Page>
    </Layout>
  );
};

export default Timelogs;
