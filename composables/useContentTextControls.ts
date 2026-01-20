import type { ICertificateContentForm, SizeMode } from '#achievement/config/types';
import { useCertificateContentUpdate } from '#achievement/composables/useCertificateContentUpdate';
import {
  ALIGNMENT_OPTIONS,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FONT_OPTIONS,
  FONT_WEIGHT_LABELS,
  SIZE_MODE_OPTIONS,
} from '#achievement/config/constants';
import { CONTENT_TYPE_CONFIGS } from '#achievement/config/types';

interface ContentTextControlsProps<T> {
  contentItem: T;
  index: number;
  isExpanded?: boolean;
  safeZoneWidth?: number;
  safeZoneHeight?: number;
}

interface AlignmentOption {
  label: string;
  value: string;
}

interface SizeModeOption {
  label: string;
  value: SizeMode;
}

export function useContentTextControls<T extends ICertificateContentForm>(
  props: ContentTextControlsProps<T>,
  emit: (event: 'update:contentItem' | 'delete' | 'headerClick', value?: any) => void,
) {
  const colorPickerInput = ref<HTMLInputElement | null>(null);

  const contentConfig = computed(() => CONTENT_TYPE_CONFIGS[props.contentItem.type]);
  const isCollapsed = computed(() => !props.isExpanded);

  const updateHandlers = useCertificateContentUpdate(() => props.contentItem, emit as any);

  const fontOptions = FONT_OPTIONS;
  const alignmentOptions = ALIGNMENT_OPTIONS;
  const sizeModeOptions = SIZE_MODE_OPTIONS as SizeModeOption[];

  // Load Google Fonts
  const loadFont = (fontUrl: string) => {
    if (!fontUrl) {
      return;
    }
    const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
    if (existingLink) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);
  };

  onMounted(() => {
    fontOptions.forEach((font) => {
      loadFont(font.url);
    });
  });

  // Font weight computations
  const availableFontWeights = computed(() => {
    const selectedFont = fontOptions.find(f => f.value === (props.contentItem.metadata as any).font_family);
    return selectedFont?.weights || [100, 200, 300, 400, 500, 600, 700, 800, 900];
  });

  const getClosestFontWeight = (targetWeight: number, availableWeights: number[]): number => {
    return availableWeights.reduce((prev, curr) => {
      return Math.abs(curr - targetWeight) < Math.abs(prev - targetWeight) ? curr : prev;
    });
  };

  const getFontWeightLabel = (weight: number): string => {
    return FONT_WEIGHT_LABELS[weight] || 'Regular';
  };

  const fontWeightOptions = computed(() => {
    return availableFontWeights.value.map(weight => ({
      label: getFontWeightLabel(weight),
      value: weight,
    }));
  });

  const selectedFontObject = computed(() => {
    return fontOptions.find(f => f.value === (props.contentItem.metadata as any).font_family) || fontOptions[10];
  });

  const selectedFontWeightObject = computed(() => {
    return fontWeightOptions.value.find(w => w.value === (props.contentItem.metadata as any).font_weight) || fontWeightOptions.value[0];
  });

  // Size mode computations
  const widthMode = computed<SizeMode>(() => (props.contentItem.metadata as any).width_mode || 'fix');
  const heightMode = computed<SizeMode>(() => (props.contentItem.metadata as any).height_mode || 'fix');

  const selectedWidthModeObject = computed<SizeModeOption>(() => {
    return (sizeModeOptions.find(m => m.value === widthMode.value) || sizeModeOptions[0]) as SizeModeOption;
  });

  const selectedHeightModeObject = computed<SizeModeOption>(() => {
    return (sizeModeOptions.find(m => m.value === heightMode.value) || sizeModeOptions[0]) as SizeModeOption;
  });

  // Text measurement utility
  const measureTextSize = (text: string, fontFamily: string, fontSize: number, fontWeight: number) => {
    if (typeof document === 'undefined') {
      return { width: 100, height: fontSize * 1.2 };
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      return { width: 100, height: fontSize * 1.2 };
    }

    // Set font properties
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    // Measure text
    const metrics = context.measureText(text || 'Sample Text');
    const width = Math.ceil(metrics.width);

    // Calculate height based on font metrics
    const height = Math.ceil(fontSize * 1.4); // Approximate line height

    return { width: Math.max(width, 20), height: Math.max(height, 20) };
  };

  // Calculate hug size based on content
  const calculateHugSize = () => {
    const metadata = props.contentItem.metadata as any;
    const text = props.contentItem.value || 'Sample Text';
    const fontFamily = metadata.font_family || '\'Montserrat\', sans-serif';
    const fontSize = metadata.font_size || 16;
    const fontWeight = metadata.font_weight || 400;

    return measureTextSize(text, fontFamily, fontSize, fontWeight);
  };

  // Get safe zone dimensions (defaults if not provided)
  const getSafeZoneWidth = () => props.safeZoneWidth || CANVAS_WIDTH;
  const getSafeZoneHeight = () => props.safeZoneHeight || CANVAS_HEIGHT;

  // Handle width mode change
  const handleWidthModeChange = (selectedOption: SizeModeOption | SizeMode) => {
    const newMode = typeof selectedOption === 'string' ? selectedOption : selectedOption.value;
    const metadata = props.contentItem.metadata as any;
    const shouldUnlockAspectRatio = newMode !== 'fix' && metadata.isAspectRatioLocked;

    // Calculate new width based on mode
    if (newMode === 'fill') {
      updateHandlers.updateWidthModeWithValue(newMode, getSafeZoneWidth(), shouldUnlockAspectRatio);
    }
    else if (newMode === 'hug') {
      const hugSize = calculateHugSize();
      updateHandlers.updateWidthModeWithValue(newMode, hugSize.width, shouldUnlockAspectRatio);
    }
    else {
      // For 'fix', keep the current width value
      updateHandlers.updateWidthModeWithValue(newMode, metadata.width, shouldUnlockAspectRatio);
    }
  };

  // Handle height mode change
  const handleHeightModeChange = (selectedOption: SizeModeOption | SizeMode) => {
    const newMode = typeof selectedOption === 'string' ? selectedOption : selectedOption.value;
    const metadata = props.contentItem.metadata as any;
    const shouldUnlockAspectRatio = newMode !== 'fix' && metadata.isAspectRatioLocked;

    // Calculate new height based on mode
    if (newMode === 'fill') {
      updateHandlers.updateHeightModeWithValue(newMode, getSafeZoneHeight(), shouldUnlockAspectRatio);
    }
    else if (newMode === 'hug') {
      const hugSize = calculateHugSize();
      updateHandlers.updateHeightModeWithValue(newMode, hugSize.height, shouldUnlockAspectRatio);
    }
    else {
      // For 'fix', keep the current height value
      updateHandlers.updateHeightModeWithValue(newMode, metadata.height, shouldUnlockAspectRatio);
    }
  };

  // Event handlers
  const handleFontFamilyUpdate = (selectedOption: any) => {
    const fontValue = selectedOption?.value || '\'Montserrat\', sans-serif';
    updateHandlers.updateFontFamily(fontValue);

    const selectedFont = fontOptions.find(f => f.value === fontValue);
    const newAvailableWeights = selectedFont?.weights || [400];

    let newWeight = (props.contentItem.metadata as any).font_weight;
    if (!newAvailableWeights.includes(newWeight)) {
      newWeight = getClosestFontWeight(newWeight, newAvailableWeights);
      updateHandlers.updateFontWeight(newWeight);
    }

    // Recalculate hug size if in hug mode
    if (widthMode.value === 'hug' || heightMode.value === 'hug') {
      nextTick(() => {
        const hugSize = calculateHugSize();
        if (widthMode.value === 'hug') {
          updateHandlers.updateWidth(hugSize.width);
        }
        if (heightMode.value === 'hug') {
          updateHandlers.updateHeight(hugSize.height);
        }
      });
    }
  };

  const handleFontWeightUpdate = (selectedOption: any) => {
    let weight = selectedOption?.value || 400;
    if (!availableFontWeights.value.includes(weight)) {
      weight = getClosestFontWeight(weight, availableFontWeights.value);
    }
    updateHandlers.updateFontWeight(weight);

    // Recalculate hug size if in hug mode
    if (widthMode.value === 'hug' || heightMode.value === 'hug') {
      nextTick(() => {
        const hugSize = calculateHugSize();
        if (widthMode.value === 'hug') {
          updateHandlers.updateWidth(hugSize.width);
        }
        if (heightMode.value === 'hug') {
          updateHandlers.updateHeight(hugSize.height);
        }
      });
    }
  };

  const handleFontSizeUpdate = (value: string | number) => {
    updateHandlers.updateFontSize(value);

    // Recalculate hug size if in hug mode
    if (widthMode.value === 'hug' || heightMode.value === 'hug') {
      nextTick(() => {
        const hugSize = calculateHugSize();
        if (widthMode.value === 'hug') {
          updateHandlers.updateWidth(hugSize.width);
        }
        if (heightMode.value === 'hug') {
          updateHandlers.updateHeight(hugSize.height);
        }
      });
    }
  };

  const handleAlignmentUpdate = (value: string | number | object | any[] | undefined) => {
    if (value && typeof value === 'object' && 'label' in value && 'value' in value) {
      const alignmentValue: AlignmentOption = value as AlignmentOption;
      updateHandlers.updateAlignment(alignmentValue);
    }
  };

  const handleDelete = () => {
    emit('delete', props.index);
  };

  // Aspect ratio logic - only available when both modes are 'fix'
  const isAspectRatioLocked = computed(() => (props.contentItem.metadata as any).isAspectRatioLocked ?? false);
  const canLockAspectRatio = computed(() => widthMode.value === 'fix' && heightMode.value === 'fix');

  const toggleAspectRatioLock = () => {
    if (!canLockAspectRatio.value) {
      return;
    }
    updateHandlers.updateAspectRatioLock(!isAspectRatioLocked.value);
  };

  const handleWidthUpdate = (value: string | number) => {
    // Only allow manual width update in 'fix' mode
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
    // Only allow manual height update in 'fix' mode
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

  // Handle text value update (for hug recalculation)
  const handleValueUpdate = (value: string | undefined) => {
    updateHandlers.updateValue(value);

    // Recalculate hug size if in hug mode
    if (widthMode.value === 'hug' || heightMode.value === 'hug') {
      nextTick(() => {
        const hugSize = calculateHugSize();
        if (widthMode.value === 'hug') {
          updateHandlers.updateWidth(hugSize.width);
        }
        if (heightMode.value === 'hug') {
          updateHandlers.updateHeight(hugSize.height);
        }
      });
    }
  };

  // Color picker
  const openColorPicker = () => {
    colorPickerInput.value?.click();
  };

  const handleColorChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const color = input.value.replace('#', '');
    updateHandlers.updateColor(color);
  };

  return {
    // Refs
    colorPickerInput,

    // Computed
    contentConfig,
    isCollapsed,
    fontOptions,
    alignmentOptions,
    sizeModeOptions,
    availableFontWeights,
    fontWeightOptions,
    selectedFontObject,
    selectedFontWeightObject,
    isAspectRatioLocked,
    canLockAspectRatio,
    widthMode,
    heightMode,
    selectedWidthModeObject,
    selectedHeightModeObject,

    // Handlers
    updateHandlers,
    handleFontFamilyUpdate,
    handleFontWeightUpdate,
    handleFontSizeUpdate,
    handleAlignmentUpdate,
    handleDelete,
    toggleAspectRatioLock,
    handleWidthUpdate,
    handleHeightUpdate,
    handleWidthModeChange,
    handleHeightModeChange,
    handleValueUpdate,
    openColorPicker,
    handleColorChange,

    // Utilities
    loadFont,
    getClosestFontWeight,
    getFontWeightLabel,
    measureTextSize,
    calculateHugSize,
  };
}
