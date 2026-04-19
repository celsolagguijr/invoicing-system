import React, { JSX, lazy } from "react";
import { Routes, Route, RouteProps } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";

const UserProfile = lazy(
  () => import("@app/features/UserProfile")
) as React.LazyExoticComponent<() => JSX.Element>;
const Login = lazy(
  () => import("@features/Login")
) as React.LazyExoticComponent<() => JSX.Element>;
const Register = lazy(
  () => import("@features/Register")
) as React.LazyExoticComponent<() => JSX.Element>;
const Dashboard = lazy(
  () => import("@features/Dashboard")
) as React.LazyExoticComponent<() => JSX.Element>;
const Employees = lazy(
  () => import("@features/Employees")
) as React.LazyExoticComponent<() => JSX.Element>;
const Clients = lazy(
  () => import("@features/Clients")
) as React.LazyExoticComponent<() => JSX.Element>;
const Timelogs = lazy(
  () => import("@features/Timelogs")
) as React.LazyExoticComponent<() => JSX.Element>;
const Invoices = lazy(
  () => import("@features/Invoices")
) as React.LazyExoticComponent<() => JSX.Element>;
const InvoiceDetails = lazy(
  () => import("@features/Invoices/InvoiceDetails")
) as React.LazyExoticComponent<() => JSX.Element>;
const EmployeeTimelogsReport = lazy(
  () => import("@features/EmployeeTimelogsReport")
) as React.LazyExoticComponent<() => JSX.Element>;
const OverallTimelogSummaryReport = lazy(
  () => import("@features/OverallTimelogSummaryReport")
) as React.LazyExoticComponent<() => JSX.Element>;
const NotFound = lazy(
  () => import("@features/NotFound")
) as React.LazyExoticComponent<() => JSX.Element>;

export type RouteType = Omit<RouteProps, "children"> & {
  children?: RouteType[];
  isProtected?: boolean;
};

const appRoutes: RouteType[] = [
  {
    path: "/",
    isProtected: true,
    element: <Dashboard />,
  },
  {
    path: "dashboard",
    isProtected: true,
    element: <Dashboard />,
  },
  {
    path: "login",
    element: <Login />,
    isProtected: false,
  },
  {
    path: "register",
    element: <Register />,
    isProtected: false,
  },
  {
    path: "user-profile",
    isProtected: true,
    element: <UserProfile />,
  },
  {
    path: "employees",
    isProtected: true,
    element: <Employees />,
  },
  {
    path: "clients",
    isProtected: true,
    element: <Clients />,
  },
  {
    path: "timelogs",
    isProtected: true,
    element: <Timelogs />,
  },
  {
    path: "invoices",
    isProtected: true,
    element: <Invoices />,
  },
  {
    path: "invoices/:id",
    isProtected: true,
    element: <InvoiceDetails />,
  },
  {
    path: "reports/employee-timelogs",
    isProtected: true,
    element: <EmployeeTimelogsReport />,
  },
  {
    path: "reports/overall-timelog-summary",
    isProtected: true,
    element: <OverallTimelogSummaryReport />,
  },
  {
    path: "*",
    isProtected: false,
    element: <NotFound />,
  },
];

const createRoutes = (routes: RouteType[]) =>
  routes.map((route: RouteType) => {
    const { path, element, children, isProtected } = route;
    const Guard = isProtected ? ProtectedRoute : GuestRoute;

    if (children) {
      return (
        <Route key={path} path={path} element={<Guard>{element}</Guard>}>
          {createRoutes(children)}
        </Route>
      );
    }

    return <Route key={path} path={path} element={<Guard>{element}</Guard>} />;
  });

const AppRoutes = () => <Routes>{createRoutes(appRoutes)}</Routes>;

export default AppRoutes;
