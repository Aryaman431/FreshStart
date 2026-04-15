"use client";

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ResumeData } from '@/types/resume';

const RESUME_WIDTH_PX = 800;

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

  // Apply underline styles inline — globals.css doesn't apply in the clone
  element.querySelectorAll<HTMLAnchorElement>('a').forEach(a => {
    a.style.textUnderlineOffset = '4px';
    a.style.textDecorationThickness = '1px';
    a.style.textDecoration = 'underline';
  });

  // Get exact rendered dimensions — single source of truth for both
  // canvas capture size and link annotation scaling
  const rootRect = element.getBoundingClientRect();

  const captureW = rootRect.width;
  const captureH = rootRect.height;

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: captureW,
    height: captureH,
    windowWidth: 1600,
    windowHeight: captureH,
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

  const imgData = canvas.toDataURL('image/png');
  const pdfWidth = 210;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pdfWidth, pdfHeight],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  // ── Clickable link annotations ───────────────────────────────────────────
  const scaleX = pdfWidth / captureW;
  const scaleY = pdfHeight / captureH;

  element.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((anchor) => {
    const rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref === '#') return;

    const rect = anchor.getBoundingClientRect();
    const x = (rect.left - rootRect.left) * scaleX;
    const y = (rect.top - rootRect.top) * scaleY;
    const w = rect.width * scaleX;
    const h = rect.height * scaleY;

    // Skip zero-size anchors (hidden/collapsed)
    if (w <= 0 || h <= 0) return;

    const url = rawHref.startsWith('http') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')
      ? rawHref
      : `https://${rawHref}`;

    pdf.link(x, y, w, h, { url });
  });

  root.unmount();
  document.body.removeChild(wrapper);

  const fullName = data.personalInfo.fullName.trim();
  const filename = fullName ? `${fullName.replace(/\s+/g, '_')}_Resume.pdf` : 'Resume.pdf';
  pdf.save(filename);
}
