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
exports.EmployeeCustomerTransaction = void 0;
const typeorm_1 = require("typeorm");
const Employee_1 = require("./Employee");
const Client_1 = require("./Client");
let EmployeeCustomerTransaction = class EmployeeCustomerTransaction {
};
exports.EmployeeCustomerTransaction = EmployeeCustomerTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "integer" }),
    __metadata("design:type", Number)
], EmployeeCustomerTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false }),
    (0, typeorm_1.ForeignKey)(() => Employee_1.Employee),
    __metadata("design:type", Number)
], EmployeeCustomerTransaction.prototype, "employee_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Employee_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: "employee_id" }),
    __metadata("design:type", Employee_1.Employee)
], EmployeeCustomerTransaction.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false }),
    (0, typeorm_1.ForeignKey)(() => Client_1.Client),
    __metadata("design:type", Number)
], EmployeeCustomerTransaction.prototype, "customer_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Client_1.Client),
    (0, typeorm_1.JoinColumn)({ name: "customer_id" }),
    __metadata("design:type", Client_1.Client)
], EmployeeCustomerTransaction.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], EmployeeCustomerTransaction.prototype, "working_hours", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], EmployeeCustomerTransaction.prototype, "ot_working_hours", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: false }),
    __metadata("design:type", Date)
], EmployeeCustomerTransaction.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], EmployeeCustomerTransaction.prototype, "remarks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EmployeeCustomerTransaction.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EmployeeCustomerTransaction.prototype, "updated_at", void 0);
exports.EmployeeCustomerTransaction = EmployeeCustomerTransaction = __decorate([
    (0, typeorm_1.Entity)({ name: "employee_customer_transactions" })
], EmployeeCustomerTransaction);
