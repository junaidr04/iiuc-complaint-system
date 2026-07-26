import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Complaint, CCMSStats } from '../types';
import { generateComplaintQRCode } from './qrCode';

export async function downloadComplaintPDFReceipt(complaint: Complaint) {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(30, 58, 138); // Deep Academic Blue
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CAMPUS COMPLAINT MANAGEMENT SYSTEM', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Central Administration & Student Grievance Redressal Cell', 14, 23);
  doc.text(`Official Docket Pass • Issued: ${new Date().toLocaleString()}`, 14, 29);

  // Auto Table 1: Primary Overview
  autoTable(doc, {
    startY: 42,
    head: [['Tracking ID', 'Status', 'Priority', 'Emergency Flag', 'Date Logged']],
    body: [
      [
        complaint.id,
        complaint.status.toUpperCase().replace('_', ' '),
        complaint.priority.toUpperCase(),
        complaint.isEmergency ? 'CRITICAL EMERGENCY' : 'Standard Routine',
        new Date(complaint.createdDate).toLocaleString(),
      ],
    ],
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [31, 41, 55] },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 6;

  // Auto Table 2: Details & Location
  autoTable(doc, {
    startY: currentY,
    head: [['Field', 'Information']],
    body: [
      ['Complaint Title', complaint.title],
      ['Department', complaint.departmentName],
      ['Category', complaint.category],
      ['Campus Location', `${complaint.building} (Room ${complaint.roomNumber})`],
      ['Complainant Name', complaint.isAnonymous ? 'Anonymous Submission' : complaint.studentName],
      ['Complainant Email', complaint.isAnonymous ? 'Hidden for Privacy' : complaint.studentEmail],
      ['Contact Phone', complaint.contactNumber || 'Not specified'],
      ['Assigned Staff', complaint.assignedStaffName || 'Pending Staff Assignment'],
      ['Description', complaint.description],
    ],
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold', fillColor: [248, 250, 252] },
      1: { cellWidth: 'auto' },
    },
    bodyStyles: { fontSize: 8.5, textColor: [31, 41, 55] },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Auto Table 3: Administrative Remarks & Audit History
  if (complaint.remarks && complaint.remarks.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Author', 'Role', 'Date & Time', 'Remark Text']],
      body: complaint.remarks.map((r) => [
        r.authorName,
        r.authorRole.toUpperCase(),
        new Date(r.date || (r as any).timestamp || Date.now()).toLocaleString(),
        r.text,
      ]),
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [31, 41, 55] },
      theme: 'striped',
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // Solution Notes if resolved
  if (complaint.solutionNotes) {
    autoTable(doc, {
      startY: currentY,
      head: [['Official Resolution & Technical Closure Notes']],
      body: [[complaint.solutionNotes]],
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: [6, 78, 59] },
      theme: 'grid',
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // QR Code & Verification Stamp Footer
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  try {
    const qrDataUrl = await generateComplaintQRCode(complaint.id);
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', 14, currentY, 32, 32);
    }
  } catch (err) {
    console.error(err);
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Central Complaint Management System (CCMS) Verification Stamp', 52, currentY + 10);
  doc.text('Scan the QR code to verify docket authenticity and track resolution milestones online.', 52, currentY + 16);
  doc.text(`Official Document Reference: CCMS-${complaint.id}-${Date.now().toString(36).toUpperCase()}`, 52, currentY + 22);

  // Page numbers / Footer
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages} • University Campus Grievance Redressal Portal`, 105, 287, { align: 'center' });
  }

  doc.save(`CCMS-Docket-${complaint.id}.pdf`);
}

export function downloadAnalyticsPDFReport(stats: CCMSStats) {
  const doc = new jsPDF();

  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('UNIVERSITY CCMS ANALYTICAL SUMMARY REPORT', 15, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString()} | Period: Academic Year 2026`, 15, 25);

  let y = 40;
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('KEY PERFORMANCE INDICATORS', 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 12;
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(`• Total Complaints Logged: ${stats.totalComplaints}`, 20, y);
  doc.text(`• Resolved Complaints: ${stats.resolvedComplaints}`, 110, y);

  y += 8;
  doc.text(`• Pending Review: ${stats.pendingComplaints}`, 20, y);
  doc.text(`• Critical Emergency Cases: ${stats.criticalComplaints}`, 110, y);

  y += 8;
  doc.text(`• Average Resolution Time: ${stats.avgResolutionDays} days`, 20, y);
  doc.text(`• Student Satisfaction Rating: ${stats.studentSatisfactionRate}%`, 110, y);

  y += 18;
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DEPARTMENT RESOLUTION BREAKDOWN', 15, y);
  doc.line(15, y + 2, 195, y + 2);

  y += 12;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Department Name', 20, y);
  doc.text('Total', 120, y);
  doc.text('Resolved', 155, y);

  y += 4;
  doc.setLineWidth(0.2);
  doc.setDrawColor(209, 213, 219);
  doc.line(15, y, 195, y);

  stats.departmentStats.forEach((dept) => {
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(dept.departmentName, 20, y);
    doc.text(String(dept.total), 120, y);
    doc.text(String(dept.resolved), 155, y);
  });

  doc.save(`CCMS-Analytics-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportComplaintsCSV(complaints: Complaint[]) {
  const headers = ['ID', 'Title', 'Category', 'Department', 'Building', 'Room', 'Priority', 'Status', 'Student Name', 'Created Date'];
  const rows = complaints.map((c) => [
    c.id,
    `"${c.title.replace(/"/g, '""')}"`,
    `"${c.category}"`,
    `"${c.departmentName}"`,
    `"${c.building}"`,
    `"${c.roomNumber}"`,
    c.priority,
    c.status,
    `"${c.studentName}"`,
    c.createdDate,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `CCMS_Complaints_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
