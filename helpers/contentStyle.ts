import type {
  SafeZone,
  SizeMode,
  TextContentType,
} from '#achievement/config/types';
import { CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_FONT_FAMILY } from '#achievement/config/constants';

export interface TextStyleConfig {
  position: {
    left: number;
    top: number;
  };
  dimensions: {
    width: string | number;
    height: string | number;
    maxWidth: number;
    maxHeight: number;
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    textAlign: string;
    color: string;
  };
  overflow: {
    overflowX: string;
    overflowY: string;
  };
}

function calculateMaxWidth(
  widthMode: SizeMode | undefined,
  width: number | string,
  horizontal: number,
  safeZone: SafeZone,
): number {
  const baseMaxWidth = CANVAS_WIDTH - (safeZone.left || 0) - (safeZone.right || 0);

  if (widthMode === 'fill') {
    return baseMaxWidth;
  }

  if (widthMode === 'fix') {
    return typeof width === 'number' ? width : baseMaxWidth;
  }

  return baseMaxWidth - horizontal;
}

function calculateMaxHeight(
  heightMode: SizeMode | undefined,
  height: number | string,
  vertical: number,
  safeZone: SafeZone,
): number {
  const baseMaxHeight = CANVAS_HEIGHT - (safeZone.top || 0) - (safeZone.bottom || 0);

  if (heightMode === 'fill') {
    return baseMaxHeight;
  }

  if (heightMode === 'fix') {
    return typeof height === 'number' ? height : baseMaxHeight;
  }

  return baseMaxHeight - vertical;
}

export function getTextContentStyleConfig(
  content: TextContentType,
  safeZone: SafeZone,
): TextStyleConfig {
  const {
    width,
    height,
    font_family,
    font_size,
    font_weight,
    alignment,
    color,
    vertical,
    horizontal,
    width_mode,
    height_mode,
  } = content.metadata;

  const positionX = (horizontal || 0) + (safeZone.left || 0);
  const positionY = (vertical || 0) + (safeZone.top || 0);

  const fontFamilyValue = font_family || DEFAULT_FONT_FAMILY;
  const widthValue = width === 'fit-content' ? 'fit-content' : `${width}px`;
  const heightValue = height === 'fit-content' ? 'fit-content' : `${height}px`;

  const maxWidth = calculateMaxWidth(
    width_mode,
    width,
    horizontal || 0,
    safeZone,
  );

  const maxHeight = calculateMaxHeight(
    height_mode,
    height,
    vertical || 0,
    safeZone,
  );

  // const shouldHideOverflowX = width_mode === 'fill' || width_mode === 'fix';
  // const shouldHideOverflowY = height_mode === 'fill' || height_mode === 'fix';
  // const overflowXStyle = shouldHideOverflowX ? 'hidden' : 'visible';
  // const overflowYStyle = shouldHideOverflowY ? 'hidden' : 'visible';

  return {
    position: {
      left: positionX,
      top: positionY,
    },
    dimensions: {
      width: widthValue,
      height: heightValue,
      maxWidth,
      maxHeight,
    },
    typography: {
      fontFamily: fontFamilyValue,
      fontSize: font_size || 16,
      fontWeight: font_weight || 400,
      textAlign: alignment?.value || 'left',
      color: color || '000000',
    },
    overflow: {
      overflowX: 'hidden',
      overflowY: 'hidden',
    },
  };
}

export function generateCSSFromStyleConfig(
  styleConfig: TextStyleConfig,
  className: string,
): string {
  const { position, dimensions, typography, overflow } = styleConfig;

  return `
    .${className} {
        position: absolute;
        left: ${position.left}px;
        top: ${position.top}px;
        width: ${dimensions.width};
        height: ${dimensions.height};
        max-width: ${dimensions.maxWidth}px;
        max-height: ${dimensions.maxHeight}px;
        font-family: ${typography.fontFamily};
        font-size: ${typography.fontSize}px;
        font-weight: ${typography.fontWeight};
        text-align: ${typography.textAlign};
        color: #${typography.color};
        white-space: pre-wrap;
        overflow-x: ${overflow.overflowX};
        overflow-y: ${overflow.overflowY};
        box-sizing: border-box;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        display: block;
        z-index: 10;
    }`;
}

export function generateInlineStyleFromConfig(
  styleConfig: TextStyleConfig,
): string {
  const { position, dimensions, typography, overflow } = styleConfig;

  return `
    position: absolute;
    left: ${position.left}px;
    top: ${position.top}px;
    width: ${dimensions.width};
    height: ${dimensions.height};
    max-width: ${dimensions.maxWidth}px;
    max-height: ${dimensions.maxHeight}px;
    font-family: ${typography.fontFamily};
    font-size: ${typography.fontSize}px;
    font-weight: ${typography.fontWeight};
    text-align: ${typography.textAlign};
    color: #${typography.color};
    white-space: pre-wrap;
    overflow-x: ${overflow.overflowX};
    overflow-y: ${overflow.overflowY};
    box-sizing: border-box;
    display: block;
    z-index: 10;
    line-height: 1.4;
    margin: 0;
    padding: 0;
  `;
}
