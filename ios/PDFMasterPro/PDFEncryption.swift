import Foundation
import UIKit
import PDFKit

@objc(PDFEncryption)
class PDFEncryption: NSObject {

  @objc
  func encryptPDF(_ inputPath: String,
                  outputPath: String,
                  password: String,
                  permissions: NSDictionary,
                  resolver resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: @escaping RCTPromiseRejectBlock) {

    DispatchQueue.global(qos: .userInitiated).async {
      do {
        // Clean up the input path
        var cleanInputPath = inputPath
        if cleanInputPath.hasPrefix("file://") {
          cleanInputPath = String(cleanInputPath.dropFirst(7))
        }
        cleanInputPath = cleanInputPath.removingPercentEncoding ?? cleanInputPath

        // Create URL for input file
        let inputURL = URL(fileURLWithPath: cleanInputPath)

        // Check if file exists
        guard FileManager.default.fileExists(atPath: cleanInputPath) else {
          DispatchQueue.main.async {
            reject("FILE_NOT_FOUND", "Input file not found: \(cleanInputPath)", nil)
          }
          return
        }

        // Load the PDF document
        guard let pdfDocument = PDFDocument(url: inputURL) else {
          DispatchQueue.main.async {
            reject("PDF_LOAD_ERROR", "Could not load PDF document", nil)
          }
          return
        }

        // Get permissions from dictionary
        let allowPrinting = permissions["printing"] as? Bool ?? true
        let allowCopying = permissions["copying"] as? Bool ?? true

        // Create encryption options
        var encryptionOptions: [PDFDocumentWriteOption: Any] = [
          .userPasswordOption: password,
          .ownerPasswordOption: password
        ]

        // Set access permissions
        // Note: PDFKit on iOS has limited permission control
        // The password protection itself is the main security feature
        if !allowPrinting {
          encryptionOptions[.allowsPrintingOption] = false
        }
        if !allowCopying {
          encryptionOptions[.allowsCopyingOption] = false
        }

        // Clean up output path
        var cleanOutputPath = outputPath
        if cleanOutputPath.hasPrefix("file://") {
          cleanOutputPath = String(cleanOutputPath.dropFirst(7))
        }
        cleanOutputPath = cleanOutputPath.removingPercentEncoding ?? cleanOutputPath

        let outputURL = URL(fileURLWithPath: cleanOutputPath)

        // Create output directory if needed
        let outputDirectory = outputURL.deletingLastPathComponent().path
        if !FileManager.default.fileExists(atPath: outputDirectory) {
          try FileManager.default.createDirectory(atPath: outputDirectory, withIntermediateDirectories: true)
        }

        // Write encrypted PDF
        let success = pdfDocument.write(to: outputURL, withOptions: encryptionOptions)

        if success {
          DispatchQueue.main.async {
            resolve([
              "success": true,
              "uri": outputURL.absoluteString,
              "path": cleanOutputPath
            ])
          }
        } else {
          DispatchQueue.main.async {
            reject("ENCRYPTION_FAILED", "Failed to write encrypted PDF", nil)
          }
        }

      } catch {
        DispatchQueue.main.async {
          reject("ENCRYPTION_ERROR", "Error encrypting PDF: \(error.localizedDescription)", error)
        }
      }
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
