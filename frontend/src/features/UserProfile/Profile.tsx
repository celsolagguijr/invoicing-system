import React from "react";
import { Spin, Card, Row, Col } from "antd";
import Page from "@app/shared/components/Page";
import { Layout } from "@components/Layout";
import useUserProfile from "./useUserProfile";

const Profile: React.FC = () => {
  const { data, isLoading, handleLogout } = useUserProfile();

  const ProfileField: React.FC<{ label: string; value: any }> = ({
    label,
    value,
  }) => (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "16px", fontWeight: "500" }}>{value || "-"}</div>
    </div>
  );

  return (
    <Layout
      onLogout={handleLogout}
      userName={`${data?.firstName} ${data?.lastName}`}
    >
      <Page title="User Profile" headerTitle="User Profile">
        <Spin spinning={isLoading} tip="Loading profile...">
          <Card style={{ maxWidth: "600px" }}>
            <Row gutter={[32, 32]}>
              <Col span={12}>
                <ProfileField label="First Name" value={data?.firstName} />
              </Col>
              <Col span={12}>
                <ProfileField label="Last Name" value={data?.lastName} />
              </Col>
              <Col span={12}>
                <ProfileField label="Email" value={data?.username} />
              </Col>
              <Col span={12}>
                <ProfileField
                  label="Date of Birth"
                  value={
                    data?.dateOfBirth
                      ? new Date(data.dateOfBirth).toLocaleDateString()
                      : "-"
                  }
                />
              </Col>
            </Row>
          </Card>
        </Spin>
      </Page>
    </Layout>
  );
};

export default Profile;
