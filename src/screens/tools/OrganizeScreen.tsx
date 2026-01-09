// PDF Master Pro - Organize PDF Screen
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
import { Header, Button, Card } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';

const TOOL_ID = 'organize';

const OrganizeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();

  const [file, setFile] = useState<PDFFile | null>(null);
  const [pages, setPages] = useState<number[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectFile = () => {
    const pageCount = 10;
    setFile({
      id: '1',
      name: 'Document.pdf',
      uri: '',
      size: 2500000,
      type: 'application/pdf',
      pageCount,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    });
    setPages(Array.from({ length: pageCount }, (_, i) => i + 1));
  };

  const togglePageSelection = (page: number) => {
    if (selectedPages.includes(page)) {
      setSelectedPages(selectedPages.filter(p => p !== page));
    } else {
      setSelectedPages([...selectedPages, page]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedPages.length === 0) return;
    setPages(pages.filter(p => !selectedPages.includes(p)));
    setSelectedPages([]);
  };

  const handleSave = async () => {
    if (!file) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(t.common.success, t.tools.organize.organizeSuccess, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <Header
        showBack
        title={t.tools.organize.title}
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => toggleFavorite(TOOL_ID)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.favoriteIcon}>
                {isFavorite(TOOL_ID) ? '⭐' : '☆'}
              </Text>
            </TouchableOpacity>
            {selectedPages.length > 0 && (
              <TouchableOpacity onPress={handleDeleteSelected}>
                <Text style={{ color: colors.error }}>Delete ({selectedPages.length})</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!file ? (
          <TouchableOpacity
            style={[styles.uploadArea, { borderColor: colors.primary }]}
            onPress={handleSelectFile}
          >
            <Text style={styles.uploadIcon}>📑</Text>
            <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
              Select PDF to Organize
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
                    {pages.length} pages
                  </Text>
                </View>
                <TouchableOpacity onPress={() => { setFile(null); setPages([]); }}>
                  <Text style={{ color: colors.error }}>✕</Text>
                </TouchableOpacity>
              </View>
            </Card>

            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              💡 {t.tools.organize.dragToReorder}
            </Text>

            <View style={styles.pagesGrid}>
              {pages.map((page, index) => (
                <TouchableOpacity
                  key={page}
                  style={[
                    styles.pageCard,
                    {
                      backgroundColor: colors.bgWhite,
                      borderColor: selectedPages.includes(page) ? colors.error : colors.border,
                      borderWidth: selectedPages.includes(page) ? 2 : 1,
                    },
                  ]}
                  onPress={() => togglePageSelection(page)}
                >
                  <View style={[styles.pageThumbnail, { backgroundColor: colors.bgGray }]}>
                    <Text style={styles.pageIcon}>📄</Text>
                  </View>
                  <Text style={[styles.pageNumber, { color: colors.textPrimary }]}>
                    Page {page}
                  </Text>
                  {selectedPages.includes(page) && (
                    <View style={[styles.selectedBadge, { backgroundColor: colors.error }]}>
                      <Text style={styles.selectedCheck}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={t.tools.organize.organizeButton}
              onPress={handleSave}
              loading={isProcessing}
              fullWidth
              size="lg"
              icon={<Text>💾</Text>}
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  favoriteIcon: { fontSize: 22 },
  uploadArea: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
  },
  uploadIcon: { fontSize: 48, marginBottom: Spacing.md },
  uploadTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semiBold },
  fileCard: { marginBottom: Spacing.md },
  fileInfo: { flexDirection: 'row', alignItems: 'center' },
  fileIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  fileDetails: { flex: 1 },
  fileName: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium },
  filePages: { fontSize: Typography.fontSize.sm },
  hint: { fontSize: Typography.fontSize.sm, textAlign: 'center', marginBottom: Spacing.md },
  pagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  pageCard: { width: '31%', aspectRatio: 0.7, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center' },
  pageThumbnail: { flex: 1, width: '100%', borderRadius: BorderRadius.sm, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xs },
  pageIcon: { fontSize: 24 },
  pageNumber: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.medium },
  selectedBadge: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  selectedCheck: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
});

export default OrganizeScreen;
