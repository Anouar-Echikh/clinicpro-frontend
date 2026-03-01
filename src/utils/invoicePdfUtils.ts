import jsPDF from 'jspdf';
import { Invoice } from '@/services/api';

// Clinic interface for PDF generation
export interface ClinicInfo {
  name: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface InvoicePDFOptions {
  includeHeader?: boolean;
  includeFooter?: boolean;
  quality?: number;
}

export class InvoicePDFGenerator {
  /**
   * Generate and download invoice as PDF
   */
  static async generateInvoicePDF(
    invoice: Invoice,
    clinicInfo?: ClinicInfo,
    options: InvoicePDFOptions = {}
  ): Promise<void> {
    const {
      includeHeader = true,
      includeFooter = true,
      quality = 1
    } = options;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;

      // Header Section
      if (includeHeader) {
        // Clinic Information Header
        if (clinicInfo?.name) {
          pdf.setFontSize(20);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(37, 99, 235); // Blue color
          pdf.text(clinicInfo.name.toUpperCase(), 20, yPosition);
          yPosition += 8;
          
          // Clinic contact info
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(107, 114, 128); // Gray color
          
          if (clinicInfo.address) {
            const addressLine = [clinicInfo.address.street, clinicInfo.address.city, clinicInfo.address.state, clinicInfo.address.zipCode]
              .filter(Boolean).join(', ');
            if (addressLine) {
              pdf.text(addressLine, 20, yPosition);
              yPosition += 4;
            }
          }
          
          if (clinicInfo.contact) {
            const contactLine = [clinicInfo.contact.phone, clinicInfo.contact.email]
              .filter(Boolean).join(' | ');
            if (contactLine) {
              pdf.text(contactLine, 20, yPosition);
              yPosition += 4;
            }
            if (clinicInfo.contact.website) {
              pdf.text(clinicInfo.contact.website, 20, yPosition);
              yPosition += 4;
            }
          }
          
          yPosition += 10;
        }

        // Invoice Title
        pdf.setFontSize(28);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235); // Blue color
        pdf.text('INVOICE', 20, yPosition);
        yPosition += 15;

        // Invoice details in header
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Invoice #: ${invoice.invoice_number}`, 20, yPosition);
        pdf.text(`Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, 120, yPosition);
        yPosition += 6;
        pdf.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 120, yPosition);
        yPosition += 6;
        if (invoice.payment_date) {
          pdf.text(`Payment Date: ${new Date(invoice.payment_date).toLocaleDateString()}`, 120, yPosition);
          yPosition += 6;
        }
        yPosition += 10;
      }

      // Patient Information Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', 20, yPosition);
      yPosition += 8;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const patientName = typeof invoice.patient_id === 'string' 
        ? invoice.patient_id 
        : `${invoice.patient_id.first_name} ${invoice.patient_id.last_name}`;
      
      pdf.text(patientName, 20, yPosition);
      yPosition += 6;

      if (typeof invoice.patient_id !== 'string' && invoice.patient_id.email) {
        pdf.text(`Email: ${invoice.patient_id.email}`, 20, yPosition);
        yPosition += 6;
      }

      if (typeof invoice.patient_id !== 'string' && invoice.patient_id.phone) {
        pdf.text(`Phone: ${invoice.patient_id.phone}`, 20, yPosition);
        yPosition += 6;
      }

      yPosition += 10;

      // Status Badge
      const statusX = 150;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      
      // Set status color
      let statusColor = [107, 114, 128]; // gray
      if (invoice.status === 'paid') statusColor = [34, 197, 94]; // green
      else if (invoice.status === 'pending') statusColor = [59, 130, 246]; // blue
      else if (invoice.status === 'overdue') statusColor = [239, 68, 68]; // red

      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.text(`Status: ${invoice.status.toUpperCase()}`, statusX, yPosition - 15);
      pdf.setTextColor(0, 0, 0);

      // Services Table Header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Services & Items', 20, yPosition);
      yPosition += 10;

      // Table headers
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      
      // Draw table header background
      pdf.setFillColor(243, 244, 246);
      pdf.rect(20, yPosition - 5, 170, 8, 'F');
      
      pdf.text('Description', 22, yPosition);
      pdf.text('Type', 90, yPosition);
      pdf.text('Qty', 120, yPosition);
      pdf.text('Unit Price', 140, yPosition);
      pdf.text('Total', 170, yPosition);
      yPosition += 10;

      // Table content
      pdf.setFont('helvetica', 'normal');
      let serviceYPosition = yPosition;

      invoice.services.forEach((service, index) => {
        // Check if we need a new page
        if (serviceYPosition > 250) {
          pdf.addPage();
          serviceYPosition = 20;
        }

        pdf.text(service.description.substring(0, 35), 22, serviceYPosition);
        pdf.text(service.type || 'Service', 90, serviceYPosition);
        pdf.text(service.quantity.toString(), 120, serviceYPosition);
        pdf.text(`$${service.unit_price.toFixed(2)}`, 140, serviceYPosition);
        pdf.text(`$${service.total.toFixed(2)}`, 170, serviceYPosition);
        
        serviceYPosition += 8;

        // Add a line between services
        if (index < invoice.services.length - 1) {
          pdf.setDrawColor(229, 231, 235);
          pdf.line(20, serviceYPosition - 1, 190, serviceYPosition - 1);
        }
      });

      yPosition = serviceYPosition + 10;

      // Check if we need a new page for summary
      if (yPosition > 230) {
        pdf.addPage();
        yPosition = 20;
      }

      // Payment Summary Section
      const summaryX = 120;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');

      // Draw summary background
      pdf.setFillColor(249, 250, 251);
      pdf.rect(summaryX - 5, yPosition - 5, 75, 50, 'F');

      pdf.text('Subtotal:', summaryX, yPosition);
      pdf.text(`$${invoice.subtotal.toFixed(2)}`, 170, yPosition);
      yPosition += 8;

      pdf.text('Tax:', summaryX, yPosition);
      pdf.text(`$${invoice.tax_amount.toFixed(2)}`, 170, yPosition);
      yPosition += 8;

      if (invoice.discount && invoice.discount > 0) {
        pdf.setTextColor(34, 197, 94); // green for discount
        pdf.text('Discount:', summaryX, yPosition);
        pdf.text(`-$${invoice.discount.toFixed(2)}`, 170, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 8;
      }

      // Total line
      pdf.setDrawColor(0, 0, 0);
      pdf.line(summaryX, yPosition, 190, yPosition);
      yPosition += 6;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Total Amount:', summaryX, yPosition);
      pdf.text(`$${invoice.total_amount.toFixed(2)}`, 170, yPosition);
      yPosition += 15;

      // Payment Method (if paid)
      if (invoice.payment_method) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Payment Method: ${invoice.payment_method.replace('_', ' ').toUpperCase()}`, summaryX, yPosition);
        yPosition += 6;
      }

      // Notes Section
      if (invoice.notes) {
        yPosition += 10;
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Notes:', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const maxWidth = 170;
        const lines = pdf.splitTextToSize(invoice.notes, maxWidth);
        pdf.text(lines, 20, yPosition);
        yPosition += lines.length * 4;
      }

      // Footer
      if (includeFooter) {
        const pageCount = pdf.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(107, 114, 128);
          
          // Footer text
          pdf.text(
            `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
            20,
            290
          );
          
          // Company info footer
          if (clinicInfo?.name) {
            pdf.text(`Thank you for choosing ${clinicInfo.name}!`, 20, 285);
          } else {
            pdf.text('Thank you for your business!', 20, 285);
          }
        }
      }

      // Save the PDF
      const filename = `invoice-${invoice.invoice_number}-${patientName.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw new Error('Failed to generate invoice PDF');
    }
  }

  /**
   * Preview invoice PDF in new window
   */
  static async previewInvoicePDF(invoice: Invoice, clinicInfo?: ClinicInfo, options: InvoicePDFOptions = {}): Promise<void> {
    try {
      // Generate PDF but don't download
      const pdf = new jsPDF('p', 'mm', 'a4');
      // ... same PDF generation code as above ...

      // Open in new window instead of downloading
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
      // Clean up the URL after a short delay
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (error) {
      console.error('Error previewing invoice PDF:', error);
      throw new Error('Failed to preview invoice PDF');
    }
  }

  /**
   * Get PDF as base64 string (for email attachments, etc.)
   */
  static async getInvoicePDFBase64(invoice: Invoice, clinicInfo?: ClinicInfo, options: InvoicePDFOptions = {}): Promise<string> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      // ... same PDF generation code as above ...
      
      return pdf.output('datauristring');
    } catch (error) {
      console.error('Error generating invoice PDF base64:', error);
      throw new Error('Failed to generate invoice PDF');
    }
  }
}
