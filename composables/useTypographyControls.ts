import type { CertificateContentForm } from '#achievement/config/types';
import { useCertificateContentUpdate } from '#achievement/composables/useCertificateContentUpdate';
import { FONT_OPTIONS, FONT_WEIGHT_LABELS } from '#achievement/config/constants';

interface TypographyControlsProps<T> {
  contentItem: T;
}

export function useTypographyControls<T extends CertificateContentForm>(
  props: TypographyControlsProps<T>,
  emit: (event: 'update:contentItem' | 'delete' | 'headerClick', value?: any) => void,
) {
  const updateHandlers = useCertificateContentUpdate(() => props.contentItem, emit as any);

  const fontOptions = FONT_OPTIONS;

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
  };

  const handleFontWeightUpdate = (selectedOption: any) => {
    let weight = selectedOption?.value || 400;
    if (!availableFontWeights.value.includes(weight)) {
      weight = getClosestFontWeight(weight, availableFontWeights.value);
    }
    updateHandlers.updateFontWeight(weight);
  };

  const handleFontSizeUpdate = (value: string | number) => {
    updateHandlers.updateFontSize(value);
  };

  const handleColorUpdate = (value: string) => {
    updateHandlers.updateColor?.(value);
  };

  return {
    fontWeightOptions,
    selectedFontObject,
    selectedFontWeightObject,
    availableFontWeights,

    handleFontFamilyUpdate,
    handleFontWeightUpdate,
    handleFontSizeUpdate,
    handleColorUpdate,
    loadFont,
    getClosestFontWeight,
    getFontWeightLabel,
  };
}
