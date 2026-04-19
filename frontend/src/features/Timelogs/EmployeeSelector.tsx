import React, { useState, useRef } from "react";
import { Button, Popconfirm, message } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import SearchableSelect from "@app/shared/components/SearchableSelect";
import type { Employee } from "@app/services/TimelogService";

interface EmployeeSelectorProps {
  onSelect: (employee: Employee) => void;
  searchEmployees: (query: string) => Promise<Employee[]>;
  getAllEmployees: () => Promise<Employee[]>;
  placeholder?: string;
  maxWidth?: number;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  onSelect,
  searchEmployees,
  getAllEmployees,
  placeholder = "Search employees by name...",
  maxWidth = 400,
}) => {
  const [selectedValue, setSelectedValue] = useState<number | undefined>();
  const employeesCache = useRef<Map<number, Employee>>(new Map());

  const handleEmployeeSelectChange = (employeeId: number) => {
    setSelectedValue(employeeId);
  };

  const handleAddEmployee = () => {
    if (selectedValue !== undefined) {
      const employee = employeesCache.current.get(selectedValue);
      if (employee) {
        onSelect(employee);
        // Clear the select value after adding
        setSelectedValue(undefined);
      }
    }
  };

  const handleAddAllEmployees = async () => {
    try {
      const allEmployees = await getAllEmployees();
      if (allEmployees.length === 0) {
        message.info("No employees found");
        return;
      }

      // Call onSelect for each employee
      allEmployees.forEach((employee) => {
        onSelect(employee);
      });
      message.success(`Added ${allEmployees.length} employee(s)`);
    } catch (error) {
      message.error("Failed to load employees");
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
        <div style={{ flex: 1, maxWidth }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            Search Employee
          </label>
          <SearchableSelect
            value={selectedValue}
            placeholder={placeholder}
            onChange={handleEmployeeSelectChange}
            fetchOptions={async (query: string) => {
              try {
                const employees = await searchEmployees(query || "");
                // Cache employees for later use
                employees.forEach((emp) => {
                  employeesCache.current.set(emp.id, emp);
                });
                return employees.map((emp: Employee) => ({
                  id: emp.id,
                  label: `${emp.employee_name} (${emp.employee_no})`,
                }));
              } catch {
                return [];
              }
            }}
            style={{ width: "100%" }}
          />
        </div>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleAddEmployee}
          disabled={selectedValue === undefined}
        >
          Add Employee
        </Button>
        <Popconfirm
          title="Add All Employees"
          description="Are you sure you want to add all employees?"
          onConfirm={handleAddAllEmployees}
          okText="Yes"
          cancelText="No"
        >
          <Button type="default" icon={<UserAddOutlined />}>
            Add All Employees
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};

export default EmployeeSelector;
