// PDF Master Pro - OCR Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLanguage, useFavorites } from '../../context';
import { Header, Button, Card } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';

const TOOL_ID = 'ocr';

const OCRScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectFile = () => {
    setFile({
      id: '1',
      name: 'Scanned_Document.pdf',
      uri: '',
      size: 2500000,
      type: 'application/pdf',
      pageCount: 5,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    });
  };

  const handleExtract = async () => {
    if (!file) return;
    setIsProcessing(true);

    // Simulate OCR processing
    setTimeout(() => {
      setIsProcessing(false);
      setExtractedText(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
      );
    }, 3000);
  };

  const handleCopy = () => {
    Clipboard.setString(extractedText);
    Alert.alert(t.common.success, t.tools.ocr.copied);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header
        showBack
        title={t.tools.ocr.title}
        rightAction={
          <TouchableOpacity
            onPress={() => toggleFavorite(TOOL_ID)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.favoriteIcon}>
              {isFavorite(TOOL_ID) ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!file ? (
          <TouchableOpacity
            style={[styles.uploadArea, { borderColor: colors.primary }]}
            onPress={handleSelectFile}
          >
            <Text style={styles.uploadIcon}>👁️</Text>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              Select Scanned PDF or Image
            </Text>
            <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
              Supports PDF, JPG, PNG
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <Card style={styles.fileCard}>
              <View style={styles.fileInfo}>
                <View style={[styles.fileIcon, { backgroundColor: colors.primaryLight }]}>
                  <Text>📄</Text>
                </View>
                <View style={styles.fileDetails}>
                  <Text style={[styles.fileName, { color: colors.textPrimary }]}>
                    {file.name}
                  </Text>
                  <Text style={[styles.filePages, { color: colors.textSecondary }]}>
                    {file.pageCount} pages
                  </Text>
                </View>
                <TouchableOpacity onPress={() => { setFile(null); setExtractedText(''); }}>
                  <Text style={{ color: colors.error }}>✕</Text>
                </TouchableOpacity>
              </View>
            </Card>

            {!extractedText && (
              <Button
                title={t.tools.ocr.extractButton}
                onPress={handleExtract}
                loading={isProcessing}
                fullWidth
                size="lg"
                icon={<Text>👁️</Text>}
              />
            )}

            {isProcessing && (
              <Card style={styles.progressCard}>
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                  {t.tools.ocr.extracting}
                </Text>
                <Text style={[styles.progressHint, { color: colors.textLight }]}>
                  This may take a few moments...
                </Text>
              </Card>
            )}

            {extractedText && (
              <>
                <View style={styles.resultHeader}>
                  <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>
                    Extracted Text
                  </Text>
                  <TouchableOpacity onPress={handleCopy}>
                    <Text style={[styles.copyButton, { color: colors.primary }]}>
                      {t.tools.ocr.copyText} 📋
                    </Text>
                  </TouchableOpacity>
                </View>

                <Card style={styles.textCard}>
                  <ScrollView style={styles.textScroll} nestedScrollEnabled>
                    <Text style={[styles.extractedText, { color: colors.textPrimary }]}>
                      {extractedText}
                    </Text>
                  </ScrollView>
                </Card>

                <Button
                  title="Extract from Another File"
                  onPress={() => { setFile(null); setExtractedText(''); }}
                  variant="outline"
                  fullWidth
                />
              </>
            )}
          </>
        )}

        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  favoriteIcon: { fontSize: 22 },
  uploadArea: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
  },
  uploadIcon: { fontSize: 48, marginBottom: Spacing.md },
  uploadTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semiBold, marginBottom: Spacing.xs },
  uploadSubtitle: { fontSize: Typography.fontSize.sm },
  fileCard: { marginBottom: Spacing.lg },
  fileInfo: { flexDirection: 'row', alignItems: 'center' },
  fileIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  fileDetails: { flex: 1 },
  fileName: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium },
  filePages: { fontSize: Typography.fontSize.sm },
  progressCard: { alignItems: 'center', padding: Spacing.xl },
  progressText: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium, marginBottom: Spacing.sm },
  progressHint: { fontSize: Typography.fontSize.sm },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  resultTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semiBold },
  copyButton: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium },
  textCard: { marginBottom: Spacing.lg, maxHeight: 300 },
  textScroll: { maxHeight: 250 },
  extractedText: { fontSize: Typography.fontSize.sm, lineHeight: 22 },
});

export default OCRScreen;
