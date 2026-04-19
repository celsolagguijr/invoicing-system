import { message } from "antd";
import React, { createContext } from "react";

interface IMessageProvider {
  children: React.ReactNode;
}

interface MessageProviderType {
  info: (_message: string) => void;
  success: (_message: string) => void;
  error: (_message: string) => void;
  warning: (_message: string) => void;
}

const MessageContext = createContext<MessageProviderType>({
  info: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
});

const MessageProvider: React.FC<IMessageProvider> = (
  props: IMessageProvider
) => {
  const [messageApi, contextHolder] = message.useMessage();

  const info = (message: string) => {
    messageApi.info(message);
  };

  const success = (message: string) => {
    messageApi.success(message);
  };

  const error = (message: string) => {
    messageApi.error(message);
  };

  const warning = (message: string) => {
    messageApi.warning(message);
  };

  return (
    <MessageContext.Provider value={{ info, success, error, warning }}>
      {contextHolder}
      {props.children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => React.useContext(MessageContext);
export default MessageProvider;
