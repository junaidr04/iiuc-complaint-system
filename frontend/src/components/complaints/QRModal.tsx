import React, { useEffect, useState } from 'react';
import { generateComplaintQRCode } from '../../utils/qrCode';
import { X, Download, Printer, QrCode } from 'lucide-react';

interface QRModalProps {
  complaintId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ complaintId, isOpen, onClose }) => {
  const [qrSrc, setQrSrc] = useState<string>('');

  useEffect(() => {
    if (isOpen && complaintId) {
      generateComplaintQRCode(complaintId).then((url) => setQrSrc(url));
    }
  }, [isOpen, complaintId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>CCMS QR Tracking Code - ${complaintId}</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 40px; }
              h2 { color: #1e3a8a; }
              img { width: 220px; height: 220px; }
            </style>
          </head>
          <body>
            <h2>Campus Complaint Tracking Pass</h2>
            <p><strong>Tracking ID: ${complaintId}</strong></p>
            <img src="${qrSrc}" />
            <p>Scan with any camera or university terminal for live status verification.</p>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">QR Tracking Code</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Complaint ID: {complaintId}</p>

        <div className="my-6 p-4 bg-white border border-slate-200 rounded-xl inline-block shadow-inner">
          {qrSrc ? <img src={qrSrc} alt="Complaint QR" className="w-48 h-48 mx-auto" /> : <div className="w-48 h-48 animate-pulse bg-slate-100" />}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Scan this QR pass with any mobile scanner to open the live complaint status tracker.
        </p>

        <div className="flex gap-2">
          <a
            href={qrSrc}
            download={`CCMS_QR_${complaintId}.png`}
            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Save Image
          </a>
          <button
            onClick={handlePrint}
            className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>
    </div>
  );
};
