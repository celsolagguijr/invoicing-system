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
exports.Invoice = void 0;
const typeorm_1 = require("typeorm");
const Client_1 = require("./Client");
const InvoiceDetail_1 = require("./InvoiceDetail");
const InvoiceAdjustment_1 = require("./InvoiceAdjustment");
let Invoice = class Invoice {
};
exports.Invoice = Invoice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "integer" }),
    __metadata("design:type", Number)
], Invoice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: false, unique: true }),
    __metadata("design:type", String)
], Invoice.prototype, "invoice_no", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false }),
    (0, typeorm_1.ForeignKey)(() => Client_1.Client),
    __metadata("design:type", Number)
], Invoice.prototype, "client_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Client_1.Client),
    (0, typeorm_1.JoinColumn)({ name: "client_id" }),
    __metadata("design:type", Client_1.Client)
], Invoice.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: false }),
    __metadata("design:type", Date)
], Invoice.prototype, "invoice_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: false }),
    __metadata("design:type", Date)
], Invoice.prototype, "due_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: false }),
    __metadata("design:type", Date)
], Invoice.prototype, "coverage_start", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: false }),
    __metadata("design:type", Date)
], Invoice.prototype, "coverage_end", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], Invoice.prototype, "hourly_rate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], Invoice.prototype, "ot_hourly_rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], Invoice.prototype, "total_working_hours", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], Invoice.prototype, "total_ot_working_hours", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 15, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], Invoice.prototype, "total_amount", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => InvoiceDetail_1.InvoiceDetail, (detail) => detail.invoice, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Invoice.prototype, "invoice_details", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => InvoiceAdjustment_1.InvoiceAdjustment, (adjustment) => adjustment.invoice, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Invoice.prototype, "invoice_adjustments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Invoice.prototype, "total_additions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Invoice.prototype, "total_deductions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Invoice.prototype, "grand_total", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Invoice.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Invoice.prototype, "updated_at", void 0);
exports.Invoice = Invoice = __decorate([
    (0, typeorm_1.Entity)({ name: "invoices" })
], Invoice);
