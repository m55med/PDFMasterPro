#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PDFEncryption, NSObject)

RCT_EXTERN_METHOD(encryptPDF:(NSString *)inputPath
                  outputPath:(NSString *)outputPath
                  password:(NSString *)password
                  permissions:(NSDictionary *)permissions
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
