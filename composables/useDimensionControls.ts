import type { CertificateContentForm, SizeMode } from '#achievement/config/types';
import { useCertificateContentUpdate } from '#achievement/composables/useCertificateContentUpdate';
import { CANVAS_HEIGHT, CANVAS_WIDTH, SIZE_MODE_OPTIONS } from '#achievement/config/constants';

interface DimensionControlsProps<T> {
  contentItem: T;
  safeZoneWidth?: number;
  safeZoneHeight?: number;
}

interface SizeModeOption {
  label: string;
  value: SizeMode;
}

export function useDimensionControls<T extends CertificateContentForm>(
  props: DimensionControlsProps<T>,
  emit: (event: 'update:contentItem' | 'delete' | 'headerClick', value?: any) => void,
) {
  const updateHandlers = useCertificateContentUpdate(() => props.contentItem, emit as any);

  const sizeModeOptions = SIZE_MODE_OPTIONS as SizeModeOption[];

  const widthMode = computed<SizeMode>(() => (props.contentItem.metadata as any).width_mode || 'fix');
  const heightMode = computed<SizeMode>(() => (props.contentItem.metadata as any).height_mode || 'fix');

  const selectedWidthModeObject = computed<SizeModeOption>(() => {
    return (sizeModeOptions.find(m => m.value === widthMode.value) || sizeModeOptions[0]) as SizeModeOption;
  });

  const selectedHeightModeObject = computed<SizeModeOption>(() => {
    return (sizeModeOptions.find(m => m.value === heightMode.value) || sizeModeOptions[0]) as SizeModeOption;
  });

  const getSafeZoneWidth = () => props.safeZoneWidth || CANVAS_WIDTH;
  const getSafeZoneHeight = () => props.safeZoneHeight || CANVAS_HEIGHT;

  const isAspectRatioLocked = computed(() => (props.contentItem.metadata as any).isAspectRatioLocked ?? false);
  const canLockAspectRatio = computed(() => widthMode.value === 'fix' && heightMode.value === 'fix');

  const toggleAspectRatioLock = () => {
    if (!canLockAspectRatio.value) {
      return;
    }
    updateHandlers.updateAspectRatioLock(!isAspectRatioLocked.value);
  };

  const handleWidthModeChange = (selectedOption: SizeModeOption | SizeMode) => {
    const newMode = typeof selectedOption === 'string' ? selectedOption : selectedOption.value;
    const metadata = props.contentItem.metadata as any;
    const shouldUnlockAspectRatio = newMode !== 'fix' && metadata.isAspectRatioLocked;

    if (newMode === 'fill') {
      updateHandlers.updateWidthModeWithValue(newMode, getSafeZoneWidth(), shouldUnlockAspectRatio);
    }
    else if (newMode === 'hug') {
      updateHandlers.updateWidthModeWithValue(newMode, 'fit-content', shouldUnlockAspectRatio);
    }
    else {
      const currentWidth = metadata.width === 'fit-content' ? 200 : metadata.width;
      updateHandlers.updateWidthModeWithValue(newMode, currentWidth, shouldUnlockAspectRatio);
    }
  };

  const handleHeightModeChange = (selectedOption: SizeModeOption | SizeMode) => {
    const newMode = typeof selectedOption === 'string' ? selectedOption : selectedOption.value;
    const metadata = props.contentItem.metadata as any;
    const shouldUnlockAspectRatio = newMode !== 'fix' && metadata.isAspectRatioLocked;

    if (newMode === 'fill') {
      updateHandlers.updateHeightModeWithValue(newMode, getSafeZoneHeight(), shouldUnlockAspectRatio);
    }
    else if (newMode === 'hug') {
      updateHandlers.updateHeightModeWithValue(newMode, 'fit-content', shouldUnlockAspectRatio);
    }
    else {
      const currentHeight = metadata.height === 'fit-content' ? 50 : metadata.height;
      updateHandlers.updateHeightModeWithValue(newMode, currentHeight, shouldUnlockAspectRatio);
    }
  };

  const handleWidthUpdate = (value: string | number) => {
    if (widthMode.value !== 'fix') {
      return;
    }

    updateHandlers.updateWidth(value);

    if (isAspectRatioLocked.value && canLockAspectRatio.value) {
      const metadata = props.contentItem.metadata as any;
      const aspectRatio = metadata.width / metadata.height;
      const newHeight = Number(value) / aspectRatio;
      updateHandlers.updateHeight(newHeight);
    }
  };

  const handleHeightUpdate = (value: string | number) => {
    if (heightMode.value !== 'fix') {
      return;
    }

    updateHandlers.updateHeight(value);

    if (isAspectRatioLocked.value && canLockAspectRatio.value) {
      const metadata = props.contentItem.metadata as any;
      const aspectRatio = metadata.width / metadata.height;
      const newWidth = Number(value) * aspectRatio;
      updateHandlers.updateWidth(newWidth);
    }
  };

  return {
    widthMode,
    heightMode,
    selectedWidthModeObject,
    selectedHeightModeObject,
    isAspectRatioLocked,
    canLockAspectRatio,

    handleWidthModeChange,
    handleHeightModeChange,
    handleWidthUpdate,
    handleHeightUpdate,
    toggleAspectRatioLock,
  };
}
