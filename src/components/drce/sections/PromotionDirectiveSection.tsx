'use client';

import React from 'react';
import type { DRCEDataContext, DRCEPromotionDirectiveSection, DRCETheme } from '@/lib/drce/schema';
import { resolvePromotionDirective } from '@/lib/drce/promotionDirective';

export function PromotionDirectiveSection({
  section,
  theme,
  ctx,
}: {
  section: DRCEPromotionDirectiveSection;
  theme: DRCETheme;
  ctx: DRCEDataContext;
}) {
  if (!section.visible) return null;
  const outcome = resolvePromotionDirective(section.promotionDirective, ctx);
  if (!outcome) return null;

  const isArabic = ctx.language === 'ar';
  const style = section.style;
  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: style.textAlign === 'right' ? 'flex-end' : style.textAlign === 'center' ? 'center' : 'flex-start',
        gap: 10,
        margin: '6px 0',
        padding: style.padding,
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor,
        color: style.valueColor,
        fontFamily: theme.fontFamily,
        fontSize: style.fontSize,
      }}
    >
      <strong style={{ color: style.labelColor }}>
        {isArabic ? (section.labelAr || 'حالة الترقية') : section.label}
      </strong>
      <span>{outcome}</span>
    </div>
  );
}
