import React, { createContext, useContext, useMemo } from "react";
import {
  AuthService,
  UserService,
  EmployeeService,
  ClientService,
  TimelogService,
  InvoiceService,
} from "@app/services";

type ServiceProps = {
  children: React.ReactNode;
};

type ServiceClasses = {
  auth: AuthService;
  user: UserService;
  employee: EmployeeService;
  client: ClientService;
  timelog: TimelogService;
  invoice: InvoiceService;
};

const ServiceContext = createContext<ServiceClasses | undefined>(undefined);

const ServiceProvider: React.FC<ServiceProps> = ({ children }) => {
  const services = useMemo<ServiceClasses>(() => {
    const auth = new AuthService();
    const user = new UserService(auth);
    const employee = new EmployeeService(auth);
    const client = new ClientService(auth);
    const timelog = new TimelogService(auth);
    const invoice = new InvoiceService(auth);
    return { auth, user, employee, client, timelog, invoice };
  }, []);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

const useService = () => {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new Error("useService must be used within a ServiceProvider");
  }

  return context;
};

export { ServiceContext, ServiceProvider, useService };
