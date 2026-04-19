import { Router } from "express";
import AuthRouter from "./AuthRoute";
import UserRoute from "./UserRoute";
import EmployeeRoute from "./EmployeeRoute";
import ClientRoute from "./ClientRoute";
import EmployeeCustomerTransactionRoute from "./EmployeeCustomerTransactionRoute";
import InvoiceRoute from "./InvoiceRoute";

const routes = Router();

routes.use(AuthRouter);
routes.use(UserRoute);
routes.use(EmployeeRoute);
routes.use(ClientRoute);
routes.use(EmployeeCustomerTransactionRoute);
routes.use(InvoiceRoute);

export default routes;
