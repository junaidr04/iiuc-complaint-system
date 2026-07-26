import QRCode from 'qrcode';

export async function generateComplaintQRCode(complaintId: string, appUrl?: string): Promise<string> {
  try {
    const trackingUrl = `${appUrl || window.location.origin}/track/${complaintId}`;
    const dataUrl = await QRCode.toDataURL(trackingUrl, {
      margin: 1,
      width: 180,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}
