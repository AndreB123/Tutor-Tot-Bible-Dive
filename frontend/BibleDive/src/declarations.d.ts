declare module "*.svg" {
    import { SvgProps } from "react-native-svg";
    const content: React.FC<SvgProps>;
    export default content;
  }

  declare module 'react-native-config' {
    interface Env {
      API_BASE_URL: string;
      WEBSOCKET_URL: string;
    }

    const Config: Env;
    export default Config
  }