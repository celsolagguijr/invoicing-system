"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePdfBuffer = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
};
const formatMoney = (value) => {
    return value.toFixed(2);
};
const getLogoPath = () => {
    const logoPath = path_1.default.resolve(__dirname, "../../Logo.png");
    return fs_1.default.existsSync(logoPath) ? logoPath : null;
};
const tableHeader = (doc, y, left) => {
    doc.lineWidth(0.6).rect(left, y, 515, 22).strokeColor("#94a3b8").stroke();
    doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#111827")
        .text("Date", left + 8, y + 7, { width: 72 })
        .text("Domestic Helper", left + 84, y + 7, { width: 150 })
        .text("Remarks", left + 240, y + 7, { width: 120 })
        .text("Hours", left + 366, y + 7, { width: 40, align: "right" })
        .text("OT", left + 412, y + 7, { width: 44, align: "right" })
        .text("Amount", left + 462, y + 7, { width: 46, align: "right" });
};
const drawPaymentFooter = (doc, left, yStart) => {
    const width = 515;
    const cardHeight = 128;
    const cardInset = 8;
    // Floating payment block rendered inline below summary.
    doc
        .roundedRect(left, yStart - cardInset, width, cardHeight, 8)
        .fill("#ffffff");
    doc
        .fillColor("#1f4a5f")
        .font("Helvetica-Bold")
        .fontSize(8)
        .text("Please pay the amount to Bank of Butterfield KYD Chequing Account #1361665040016/Dolor Pascual", left, yStart + 4, { width, align: "center" })
        .text("Please pay the amount to CNB Bank KYD Chequing Account #01113979/Dolor Pascual", left, yStart + 20, { width, align: "center" })
        .text("or", left, yStart + 36, {
        width,
        align: "center",
    })
        .text("Please pay the amount to Bank of Butterfield USD Chequing Account #8401665040028/Dolor Pascual", left, yStart + 52, { width, align: "center" })
        .text("If you prefer to pay by cheque, please make it payable to Dolor Pascual, and kindly let us know how we can collect.", left, yStart + 68, { width, align: "center" });
    doc
        .fillColor("#0b5f7a")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("THANK YOU FOR YOUR BUSINESS!", left, yStart + 102, {
        width,
        align: "center",
    });
};
const generateInvoicePdfBuffer = (invoice) => {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ size: "A4", margin: 40 });
        const buffers = [];
        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);
        const left = 40;
        const right = 555;
        const valueRightWidth = 200;
        const logoPath = getLogoPath();
        if (logoPath) {
            doc.image(logoPath, left, 36, {
                fit: [140, 64],
            });
        }
        doc
            .fillColor("#1f4a5f")
            .font("Helvetica-Oblique")
            .fontSize(14)
            .text("WE LOVE AND CARE", left + 150, 58);
        doc
            .fillColor("#0f172a")
            .font("Helvetica-Bold")
            .fontSize(20)
            .text("INVOICE", right - valueRightWidth, 28, {
            width: valueRightWidth,
            align: "right",
        });
        doc
            .fillColor("#334155")
            .font("Helvetica")
            .fontSize(10)
            .text(`Invoice No: ${invoice.invoice_no}`, right - valueRightWidth, 50, {
            width: valueRightWidth,
            align: "right",
        })
            .text(`Invoice Date: ${formatDate(invoice.invoice_date)}`, right - valueRightWidth, 66, {
            width: valueRightWidth,
            align: "right",
        })
            .text(`Due Date: ${formatDate(invoice.due_date)}`, right - valueRightWidth, 82, {
            width: valueRightWidth,
            align: "right",
        });
        let y = 116;
        doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .fillColor("#111827")
            .text("GH CAREGROUP SERVICES", left, y);
        y += 20;
        doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor("#374151")
            .text("# 83 PAXTON STREET SMITH ROAD VILLA", left, y)
            .text("P.O BOX 30788, KY1-1204 GRAND CAYMAN, CAYMAN ISLANDS", left, y + 14, {
            width: 515,
        })
            .text("Contact No: 345-924-8540", left, y + 40)
            .text("Website: www.ghcaregroup.ky; Email: ghcaregroup345@gmail.com", left, y + 54, {
            width: 515,
        });
        y += 82;
        doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#111827")
            .text("Bill To", left, y);
        y += 18;
        doc
            .font("Helvetica")
            .fontSize(10)
            .fillColor("#374151")
            .text(invoice.client?.name || "-", left, y)
            .text(invoice.client?.owner || "-", left, y + 14)
            .text(invoice.client?.address1 || "-", left, y + 28)
            .text(invoice.client?.address2 || "-", left, y + 42);
        y += 64;
        doc.moveTo(left, y).lineTo(right, y).strokeColor("#cbd5e1").stroke();
        y += 14;
        tableHeader(doc, y, left);
        y += 22;
        let computedHours = 0;
        let computedOtHours = 0;
        let computedAmount = 0;
        invoice.invoice_details.forEach((detail) => {
            if (y > 730) {
                doc.addPage({ size: "A4", margin: 40 });
                y = 40;
                tableHeader(doc, y, left);
                y += 22;
            }
            const billedHours = Number(detail.billed_hours || 0);
            const billedOtHours = Number(detail.billed_ot_hours || 0);
            const rowAmount = billedHours * Number(invoice.hourly_rate || 0) +
                billedOtHours * Number(invoice.ot_hourly_rate || 0);
            computedHours += billedHours;
            computedOtHours += billedOtHours;
            computedAmount += rowAmount;
            doc.lineWidth(0.5).rect(left, y, 515, 20).strokeColor("#cbd5e1").stroke();
            doc
                .fillColor("#111827")
                .font("Helvetica")
                .fontSize(9)
                .text(formatDate(new Date(detail.date)), left + 8, y + 6, { width: 72 })
                .text(detail.employee?.employee_name || "-", left + 84, y + 6, {
                width: 150,
            })
                .text(detail.remarks || "-", left + 240, y + 6, { width: 120 })
                .text(formatMoney(billedHours), left + 366, y + 6, {
                width: 40,
                align: "right",
            })
                .text(formatMoney(billedOtHours), left + 412, y + 6, {
                width: 44,
                align: "right",
            })
                .text(formatMoney(rowAmount), left + 462, y + 6, {
                width: 46,
                align: "right",
            });
            y += 20;
        });
        const displayHours = Number(invoice.total_working_hours || computedHours);
        const displayOtHours = Number(computedOtHours);
        const displayAmount = Number(invoice.total_amount || computedAmount);
        const displayAmountUsd = Number((displayAmount / 0.82).toFixed(2));
        const displayRate = Number(invoice.hourly_rate || 0);
        const displayOtRate = Number(invoice.ot_hourly_rate || 0);
        if (y > 730) {
            doc.addPage({ size: "A4", margin: 40 });
            y = 40;
            tableHeader(doc, y, left);
            y += 22;
        }
        doc.lineWidth(0.6).rect(left, y, 515, 20).strokeColor("#94a3b8").stroke();
        doc
            .fillColor("#111827")
            .font("Helvetica-Bold")
            .fontSize(9)
            .text("Total", left + 240, y + 6, { width: 120 })
            .text(formatMoney(displayHours), left + 366, y + 6, {
            width: 40,
            align: "right",
        })
            .text(formatMoney(displayOtHours), left + 412, y + 6, {
            width: 44,
            align: "right",
        })
            .text(formatMoney(displayAmount), left + 462, y + 6, {
            width: 46,
            align: "right",
        });
        y += 20;
        y += 14;
        doc.moveTo(left, y).lineTo(right, y).strokeColor("#cbd5e1").stroke();
        y += 12;
        const summaryY = y;
        doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .fillColor("#111827")
            .text(`Rate Per Hour: KYD ${formatMoney(displayRate)}`, left, summaryY, {
            width: 260,
            align: "left",
        });
        doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .fillColor("#111827")
            .text(`OT Rate Per Hour: KYD ${formatMoney(displayOtRate)}`, left, summaryY + 14, {
            width: 260,
            align: "left",
        });
        const totalHighlightX = right - 260;
        const totalHighlightWidth = 260;
        const totalHighlightHeight = 20;
        const usdHighlightY = summaryY + totalHighlightHeight + 6;
        doc
            .lineWidth(0.8)
            .rect(totalHighlightX, summaryY - 4, totalHighlightWidth, totalHighlightHeight)
            .fillAndStroke("#e6f4ff", "#1677ff");
        doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#003a8c")
            .text(`Total Amount: KYD ${formatMoney(displayAmount)}`, totalHighlightX + 8, summaryY + 1, {
            width: totalHighlightWidth - 16,
            align: "right",
        });
        doc
            .lineWidth(0.8)
            .rect(totalHighlightX, usdHighlightY, totalHighlightWidth, totalHighlightHeight)
            .fillAndStroke("#fff7e6", "#fa8c16");
        doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#ad4e00")
            .text(`Total Amount: USD ${formatMoney(displayAmountUsd)}`, totalHighlightX + 8, usdHighlightY + 5, {
            width: totalHighlightWidth - 16,
            align: "right",
        });
        y += 74;
        const paymentBlockTop = y + 12;
        const paymentBlockHeight = 128;
        if (paymentBlockTop + paymentBlockHeight > doc.page.height - 40) {
            doc.addPage({ size: "A4", margin: 40 });
            y = 40;
        }
        drawPaymentFooter(doc, left, y + 12);
        doc.end();
    });
};
exports.generateInvoicePdfBuffer = generateInvoicePdfBuffer;
