import React from "react";
import {
  LockOutlined,
  UserOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Card,
  Alert,
  Flex,
  Space,
  Typography,
} from "antd";
import Page from "@components/Page";
import useLogin from "./useLogin";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "./styles.less";

const { Title, Text } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const { login, isLoading, error } = useLogin();
  const navigate = useNavigate();
  const today = dayjs().format("dddd, MMMM D, YYYY");

  const onSubmit = (data: LoginFormValues) => {
    login({
      username: data.username,
      password: data.password,
    });
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <Page title="Login">
      <div className="login-page">
        <div className="login-glow login-glow-left" />
        <div className="login-glow login-glow-right" />

        <div className="login-form-panel">
          <Card className="login-card" bordered={false}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div>
                <div className="login-form-brand">
                  <img
                    src="/logo.png"
                    alt="GH Caregroup Services"
                    className="login-form-brand-logo"
                  />
                  <Text className="login-form-brand-name">
                    GH CAREGROUP SERVICES
                  </Text>
                </div>
                <Text className="login-date">{today}</Text>
                <Title level={2} className="login-title">
                  Sign In
                </Title>
                <Text className="login-subtitle">
                  Welcome back. Please enter your credentials to continue.
                </Text>
              </div>

              <Form<LoginFormValues>
                name="login"
                onFinish={onSubmit}
                layout="vertical"
              >
                {error !== "" && (
                  <Form.Item name="alert">
                    <Alert message={error} type="error" showIcon />
                  </Form.Item>
                )}

                <Form.Item
                  label="Email"
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "Please input your Email",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="you@example.com"
                    type="email"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please input your Password" },
                  ]}
                >
                  <Input
                    prefix={<LockOutlined />}
                    type="password"
                    placeholder="Enter your password"
                    size="large"
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 8 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<LoginOutlined />}
                    iconPosition="end"
                    loading={isLoading}
                    block
                  >
                    Sign In
                  </Button>
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Flex justify="center">
                    <Button
                      htmlType="button"
                      size="large"
                      variant="text"
                      iconPosition="end"
                      loading={isLoading}
                      icon={<UserAddOutlined />}
                      onClick={handleRegister}
                    >
                      Create account
                    </Button>
                  </Flex>
                </Form.Item>
              </Form>
            </Space>
          </Card>
        </div>
      </div>
    </Page>
  );
};

export default Login;
