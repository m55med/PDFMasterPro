// PDF Master Pro - Documents Screen
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useLanguage, useStorage } from '../../context';
import { Card, Button, FilePickerModal } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';
import { formatFileSize } from '../../services/pdfFileService';
import { getPDFPageCount } from '../../services/pdfManipulationService';

const DocumentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const storage = useStorage();
  const documents = storage.documents || [];
  const { addDocument, removeDocument, loadDocuments } = storage;
  const insets = useSafeAreaInsets();

  const [showFilePicker, setShowFilePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  }, [loadDocuments]);

  const handleSelectFiles = () => {
    setShowFilePicker(true);
  };

  const handleFilesSelected = useCallback(async (selectedFiles: PDFFile[]) => {
    if (selectedFiles.length > 0) {
      setIsLoading(true);
      try {
        for (const file of selectedFiles) {
          // Get page count for each file
          const pageCount = await getPDFPageCount(file.uri);
          await addDocument({ ...file, pageCount });
        }
        Alert.alert(
          t.common.success,
          `تمت إضافة ${selectedFiles.length} ملف بنجاح`
        );
      } catch (error) {
        console.error('Error adding documents:', error);
        Alert.alert('خطأ', 'حدث خطأ أثناء إضافة الملفات');
      } finally {
        setIsLoading(false);
      }
    }
  }, [addDocument, t]);

  const handleDeleteDocument = useCallback((doc: PDFFile) => {
    Alert.alert(
      'حذف المستند',
      `هل تريد حذف "${doc.name}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeDocument(doc.id);
            } catch (error) {
              console.error('Error removing document:', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء حذف المستند');
            }
          },
        },
      ]
    );
  }, [removeDocument]);

  const handleOpenDocument = useCallback((doc: PDFFile) => {
    // Navigate to PDF viewer or show options
    Alert.alert(
      doc.name,
      'ماذا تريد أن تفعل؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'فتح في أداة',
          onPress: () => {
            navigation.navigate('Tools');
          },
        },
      ]
    );
  }, [navigation]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t.documents.title}
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleSelectFiles}
          >
            <Text style={styles.addButtonText}>+ إضافة</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              جاري إضافة الملفات...
            </Text>
          </View>
        ) : documents.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📁</Text>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                {t.documents.noDocuments}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {t.documents.addDocument}
              </Text>
              <Button
                title={t.common.selectFiles}
                onPress={handleSelectFiles}
                variant="primary"
                style={styles.selectButton}
              />
            </View>
          </Card>
        ) : (
          <View style={styles.documentsList}>
            {documents.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                onPress={() => handleOpenDocument(doc)}
                onLongPress={() => handleDeleteDocument(doc)}
                activeOpacity={0.7}
              >
                <Card style={styles.documentCard}>
                  <View style={styles.documentRow}>
                    <View style={[styles.documentIcon, { backgroundColor: colors.primaryLight }]}>
                      <Text style={styles.documentIconText}>📄</Text>
                    </View>
                    <View style={styles.documentInfo}>
                      <Text
                        style={[styles.documentName, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {doc.name}
                      </Text>
                      <Text style={[styles.documentMeta, { color: colors.textSecondary }]}>
                        {formatFileSize(doc.size)} • {doc.pageCount || '?'} صفحات
                      </Text>
                      <Text style={[styles.documentDate, { color: colors.textTertiary }]}>
                        {formatDate(doc.createdAt)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteDocument(doc)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={{ color: colors.error, fontSize: 18 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {documents.length > 0 && (
          <Text style={[styles.hint, { color: colors.textTertiary }]}>
            اضغط مطولاً على المستند لحذفه
          </Text>
        )}

        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>

      <FilePickerModal
        visible={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        onFilesSelected={handleFilesSelected}
        allowMultiple={true}
        selectedFiles={[]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  addButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 3,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
  },
  emptyCard: {
    minHeight: 300,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  selectButton: {
    minWidth: 150,
  },
  documentsList: {
    gap: Spacing.sm,
  },
  documentCard: {
    marginBottom: 0,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  documentIconText: {
    fontSize: 24,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 2,
  },
  documentMeta: {
    fontSize: Typography.fontSize.sm,
    marginBottom: 2,
  },
  documentDate: {
    fontSize: Typography.fontSize.xs,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  hint: {
    textAlign: 'center',
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.lg,
  },
});

export default DocumentsScreen;
