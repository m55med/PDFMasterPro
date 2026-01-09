// PDF Master Pro - Split PDF Screen
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
import { useTheme, useLanguage, useFavorites } from '../../context';
import { Header, Button, Card, Input } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';

const TOOL_ID = 'split';

const SplitScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [splitMode, setSplitMode] = useState<'all' | 'range' | 'custom'>('all');
  const [rangeValue, setRangeValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectFile = () => {
    // Demo file
    setFile({
      id: '1',
      name: 'Document.pdf',
      uri: '',
      size: 2500000,
      type: 'application/pdf',
      pageCount: 15,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    });
  };

  const handleSplit = async () => {
    if (!file) {
      Alert.alert('Error', 'Please select a PDF file first');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        t.common.success,
        t.tools.split.splitSuccess,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header
        showBack
        title={t.tools.split.title}
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload Area */}
        {!file ? (
          <TouchableOpacity
            style={[styles.uploadArea, { borderColor: colors.primary }]}
            onPress={handleSelectFile}
          >
            <Text style={styles.uploadIcon}>✂️</Text>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              Select PDF to Split
            </Text>
            <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
              Tap to select a file
            </Text>
          </TouchableOpacity>
        ) : (
          <Card style={styles.fileCard}>
            <View style={styles.fileInfo}>
              <View style={[styles.fileIcon, { backgroundColor: colors.primaryLight }]}>
                <Text>📄</Text>
              </View>
              <View style={styles.fileDetails}>
                <Text style={[styles.fileName, { color: colors.textPrimary }]}>
                  {file.name}
                </Text>
                <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                  {file.pageCount} pages
                </Text>
              </View>
              <TouchableOpacity onPress={() => setFile(null)}>
                <Text style={{ color: colors.error }}>✕</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Split Options */}
        {file && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Split Mode
            </Text>

            <View style={styles.options}>
              {[
                { id: 'all', label: 'All Pages', desc: 'Extract each page as separate PDF' },
                { id: 'range', label: 'Page Range', desc: 'e.g., 1-5, 6-10' },
                { id: 'custom', label: 'Custom Pages', desc: 'e.g., 1, 3, 5, 7' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    {
                      backgroundColor: colors.bgWhite,
                      borderColor: splitMode === option.id ? colors.primary : colors.border,
                      borderWidth: splitMode === option.id ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSplitMode(option.id as any)}
                >
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: splitMode === option.id ? colors.primary : colors.border,
                        backgroundColor: splitMode === option.id ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {splitMode === option.id && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                      {option.desc}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {(splitMode === 'range' || splitMode === 'custom') && (
              <Input
                label={splitMode === 'range' ? 'Page Ranges' : 'Page Numbers'}
                placeholder={splitMode === 'range' ? '1-5, 6-10' : '1, 3, 5, 7'}
                value={rangeValue}
                onChangeText={setRangeValue}
                keyboardType="default"
              />
            )}

            <Button
              title={t.tools.split.splitButton}
              onPress={handleSplit}
              loading={isProcessing}
              fullWidth
              size="lg"
              icon={<Text>✂️</Text>}
            />
          </>
        )}

        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  favoriteIcon: {
    fontSize: 22,
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  uploadTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.xs,
  },
  uploadSubtitle: {
    fontSize: Typography.fontSize.sm,
  },
  fileCard: {
    marginBottom: Spacing.lg,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 2,
  },
  fileSize: {
    fontSize: Typography.fontSize.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  options: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: Typography.fontSize.sm,
  },
});

export default SplitScreen;
