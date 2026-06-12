import { Typography } from "antd";
const { Text } = Typography;

export interface InvoiceTotalCardDetails {
  title: string;
  amount: number;
  variant?: "default" | "danger" | "primary" | "secondary";
  currency?: boolean;
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const variants = {
  default: {
    container: {
      marginBottom: 10,
      padding: "10px 12px",
      background: "#f9f9f9", // soft neutral background
      borderBottom: ".5em solid #6b6b6b", // medium gray border
      borderRadius: 8,
    },
    text: {
      fontSize: 18,
    },
  },

  primary: {
    container: {
      marginBottom: 10,
      padding: "10px 12px",
      background: "#f0f5ff", // pale blue background
      borderBottom: ".5em solid #d6e4ff", // light blue border
      borderRadius: 8,
    },
    text: {
      fontSize: 18,
      color: "#1d39c4", // deep blue text
    },
  },

  secondary: {
    container: {
      marginBottom: 10,
      padding: "10px 12px",
      background: "#f6ffed", // pale green background
      borderBottom: ".5em solid #b7eb8f", // soft green border
      borderRadius: 8,
    },
    text: {
      fontSize: 18,
      color: "#389e0d", // rich green text
    },
  },

  danger: {
    container: {
      marginBottom: 10,
      padding: "10px 12px",
      background: "#fff1f0", // pale red background
      borderBottom: ".5em solid #ffa39e", // soft red border
      borderRadius: 8,
    },
    text: {
      fontSize: 18,
      color: "#cf1322", // strong red text
    },
  },
};

const InvoiceTotalCard: React.FC<InvoiceTotalCardDetails> = ({
  title,
  amount,
  currency = true,
  variant = "default",
}) => {
  return (
    <div style={variants[variant].container}>
      <Text type="secondary">{title}</Text>
      <div style={{ display: "flex", justifyContent: "end" }}>
        <Text strong style={variants[variant].text}>
          {currency ? formatMoney(amount) : amount.toFixed(2)}
        </Text>
      </div>
    </div>
  );
};

export default InvoiceTotalCard;
