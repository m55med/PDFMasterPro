// PDF Master Pro - Navigation Types

export type RootStackParamList = {
  // Auth Stack
  Auth: undefined;
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;

  // Main Stack
  Main: undefined;
  MainTabs: undefined;

  // Tool Screens
  Merge: undefined;
  Split: undefined;
  Compress: undefined;
  Rotate: undefined;
  Protect: undefined;
  Unlock: undefined;
  Watermark: undefined;
  PageNumbers: undefined;
  OCR: undefined;
  Organize: undefined;
  JpgToPdf: undefined;
  PdfToJpg: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Documents: undefined;
  Tools: undefined;
  Favorites: undefined;
  Settings: undefined;
};

export type ToolStackParamList = {
  ToolsList: undefined;
  Merge: undefined;
  Split: undefined;
  Compress: undefined;
  Rotate: undefined;
  Protect: undefined;
  Unlock: undefined;
  Watermark: undefined;
  PageNumbers: undefined;
  OCR: undefined;
  Organize: undefined;
  JpgToPdf: undefined;
  PdfToJpg: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
