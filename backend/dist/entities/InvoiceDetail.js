"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceDetail = void 0;
const typeorm_1 = require("typeorm");
const Invoice_1 = require("./Invoice");
const Client_1 = require("./Client");
const Employee_1 = require("./Employee");
let InvoiceDetail = class InvoiceDetail {
};
exports.InvoiceDetail = InvoiceDetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "integer" }),
    __metadata("design:type", Number)
], InvoiceDetail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false }),
    (0, typeorm_1.ForeignKey)(() => Invoice_1.Invoice),
    __metadata("design:type", Number)
], InvoiceDetail.prototype, "invoice_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Invoice_1.Invoice, (invoice) => invoice.invoice_details),
    (0, typeorm_1.JoinColumn)({ name: "invoice_id" }),
    __metadata("design:type", Invoice_1.Invoice)
], InvoiceDetail.prototype, "invoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false }),
    (0, typeorm_1.ForeignKey)(() => Client_1.Client),
    __metadata("design:type", Number)
], InvoiceDetail.prototype, "client_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Client_1.Client),
    (0, typeorm_1.JoinColumn)({ name: "client_id" }),
    __metadata("design:type", Client_1.Client)
], InvoiceDetail.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false }),
    (0, typeorm_1.ForeignKey)(() => Employee_1.Employee),
    __metadata("design:type", Number)
], InvoiceDetail.prototype, "employee_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Employee_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: "employee_id" }),
    __metadata("design:type", Employee_1.Employee)
], InvoiceDetail.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: false }),
    __metadata("design:type", Date)
], InvoiceDetail.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], InvoiceDetail.prototype, "billed_hours", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], InvoiceDetail.prototype, "billed_ot_hours", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], InvoiceDetail.prototype, "remarks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InvoiceDetail.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InvoiceDetail.prototype, "updated_at", void 0);
exports.InvoiceDetail = InvoiceDetail = __decorate([
    (0, typeorm_1.Entity)({ name: "invoice_details" })
], InvoiceDetail);
