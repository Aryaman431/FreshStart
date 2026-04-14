"use client";

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ResumeData } from '@/types/resume';

const RESUME_WIDTH_PX = 820;

export async function downloadResumePdf(data: ResumeData): Promise<void> {
  // ── Off-screen container ─────────────────────────────────────────────────
  // position:absolute + left far off-screen = full layout width, no clipping.
  // We also set overflow:visible so nothing gets cut.
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

  // Wait for React + fonts to fully render
  await new Promise(resolve => setTimeout(resolve, 900));

  const element = wrapper.firstElementChild as HTMLElement;
  if (!element) {
    root.unmount();
    document.body.removeChild(wrapper);
    return;
  }

  // Force the element to its natural height, full width
  const captureW = RESUME_WIDTH_PX;
  const captureH = element.scrollHeight;

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    // Explicitly tell html2canvas the capture dimensions
    width: captureW,
    height: captureH,
    // Large windowWidth prevents any responsive CSS from kicking in
    windowWidth: 1600,
    windowHeight: captureH,
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdfWidth = 210; // A4 mm
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

    // Accumulate offset relative to the resume root element
    let ax = 0;
    let ay = 0;
    let node: HTMLElement | null = anchor;
    while (node && node !== element) {
      ax += node.offsetLeft;
      ay += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }

    const url = rawHref.startsWith('http') || rawHref.startsWith('mailto') || rawHref.startsWith('tel')
      ? rawHref
      : `https://${rawHref}`;

    pdf.link(ax * scaleX, ay * scaleY, anchor.offsetWidth * scaleX, anchor.offsetHeight * scaleY, { url });
  });

  root.unmount();
  document.body.removeChild(wrapper);

  const fullName = data.personalInfo.fullName.trim();
  const filename = fullName ? `${fullName.replace(/\s+/g, '_')}_Resume.pdf` : 'Resume.pdf';
  pdf.save(filename);
}
