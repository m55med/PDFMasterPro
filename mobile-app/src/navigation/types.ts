/**
 * Navigation Types
 * Type definitions for all navigation screens
 */

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  App: undefined;
  Auth: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Files: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  ToolDetail: { toolId: string; toolName: string };
  
  // Tools
  MergePDF: undefined;
  SplitPDF: undefined;
  CompressPDF: undefined;
  JpgToPdf: undefined;
  PdfToJpg: undefined;
  RotatePDF: undefined;
  ProtectPDF: undefined;
  UnlockPDF: undefined;
  WatermarkPDF: undefined;
  PageNumbers: undefined;
  OrganizePDF: undefined;
  OCRPDF: undefined;
};

export type FilesStackParamList = {
  FilesList: undefined;
  FileDetail: { fileId: string };
  FilePreview: { fileId: string; filePath: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  Account: undefined;
  Preferences: undefined;
  Language: undefined;
  About: undefined;
  Premium: undefined;
};
