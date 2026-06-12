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
exports.InvoiceAdjustment = void 0;
const typeorm_1 = require("typeorm");
const Invoice_1 = require("./Invoice");
let InvoiceAdjustment = class InvoiceAdjustment {
};
exports.InvoiceAdjustment = InvoiceAdjustment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "integer" }),
    __metadata("design:type", Number)
], InvoiceAdjustment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar",
        length: 20,
        nullable: false,
        default: "ADDITIONAL",
    }),
    __metadata("design:type", String)
], InvoiceAdjustment.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false }),
    (0, typeorm_1.ForeignKey)(() => Invoice_1.Invoice),
    __metadata("design:type", Number)
], InvoiceAdjustment.prototype, "invoice_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Invoice_1.Invoice, (invoice) => invoice.invoice_adjustments),
    (0, typeorm_1.JoinColumn)({ name: "invoice_id" }),
    __metadata("design:type", Invoice_1.Invoice)
], InvoiceAdjustment.prototype, "invoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], InvoiceAdjustment.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], InvoiceAdjustment.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], InvoiceAdjustment.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], InvoiceAdjustment.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false }),
    __metadata("design:type", Number)
], InvoiceAdjustment.prototype, "sort", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InvoiceAdjustment.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InvoiceAdjustment.prototype, "updated_at", void 0);
exports.InvoiceAdjustment = InvoiceAdjustment = __decorate([
    (0, typeorm_1.Entity)({ name: "invoice_adjustments" })
], InvoiceAdjustment);
