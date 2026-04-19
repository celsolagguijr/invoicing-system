import { Router, Request, Response } from "express";
import { InvoiceController } from "../controller";
import ValidateToken from "../middlewares/ValidateToken";

const router = Router();

const invoiceController = new InvoiceController();
const validateToken = new ValidateToken();

router.get("/invoices", validateToken.validate, (req: Request, res: Response) =>
  invoiceController.getAllInvoices(req, res),
);

router.get(
  "/invoices/search",
  validateToken.validate,
  (req: Request, res: Response) => invoiceController.searchInvoices(req, res),
);

router.get(
  "/invoices/:id",
  validateToken.validate,
  (req: Request<{ id?: string }>, res: Response) =>
    invoiceController.getInvoiceById(req, res),
);

router.get(
  "/invoices/:id/pdf",
  validateToken.validate,
  (req: Request<{ id?: string }>, res: Response) =>
    invoiceController.downloadInvoicePdf(req, res),
);

router.post(
  "/invoices",
  validateToken.validate,
  (req: Request, res: Response) => invoiceController.createInvoice(req, res),
);

router.put(
  "/invoices/:id",
  validateToken.validate,
  (req: Request<{ id?: string }>, res: Response) =>
    invoiceController.updateInvoice(req, res),
);

router.delete(
  "/invoices/:id",
  validateToken.validate,
  (req: Request<{ id?: string }>, res: Response) =>
    invoiceController.deleteInvoice(req, res),
);

export default router;
