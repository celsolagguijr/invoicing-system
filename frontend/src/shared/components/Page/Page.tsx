import { Helmet } from "react-helmet";
import React from "react";

export type PageProps = {
  title?: string;
  headerTitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
};

const Page: React.FC<PageProps> = (props: PageProps) => {
  return (
    <>
      <Helmet>
        <title>{props.title}</title>
      </Helmet>
      {props.headerTitle && (
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              paddingLeft: 12,
              borderLeft: "4px solid #1890ff",
            }}
          >
            {props.headerTitle}
          </h2>
          {props.headerAction && <div>{props.headerAction}</div>}
        </div>
      )}
      {props.children}
    </>
  );
};

export default Page;
