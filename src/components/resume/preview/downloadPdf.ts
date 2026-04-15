"use client";

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ResumeData } from '@/types/resume';

const PDF_WIDTH_MM = 210;
const PDF_HEIGHT_MM = 297;
const RESUME_WIDTH_PX = 800;
// A4 height in px at 800px wide
const A4_HEIGHT_PX = Math.round(RESUME_WIDTH_PX * (PDF_HEIGHT_MM / PDF_WIDTH_MM)); // 1131px

export async function downloadResumePdf(data: ResumeData): Promise<void> {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: absolute;
    top: 0;
    left: -10000px;
    width: ${RESUME_WIDTH_PX}px;
    min-width: ${RESUME_WIDTH_PX}px;
    overflow: visible;
    background: #fff;
  `;
  document.body.appendChild(wrapper);

  const { ResumeContent } = await import('./ResumeContent');
  const { createRoot } = await import('react-dom/client');
  const { createElement } = await import('react');

  const root = createRoot(wrapper);
  root.render(createElement(ResumeContent, { data, isPrint: true }));

  await new Promise(resolve => setTimeout(resolve, 900));

  const element = wrapper.firstElementChild as HTMLElement;
  if (!element) {
    root.unmount();
    document.body.removeChild(wrapper);
    return;
  }

  element.querySelectorAll<HTMLAnchorElement>('a').forEach(a => {
    a.style.textUnderlineOffset = '4px';
    a.style.textDecorationThickness = '1px';
    a.style.textDecoration = 'underline';
  });

  const rootRect = element.getBoundingClientRect();
  const totalH = rootRect.height;
  const scale = 3;

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: RESUME_WIDTH_PX,
    height: totalH,
    windowWidth: 1600,
    windowHeight: totalH,
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
    onclone: (_doc, clonedEl) => {
      clonedEl.style.width = `${RESUME_WIDTH_PX}px`;
      clonedEl.style.minWidth = `${RESUME_WIDTH_PX}px`;
      clonedEl.style.maxWidth = `${RESUME_WIDTH_PX}px`;
      clonedEl.style.overflow = 'visible';
      clonedEl.querySelectorAll<HTMLAnchorElement>('a').forEach(a => {
        a.style.textUnderlineOffset = '4px';
        a.style.textDecorationThickness = '1px';
        a.style.textDecoration = 'underline';
      });
    },
  });

  // ── Smart page boundaries ────────────────────────────────────────────────
  // Collect the top-y of every section wrapper (breakInside:avoid blocks).
  // When a naive A4 slice would cut through one, snap the boundary upward
  // to just before that section starts.
  const sectionTops: number[] = [];
  element.querySelectorAll<HTMLElement>('[data-section]').forEach(sec => {
    const r = sec.getBoundingClientRect();
    sectionTops.push(r.top - rootRect.top);
  });

  function smartPageBoundaries(totalHeight: number): number[] {
    const boundaries: number[] = [0];
    let cursor = 0;
    while (cursor < totalHeight) {
      const naiveCut = cursor + A4_HEIGHT_PX;
      if (naiveCut >= totalHeight) break;

      // Find the nearest section start that falls within the last 15% of the page
      // (i.e. a heading that would be stranded at the bottom)
      const safeZoneStart = cursor + A4_HEIGHT_PX * 0.85;
      const orphanSection = sectionTops.find(
        top => top >= safeZoneStart && top < naiveCut
      );

      const cut = orphanSection !== undefined ? orphanSection : naiveCut;
      boundaries.push(cut);
      cursor = cut;
    }
    boundaries.push(totalHeight);
    return boundaries;
  }

  // Top margin for continuation pages (px at display scale, ~25mm equivalent)
  const PAGE_TOP_MARGIN_PX = Math.round(A4_HEIGHT_PX * (25 / PDF_HEIGHT_MM)); // ~95px

  const boundaries = smartPageBoundaries(totalH);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  for (let i = 0; i < boundaries.length - 1; i++) {
    if (i > 0) pdf.addPage('a4', 'portrait');

    const srcYpx = boundaries[i] * scale;
    const srcHpx = (boundaries[i + 1] - boundaries[i]) * scale;

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = Math.round(A4_HEIGHT_PX * scale);
    const ctx = pageCanvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

    // Page 1: draw from top (resume has its own paddingTop)
    // Page 2+: offset content down by top margin to match @page margin feel
    const destY = i === 0 ? 0 : PAGE_TOP_MARGIN_PX * scale;
    ctx.drawImage(canvas, 0, srcYpx, canvas.width, srcHpx, 0, destY, canvas.width, srcHpx);

    pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, PDF_WIDTH_MM, PDF_HEIGHT_MM);
  }

  // ── Clickable link annotations ───────────────────────────────────────────
  const scaleX = PDF_WIDTH_MM / RESUME_WIDTH_PX;
  const scaleY = PDF_HEIGHT_MM / A4_HEIGHT_PX;

  element.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(anchor => {
    const rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref === '#') return;

    const rect = anchor.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const anchorTop = rect.top - rootRect.top;
    const anchorLeft = rect.left - rootRect.left;

    // Find which page this anchor falls on using our smart boundaries
    let pageIndex = 0;
    for (let i = 0; i < boundaries.length - 1; i++) {
      if (anchorTop >= boundaries[i] && anchorTop < boundaries[i + 1]) {
        pageIndex = i;
        break;
      }
    }

    const yOnPage = anchorTop - boundaries[pageIndex];
    // Add top margin offset for continuation pages (matches destY in canvas draw)
    const topMarginMm = pageIndex > 0 ? (PAGE_TOP_MARGIN_PX / A4_HEIGHT_PX) * PDF_HEIGHT_MM : 0;
    const url = rawHref.startsWith('http') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')
      ? rawHref : `https://${rawHref}`;

    pdf.setPage(pageIndex + 1);
    pdf.link(anchorLeft * scaleX, yOnPage * scaleY + topMarginMm, rect.width * scaleX, rect.height * scaleY, { url });
  });

  root.unmount();
  document.body.removeChild(wrapper);

  const fullName = data.personalInfo.fullName.trim();
  pdf.save(fullName ? `${fullName.replace(/\s+/g, '_')}_Resume.pdf` : 'Resume.pdf');
}
