// PDF Master Pro - Page Numbers Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLanguage } from '../../context';
import { Header, Button, Card } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';

const PageNumbersScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [format, setFormat] = useState<'numeric' | 'roman' | 'alphabetic'>('numeric');
  const [position, setPosition] = useState<'bottom-center' | 'bottom-right' | 'top-center'>('bottom-center');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatOptions = [
    { id: 'numeric', label: '1, 2, 3', example: 'Page 1' },
    { id: 'roman', label: 'I, II, III', example: 'Page I' },
    { id: 'alphabetic', label: 'A, B, C', example: 'Page A' },
  ];

  const positionOptions = [
    { id: 'top-center', label: 'Top Center' },
    { id: 'bottom-center', label: 'Bottom Center' },
    { id: 'bottom-right', label: 'Bottom Right' },
  ];

  const handleSelectFile = () => {
    setFile({
      id: '1',
      name: 'Document.pdf',
      uri: '',
      size: 2500000,
      type: 'application/pdf',
      pageCount: 25,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    });
  };

  const handleAddPageNumbers = async () => {
    if (!file) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(t.common.success, t.tools.pageNumbers.addSuccess, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header showBack title={t.tools.pageNumbers.title} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!file ? (
          <TouchableOpacity
            style={[styles.uploadArea, { borderColor: colors.primary }]}
            onPress={handleSelectFile}
          >
            <Text style={styles.uploadIcon}>🔢</Text>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              Select PDF
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
                <TouchableOpacity onPress={() => setFile(null)}>
                  <Text style={{ color: colors.error }}>✕</Text>
                </TouchableOpacity>
              </View>
            </Card>

            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t.tools.pageNumbers.format}
            </Text>
            <View style={styles.options}>
              {formatOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    {
                      backgroundColor: colors.bgWhite,
                      borderColor: format === option.id ? colors.primary : colors.border,
                      borderWidth: format === option.id ? 2 : 1,
                    },
                  ]}
                  onPress={() => setFormat(option.id as any)}
                >
                  <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.optionExample, { color: colors.textSecondary }]}>
                    {option.example}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t.tools.pageNumbers.position}
            </Text>
            <View style={styles.positionOptions}>
              {positionOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.positionOption,
                    {
                      backgroundColor: colors.bgWhite,
                      borderColor: position === option.id ? colors.primary : colors.border,
                      borderWidth: position === option.id ? 2 : 1,
                    },
                  ]}
                  onPress={() => setPosition(option.id as any)}
                >
                  <Text style={[styles.positionLabel, { color: colors.textPrimary }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={t.tools.pageNumbers.addButton}
              onPress={handleAddPageNumbers}
              loading={isProcessing}
              fullWidth
              size="lg"
              icon={<Text>🔢</Text>}
            />
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
  uploadArea: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
  },
  uploadIcon: { fontSize: 48, marginBottom: Spacing.md },
  uploadTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semiBold },
  fileCard: { marginBottom: Spacing.lg },
  fileInfo: { flexDirection: 'row', alignItems: 'center' },
  fileIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  fileDetails: { flex: 1 },
  fileName: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium },
  filePages: { fontSize: Typography.fontSize.sm },
  sectionTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semiBold, marginBottom: Spacing.md },
  options: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  option: { flex: 1, alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg },
  optionLabel: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semiBold, marginBottom: 4 },
  optionExample: { fontSize: Typography.fontSize.sm },
  positionOptions: { gap: Spacing.sm, marginBottom: Spacing.lg },
  positionOption: { padding: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center' },
  positionLabel: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium },
});

export default PageNumbersScreen;
