import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function triggerDownload(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

const safeName = (name) =>
  (name || "invitation").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "invitation";

/**
 * Renders the invitation node to an image and downloads it as PNG, JPEG or PDF.
 * The node is captured at 2x for crisp print-quality output.
 */
export async function exportInvitation(node, { format, name }) {
  if (!node) throw new Error("Nothing to export yet.");

  // Make sure the display fonts are loaded before the card is captured, so the
  // exported file keeps the invitation's typography.
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    width: 640,
    height: 900,
    windowWidth: 900,
    windowHeight: 1100,
  });

  const base = safeName(name);

  if (format === "png") {
    triggerDownload(canvas.toDataURL("image/png"), `${base}.png`);
    return;
  }
  if (format === "jpeg") {
    triggerDownload(canvas.toDataURL("image/jpeg", 0.95), `${base}.jpg`);
    return;
  }

  const w = 640;
  const h = 900;
  const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [w, h] });
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.96), "JPEG", 0, 0, w, h, undefined, "FAST");
  pdf.save(`${base}.pdf`);
}