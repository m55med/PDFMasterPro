// PDF Master Pro - File Picker Modal
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLanguage } from '../../context';
import { Typography, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { PDFFile } from '../../types/pdf';
import { getStoredPDFFiles, pickPDFFiles, formatFileSize, isRNFSAvailable } from '../../services/pdfFileService';

interface FilePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onFilesSelected: (files: PDFFile[]) => void;
  allowMultiple?: boolean;
  selectedFiles?: PDFFile[];
}

export const FilePickerModal: React.FC<FilePickerModalProps> = ({
  visible,
  onClose,
  onFilesSelected,
  allowMultiple = true,
  selectedFiles = [],
}) => {
  const { colors } = useTheme();
  const { t: _t, isRTL: _isRTL } = useLanguage();
  void _t; void _isRTL; // Reserved for future use
  const insets = useSafeAreaInsets();

  const [storedFiles, setStoredFiles] = useState<PDFFile[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

  // Load stored files when modal opens
  useEffect(() => {
    if (visible) {
      loadStoredFiles();
      // Initialize selected IDs from already selected files
      setSelectedIds(new Set(selectedFiles.map(f => f.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const loadStoredFiles = async () => {
    setIsLoading(true);
    try {
      // Check if RNFS is available before trying to load files
      const rnfsReady = isRNFSAvailable();
      setStorageAvailable(rnfsReady);

      if (rnfsReady) {
        const files = await getStoredPDFFiles();
        setStoredFiles(files);
      } else {
        setStoredFiles([]);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setStorageAvailable(false);
      setStoredFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickFromDevice = async () => {
    setIsPicking(true);
    try {
      const files = await pickPDFFiles(allowMultiple);
      if (files.length > 0) {
        onFilesSelected(files);
        onClose();
      }
    } catch (error) {
      console.error('Error picking files:', error);
    } finally {
      setIsPicking(false);
    }
  };

  const handleToggleFile = (file: PDFFile) => {
    const newSelected = new Set(selectedIds);

    if (newSelected.has(file.id)) {
      newSelected.delete(file.id);
    } else {
      if (!allowMultiple) {
        newSelected.clear();
      }
      newSelected.add(file.id);
    }

    setSelectedIds(newSelected);
  };

  const handleConfirmSelection = () => {
    const selected = storedFiles.filter(f => selectedIds.has(f.id));
    if (selected.length > 0) {
      onFilesSelected(selected);
      onClose();
    }
  };

  const isFileSelected = (fileId: string) => selectedIds.has(fileId);
  const isAlreadyAdded = (fileId: string) => selectedFiles.some(f => f.id === fileId);

  const renderFileItem = ({ item }: { item: PDFFile }) => {
    const isSelected = isFileSelected(item.id);
    const isAdded = isAlreadyAdded(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.fileItem,
          {
            backgroundColor: isSelected ? colors.primaryLight : colors.bgWhite,
            borderColor: isSelected ? colors.primary : colors.border,
            opacity: isAdded ? 0.5 : 1,
          },
        ]}
        onPress={() => !isAdded && handleToggleFile(item)}
        disabled={isAdded}
        activeOpacity={0.7}
      >
        <View style={[styles.fileIcon, { backgroundColor: colors.primaryLight }]}>
          <Text style={styles.fileEmoji}>📄</Text>
        </View>
        <View style={styles.fileInfo}>
          <Text
            style={[styles.fileName, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
            {formatFileSize(item.size)}
          </Text>
        </View>
        <View style={[
          styles.checkbox,
          {
            borderColor: isSelected ? colors.primary : colors.border,
            backgroundColor: isSelected ? colors.primary : 'transparent',
          }
        ]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
        {/* Header */}
        <View style={[
          styles.header,
          {
            backgroundColor: colors.bgWhite,
            paddingTop: insets.top + Spacing.sm,
          }
        ]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: colors.textSecondary }]}>
              إلغاء
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            اختر ملفات PDF
          </Text>
          <View style={styles.closeButton} />
        </View>

        {/* Pick from Device Button */}
        <TouchableOpacity
          style={[styles.pickButton, { backgroundColor: colors.primary }]}
          onPress={handlePickFromDevice}
          disabled={isPicking}
          activeOpacity={0.8}
        >
          {isPicking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.pickIcon}>📱</Text>
              <Text style={styles.pickText}>اختر من الجهاز</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
            أو اختر من الملفات المخزنة
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Stored Files List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : !storageAvailable ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              اختر ملفات من جهازك
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textLight }]}>
              استخدم زر "اختر من الجهاز" في الأعلى
            </Text>
          </View>
        ) : storedFiles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              لا توجد ملفات مخزنة
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textLight }]}>
              اختر ملفات من جهازك لإضافتها
            </Text>
          </View>
        ) : (
          <FlatList
            data={storedFiles}
            renderItem={renderFileItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Confirm Button */}
        {selectedIds.size > 0 && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={handleConfirmSelection}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>
                إضافة ({selectedIds.size}) ملفات
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 60,
  },
  closeText: {
    fontSize: Typography.fontSize.base,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  pickIcon: {
    fontSize: 24,
  },
  pickText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  listContent: {
    padding: Spacing.md,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  fileEmoji: {
    fontSize: 24,
  },
  fileInfo: {
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  confirmButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
});

export default FilePickerModal;
