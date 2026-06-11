import { useState, useCallback } from "react";
import { Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { useService } from "@contexts/ServiceContext";
import { useMessage } from "@contexts/MessageContext";
import type { ApiAxiosError } from "@app/shared/types/axios";
import type { TableColumnsType } from "antd";
import type {
  Employee,
  Client,
  TimelogTransaction,
} from "@app/services/TimelogService";
import type { PendingEntry } from "./types";
import SearchableSelect from "@app/shared/components/SearchableSelect";
import { DatePicker, Input, InputNumber } from "antd";

interface TimelogEntry {
  key: string;
  client_id: number;
  client_name: string;
  working_hours: number;
  ot_working_hours: number;
}

interface EmployeeTimelog {
  employee_id: number;
  employee_name: string;
  entries: TimelogEntry[];
}

interface UseTimelogsReturn {
  employeeTimelogs: EmployeeTimelog[];
  selectedDate: string;
  isLoading: boolean;
  isSubmitting: boolean;
  formState: PendingEntry[];
  setFormState: (formState: PendingEntry[]) => void;
  searchEmployees: (query: string) => Promise<Employee[]>;
  searchClients: (query: string) => Promise<Client[]>;
  addEmployee: (employee: Employee) => void;
  removeEmployee: (employeeId: number) => void;
  addTimelogEntry: (
    employeeId: number,
    clientId: number,
    clientName: string,
    workingHours: number,
    otWorkingHours?: number
  ) => void;
  updateTimelogEntry: (
    employeeId: number,
    entryKey: string,
    workingHours: number
  ) => void;
  removeTimelogEntry: (employeeId: number, entryKey: string) => void;
  submitTimelogs: () => Promise<boolean>;
  setSelectedDate: (date: string) => void;
  setEmployeeTimelogs: (timelogs: EmployeeTimelog[]) => void;
  canAddEmployee: () => boolean;
  handleAddNewRow: (employeeId: number) => void;
  handleUpdateEntry: (index: number, field: string, value: any) => void;
  handleRemoveEntry: (index: number) => void;
  handleEmployeeSelect: (employee: Employee) => void;
  handleRemoveEmployee: (employeeId: number) => void;
  handleCustomSubmit: () => Promise<void>;
  getEmployeeEntries: (employeeId: number) => PendingEntry[];
  getEmployeeClientColumns: (employeeId: number) => TableColumnsType<any>;
  errorPrompt: FriendlyTimelogError & { isOpen: boolean };
  closeErrorPrompt: () => void;
}

interface BackendApiErrorResponse {
  message?: string;
  error?: unknown;
}

interface BackendErrorItem {
  path?: string | null;
  client?: string | null;
  employee?: string | null;
  row?: number | null;
  field?: string | null;
  message: string;
}

interface FriendlyTimelogError {
  summary: string;
  details: BackendErrorItem[];
}

const TIMELOG_FIELDS = [
  "employee_id",
  "customer_id",
  "working_hours",
  "ot_working_hours",
  "date",
  "remarks",
];

const toStringErrors = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
};

const isBackendErrorItem = (value: unknown): value is BackendErrorItem => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;
  return typeof item.message === "string";
};

const extractZodErrors = (node: unknown, pathLabel = ""): string[] => {
  if (!node || typeof node !== "object") {
    return [];
  }

  const issues: string[] = [];
  const obj = node as Record<string, unknown>;
  const ownErrors = toStringErrors(obj._errors);

  if (ownErrors.length > 0) {
    if (pathLabel) {
      issues.push(...ownErrors.map((err) => `${pathLabel}: ${err}`));
    } else {
      issues.push(...ownErrors);
    }
  }

  for (const [key, value] of Object.entries(obj)) {
    if (key === "_errors") {
      continue;
    }

    const nextLabel = pathLabel ? `${pathLabel}.${key}` : key;
    issues.push(...extractZodErrors(value, nextLabel));
  }

  return issues;
};

const formatBatchValidationErrors = (
  errorTree: Record<string, unknown> | null | undefined
): string[] => {
  if (!errorTree || typeof errorTree !== "object") {
    return [];
  }

  const transactionsNode = (errorTree as Record<string, unknown>).transactions;
  if (!transactionsNode || typeof transactionsNode !== "object") {
    return extractZodErrors(errorTree);
  }

  const formatted: string[] = [];
  const transactionsObj = transactionsNode as Record<string, unknown>;

  const transactionLevelErrors = toStringErrors(transactionsObj._errors);
  formatted.push(...transactionLevelErrors);

  for (const [indexKey, indexValue] of Object.entries(transactionsObj)) {
    if (indexKey === "_errors") {
      continue;
    }

    const indexNum = Number(indexKey);
    if (
      !Number.isInteger(indexNum) ||
      !indexValue ||
      typeof indexValue !== "object"
    ) {
      continue;
    }

    const rowNumber = indexNum + 1;
    const rowObj = indexValue as Record<string, unknown>;

    for (const field of TIMELOG_FIELDS) {
      const fieldNode = rowObj[field];
      if (!fieldNode || typeof fieldNode !== "object") {
        continue;
      }

      const fieldErrors = toStringErrors(
        (fieldNode as Record<string, unknown>)._errors
      );
      formatted.push(
        ...fieldErrors.map((msg) => `Row ${rowNumber} ${field}: ${msg}`)
      );
    }

    const rowLevelErrors = toStringErrors(rowObj._errors);
    formatted.push(...rowLevelErrors.map((msg) => `Row ${rowNumber}: ${msg}`));
  }

  return Array.from(new Set(formatted));
};

const parseBackendErrorItems = (error: unknown): BackendErrorItem[] => {
  if (Array.isArray(error)) {
    return error.filter(isBackendErrorItem).map((item) => ({
      path: item.path ?? null,
      client: item.client ?? null,
      employee: item.employee ?? null,
      row: typeof item.row === "number" ? item.row : null,
      field: item.field ?? null,
      message: item.message,
    }));
  }

  if (error && typeof error === "object") {
    const fallbackMessages = formatBatchValidationErrors(
      error as Record<string, unknown>
    );

    return fallbackMessages.map((message) => ({
      path: null,
      client: null,
      employee: null,
      row: null,
      field: null,
      message,
    }));
  }

  return [];
};

const getFriendlyTimelogError = (error: unknown): FriendlyTimelogError => {
  const axiosError = error as ApiAxiosError;
  const responseData = axiosError?.response?.data as
    | BackendApiErrorResponse
    | undefined;

  if (responseData?.message === "Validation Error") {
    const validationIssues = parseBackendErrorItems(responseData.error);
    if (validationIssues.length > 0) {
      return {
        summary: "Validation failed. Please review the details below.",
        details: validationIssues,
      };
    }
    return {
      summary:
        "Validation failed. Please review your timelog rows and try again.",
      details: [
        {
          path: null,
          client: null,
          employee: null,
          row: null,
          field: null,
          message:
            "Please review your timelog rows and make sure required fields are valid.",
        },
      ],
    };
  }

  const backendIssues = parseBackendErrorItems(responseData?.error);
  if (backendIssues.length > 0) {
    return {
      summary: responseData?.message || "Unable to process timelogs",
      details: backendIssues,
    };
  }

  if (responseData?.message) {
    return {
      summary: responseData.message,
      details: [
        {
          path: null,
          client: null,
          employee: null,
          row: null,
          field: null,
          message: responseData.message,
        },
      ],
    };
  }

  if (error instanceof Error && error.message) {
    return {
      summary: error.message,
      details: [
        {
          path: null,
          client: null,
          employee: null,
          row: null,
          field: null,
          message: error.message,
        },
      ],
    };
  }

  return {
    summary: "Failed to submit timelogs",
    details: [
      {
        path: null,
        client: null,
        employee: null,
        row: null,
        field: null,
        message: "An unexpected error occurred while submitting timelogs.",
      },
    ],
  };
};

const useTimelogs = (): UseTimelogsReturn => {
  const { timelog: timelogService } = useService();
  const { success: successMsg, error: errorMsg } = useMessage();

  const [employeeTimelogs, setEmployeeTimelogs] = useState<EmployeeTimelog[]>(
    []
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<PendingEntry[]>([]);
  const [errorPrompt, setErrorPrompt] = useState<
    FriendlyTimelogError & { isOpen: boolean }
  >({
    isOpen: false,
    summary: "",
    details: [],
  });

  const closeErrorPrompt = useCallback(() => {
    setErrorPrompt((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openErrorPrompt = useCallback((error: unknown) => {
    const friendlyError = getFriendlyTimelogError(error);
    setErrorPrompt({
      isOpen: true,
      summary: friendlyError.summary,
      details: friendlyError.details.slice(0, 8),
    });
  }, []);

  const searchEmployees = useCallback(
    async (query: string) => {
      setIsLoading(true);
      try {
        const response = await timelogService.searchEmployees(query);
        return response.data || [];
      } catch (error) {
        console.error("Error searching employees:", error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [timelogService]
  );

  const searchClients = useCallback(
    async (query: string) => {
      setIsLoading(true);
      try {
        const response = await timelogService.searchClients(query);
        return response.data || [];
      } catch (error) {
        console.error("Error searching clients:", error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [timelogService]
  );

  const canAddEmployee = useCallback(() => {
    // Validate that we can add another employee
    return true;
  }, []);

  const addEmployee = useCallback(
    (employee: Employee) => {
      // Check if employee already exists
      setEmployeeTimelogs((prev) => {
        const employeeExists = prev.some((e) => e.employee_id === employee.id);
        if (employeeExists) {
          errorMsg("Employee already selected");
          return prev;
        }

        return [
          ...prev,
          {
            employee_id: employee.id,
            employee_name: employee.employee_name,
            entries: [],
          },
        ];
      });
    },
    [errorMsg]
  );

  const removeEmployee = useCallback((employeeId: number) => {
    setEmployeeTimelogs((prev) =>
      prev.filter((e) => e.employee_id !== employeeId)
    );
  }, []);

  const addTimelogEntry = useCallback(
    (
      employeeId: number,
      clientId: number,
      clientName: string,
      workingHours: number,
      otWorkingHours: number = 0
    ) => {
      setEmployeeTimelogs((prev) => {
        return prev.map((employee) => {
          if (employee.employee_id === employeeId) {
            // Check if client already exists for this employee
            const clientExists = employee.entries.some(
              (e) => e.client_id === clientId
            );
            if (clientExists) {
              errorMsg("Client already added for this employee");
              return employee;
            }

            return {
              ...employee,
              entries: [
                ...employee.entries,
                {
                  key: uuidv4(),
                  client_id: clientId,
                  client_name: clientName,
                  working_hours: workingHours,
                  ot_working_hours: otWorkingHours,
                },
              ],
            };
          }
          return employee;
        });
      });
    },
    [errorMsg]
  );

  const updateTimelogEntry = useCallback(
    (employeeId: number, entryKey: string, workingHours: number) => {
      setEmployeeTimelogs((prev) =>
        prev.map((employee) => {
          if (employee.employee_id === employeeId) {
            return {
              ...employee,
              entries: employee.entries.map((entry) =>
                entry.key === entryKey
                  ? { ...entry, working_hours: workingHours }
                  : entry
              ),
            };
          }
          return employee;
        })
      );
    },
    []
  );

  const removeTimelogEntry = useCallback(
    (employeeId: number, entryKey: string) => {
      setEmployeeTimelogs((prev) =>
        prev.map((employee) => {
          if (employee.employee_id === employeeId) {
            return {
              ...employee,
              entries: employee.entries.filter((e) => e.key !== entryKey),
            };
          }
          return employee;
        })
      );
    },
    []
  );

  const submitTimelogs = useCallback(async () => {
    if (employeeTimelogs.length === 0) {
      errorMsg("No timelogs to submit");
      return false;
    }

    // Check if all employees have at least one entry
    const allHaveEntries = employeeTimelogs.every((e) => e.entries.length > 0);
    if (!allHaveEntries) {
      errorMsg("All employees must have at least one timelog entry");
      return false;
    }

    const transactions: TimelogTransaction[] = [];
    for (const employee of employeeTimelogs) {
      for (const entry of employee.entries) {
        transactions.push({
          employee_id: employee.employee_id,
          customer_id: entry.client_id,
          working_hours: entry.working_hours,
          ot_working_hours: Number(entry.ot_working_hours || 0),
          date: selectedDate,
        });
      }
    }

    try {
      setIsSubmitting(true);
      await timelogService.createTimelogs({ transactions });
      successMsg("Timelogs submitted successfully!");
      setEmployeeTimelogs([]);
      return true;
    } catch (error: unknown) {
      openErrorPrompt(error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    employeeTimelogs,
    selectedDate,
    timelogService,
    successMsg,
    errorMsg,
    openErrorPrompt,
  ]);

  const handleAddNewRow = useCallback((employeeId: number) => {
    const newEntry: PendingEntry = {
      key: uuidv4(),
      employee_id: employeeId,
      customer_id: 0,
      customer_name: "",
      working_hours: 0,
      ot_working_hours: 0,
      date: new Date().toISOString().split("T")[0],
      remarks: "",
    };
    setFormState((prev) => [...prev, newEntry]);
  }, []);

  const handleUpdateEntry = useCallback(
    (index: number, field: string, value: any) => {
      setFormState((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  const handleRemoveEntry = useCallback((index: number) => {
    setFormState((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const getEmployeeClientColumns = useCallback(
    (_employeeId: number): TableColumnsType<any> => [
      {
        title: "Client",
        dataIndex: "customer_name",
        key: "customer_name",
        width: 200,
        render: (_: string, record: any) => {
          const index = record._index;
          return (
            <SearchableSelect
              placeholder="Search clients..."
              value={formState[index]?.customer_id || undefined}
              onChange={async (value) => {
                handleUpdateEntry(index, "customer_id", value);
                try {
                  const clients = await searchClients("");
                  const selectedClient = clients.find((c) => c.id === value);
                  const name = selectedClient?.name || "Unknown";
                  handleUpdateEntry(index, "customer_name", name);
                } catch {
                  handleUpdateEntry(index, "customer_name", "Unknown");
                }
              }}
              fetchOptions={async (query: string) => {
                try {
                  const clients = await searchClients(query || "");
                  return clients.map((client: Client) => ({
                    id: client.id,
                    label: `${client.name}`,
                  }));
                } catch {
                  return [];
                }
              }}
              style={{ width: "100%" }}
            />
          );
        },
      },
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        width: 120,
        render: (value: string, record: any) => {
          const index = record._index;
          return (
            <DatePicker
              value={dayjs(formState[index]?.date || value)}
              onChange={(date) => {
                if (date) {
                  handleUpdateEntry(index, "date", date.format("YYYY-MM-DD"));
                }
              }}
              style={{ width: "100%" }}
            />
          );
        },
      },
      {
        title: "Working Hours",
        dataIndex: "working_hours",
        key: "working_hours",
        width: 120,
        render: (hours: number, record: any) => {
          const index = record._index;
          return (
            <InputNumber
              placeholder="Hours"
              value={formState[index]?.working_hours || hours}
              onChange={(value) =>
                handleUpdateEntry(index, "working_hours", value)
              }
              step={0.5}
              min={0}
              precision={1}
              style={{ width: "100%" }}
            />
          );
        },
      },
      {
        title: "OT Working Hours",
        dataIndex: "ot_working_hours",
        key: "ot_working_hours",
        width: 140,
        render: (hours: number, record: any) => {
          const index = record._index;
          return (
            <InputNumber
              placeholder="OT Hours"
              value={formState[index]?.ot_working_hours ?? hours}
              onChange={(value) =>
                handleUpdateEntry(index, "ot_working_hours", value)
              }
              step={0.5}
              min={0}
              precision={1}
              style={{ width: "100%" }}
            />
          );
        },
      },
      {
        title: "Remarks",
        dataIndex: "remarks",
        key: "remarks",
        width: 240,
        render: (remarks: string, record: any) => {
          const index = record._index;
          return (
            <Input
              placeholder="Optional remarks"
              value={formState[index]?.remarks ?? remarks ?? ""}
              onChange={(event) =>
                handleUpdateEntry(index, "remarks", event.target.value)
              }
              maxLength={500}
            />
          );
        },
      },
      {
        title: "Action",
        key: "action",
        width: 80,
        render: (_, record: any) => {
          const index = record._index;
          return (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveEntry(index)}
            />
          );
        },
      },
    ],
    [formState, handleUpdateEntry, handleRemoveEntry, searchClients]
  );

  const handleEmployeeSelect = useCallback(
    (employee: Employee) => {
      addEmployee(employee);
    },
    [addEmployee]
  );

  const handleRemoveEmployee = useCallback(
    (employeeId: number) => {
      removeEmployee(employeeId);
      // Also remove entries for this employee from form state
      setFormState((prev) => prev.filter((e) => e.employee_id !== employeeId));
    },
    [removeEmployee]
  );

  const handleCustomSubmit = useCallback(async () => {
    if (formState.length === 0) {
      errorMsg("No timelogs to submit");
      return;
    }

    const transactions: TimelogTransaction[] = formState.map((entry) => ({
      employee_id: Number(entry.employee_id),
      customer_id: Number(entry.customer_id),
      working_hours: Number(entry.working_hours),
      ot_working_hours: Number(entry.ot_working_hours ?? 0),
      date: entry.date,
      remarks: entry.remarks?.trim() ? entry.remarks.trim() : null,
    }));

    const hasInvalidRows = transactions.some(
      (entry) =>
        !Number.isInteger(entry.employee_id) ||
        entry.employee_id <= 0 ||
        !Number.isInteger(entry.customer_id) ||
        entry.customer_id <= 0 ||
        !Number.isFinite(entry.working_hours) ||
        entry.working_hours < 0 ||
        !Number.isFinite(entry.ot_working_hours) ||
        entry.ot_working_hours < 0 ||
        !entry.date
    );

    if (hasInvalidRows) {
      errorMsg(
        "Please select an client, set a valid date, and enter non-negative working hours for all rows.."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await timelogService.createTimelogs({ transactions });
      successMsg("Timelogs submitted successfully!");
      setEmployeeTimelogs([]);
      setFormState([]);
    } catch (error: unknown) {
      openErrorPrompt(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, timelogService, successMsg, errorMsg, openErrorPrompt]);

  const getEmployeeEntries = useCallback(
    (employeeId: number) => {
      return formState.filter((entry) => entry.employee_id === employeeId);
    },
    [formState]
  );

  return {
    employeeTimelogs,
    selectedDate,
    isLoading,
    isSubmitting,
    formState,
    setFormState,
    searchEmployees,
    searchClients,
    addEmployee,
    removeEmployee,
    addTimelogEntry,
    updateTimelogEntry,
    removeTimelogEntry,
    submitTimelogs,
    setSelectedDate,
    setEmployeeTimelogs,
    canAddEmployee,
    handleAddNewRow,
    handleUpdateEntry,
    handleRemoveEntry,
    handleEmployeeSelect,
    handleRemoveEmployee,
    handleCustomSubmit,
    getEmployeeEntries,
    getEmployeeClientColumns,
    errorPrompt,
    closeErrorPrompt,
  };
};

export default useTimelogs;
