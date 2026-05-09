// src/utils/exportPdf.js

import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

/**
 * Exports a specific HTML section as a PDF.
 *
 * @param {string} elementId - The id of the HTML element to export.
 * @param {string} fileName - The name of the downloaded PDF file.
 */
export const exportRoadmapPDF = async (
  elementId = "roadmap-export",
  fileName = "career-roadmap.pdf",
) => {
  const input = document.getElementById(elementId);

  if (!input) {
    throw new Error(`Element with id "${elementId}" not found.`);
  }

  try {
    // Wait so hidden report layout is fully rendered
    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight,
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error("Failed to capture roadmap report.");
    }

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // PDF margins
    const marginX = 10;
    const marginTop = 10;
    const marginBottom = 48;

    const contentWidth = pageWidth - marginX * 2;
    const contentHeight = pageHeight - marginTop - marginBottom;

    // Convert PDF mm height into canvas pixels
    const pxPerMm = canvas.width / contentWidth;
    const pageCanvasHeight = Math.floor(contentHeight * pxPerMm);

    let sourceY = 0;
    let pageIndex = 0;

    while (sourceY < canvas.height) {
      const remainingHeight = canvas.height - sourceY;
      const sliceHeight = Math.min(pageCanvasHeight, remainingHeight);

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const pageContext = pageCanvas.getContext("2d");

      pageContext.fillStyle = "#ffffff";
      pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      pageContext.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      );

      const pageImageData = pageCanvas.toDataURL("image/png");
      const pageImageHeight = sliceHeight / pxPerMm;

      if (pageIndex > 0) {
        pdf.addPage();
      }

      pdf.addImage(
        pageImageData,
        "PNG",
        marginX,
        marginTop,
        contentWidth,
        pageImageHeight,
      );

      sourceY += sliceHeight;
      pageIndex += 1;
    }

    pdf.save(fileName);
  } catch (error) {
    console.error("PDF export failed:", error);
    throw error;
  }
};
