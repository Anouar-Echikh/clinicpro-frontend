import { Prescription } from "@/types";

// Utility function to calculate age
const calculateAge = (dateOfBirth: string | Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Format date for prescription
const formatDate = (dateString: string | Date | null): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Generate HTML content for prescription
const generatePrescriptionHTML = (prescription: Prescription): string => {
  const patientAge = calculateAge(prescription.patient_id.date_of_birth);
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Prescription - ${prescription.prescription_id}</title>
      <style>
        body {
          font-family: 'Times New Roman', serif;
          margin: 0;
          padding: 20px;
          background-color: white;
          color: #000;
          line-height: 1.4;
        }
        
        .prescription-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 30px;
          border: 2px solid #000;
          background-color: white;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .clinic-name {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
          color: #1a5490;
        }
        
        .clinic-address {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }
        
        .prescription-title {
          font-size: 24px;
          font-weight: bold;
          margin-top: 15px;
          color: #000;
        }
        
        .prescription-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 15px;
        }
        
        .patient-info, .doctor-info {
          flex: 1;
        }
        
        .info-label {
          font-weight: bold;
          color: #333;
        }
        
        .medications-section {
          margin-bottom: 30px;
        }
        
        .medications-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 20px;
          border-bottom: 1px solid #000;
          padding-bottom: 5px;
        }
        
        .medication-item {
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid #ddd;
          background-color: #f9f9f9;
        }
        
        .medication-name {
          font-size: 18px;
          font-weight: bold;
          color: #1a5490;
          margin-bottom: 5px;
        }
        
        .medication-details {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .medication-instructions {
          font-style: italic;
          background-color: #e8f4fd;
          padding: 8px;
          border-left: 3px solid #1a5490;
          margin-top: 10px;
        }
        
        .diagnosis-section {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f0f8ff;
          border-left: 4px solid #1a5490;
        }
        
        .notes-section {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #fff9e6;
          border-left: 4px solid #ff9800;
        }
        
        .footer {
          margin-top: 40px;
          border-top: 2px solid #000;
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .doctor-signature {
          text-align: right;
        }
        
        .signature-line {
          border-bottom: 1px solid #000;
          width: 200px;
          margin-bottom: 5px;
          height: 40px;
        }
        
        .print-date {
          font-size: 12px;
          color: #666;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .prescription-container {
            border: none;
            box-shadow: none;
            margin: 0;
            padding: 20px;
          }
          
          @page {
            margin: 1in;
            size: A4;
          }
        }
        
        .rx-symbol {
          font-size: 24px;
          font-weight: bold;
          color: #1a5490;
        }
        
        .follow-up {
          background-color: #e8f5e8;
          padding: 10px;
          border-left: 4px solid #4caf50;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="prescription-container">
        <!-- Header -->
        <div class="header">
          <div class="clinic-name">Medical Clinic Management System</div>
          <div class="clinic-address">
            123 Medical Street, Healthcare City, HC 12345<br>
            Phone: (555) 123-4567 | Email: info@clinic.com
          </div>
          <div class="prescription-title">
            <span class="rx-symbol">℞</span> PRESCRIPTION
          </div>
        </div>
        
        <!-- Prescription Info -->
        <div class="prescription-info">
          <div class="patient-info">
            <div><span class="info-label">Patient:</span> ${prescription.patient_id ? `${prescription.patient_id.first_name} ${prescription.patient_id.last_name}` : 'Unknown Patient'}</div>
            <div><span class="info-label">Age:</span> ${patientAge} years</div>
            <div><span class="info-label">Gender:</span> ${prescription.patient_id?.gender || 'N/A'}</div>
            ${prescription.patient_id?.phone ? `<div><span class="info-label">Phone:</span> ${prescription.patient_id.phone}</div>` : ''}
          </div>
          <div class="doctor-info">
            <div><span class="info-label">Doctor:</span> Dr. ${prescription.doctor_id.first_name} ${prescription.doctor_id.last_name}</div>
            ${prescription.doctor_id.specialization ? `<div><span class="info-label">Specialization:</span> ${prescription.doctor_id.specialization}</div>` : ''}
            <div><span class="info-label">Prescription ID:</span> ${prescription.prescription_id}</div>
            <div><span class="info-label">Date:</span> ${formatDate(prescription.created_at)}</div>
          </div>
        </div>
        
        <!-- Diagnosis -->
        <div class="diagnosis-section">
          <div class="info-label">Diagnosis:</div>
          <div style="font-size: 16px; margin-top: 5px;">${prescription.diagnosis}</div>
        </div>
        
        <!-- Medications -->
        <div class="medications-section">
          <div class="medications-title">Medications Prescribed</div>
          ${prescription.medications.map((med, index) => `
            <div class="medication-item">
              <div class="medication-name">${index + 1}. ${med.name} - ${med.dosage}</div>
              <div class="medication-details">
                <div><span class="info-label">Frequency:</span> ${med.frequency}</div>
                <div><span class="info-label">Duration:</span> ${med.duration}</div>
                <div><span class="info-label">Quantity:</span> ${med.quantity} units</div>
              </div>
              ${med.instructions ? `
                <div class="medication-instructions">
                  <strong>Instructions:</strong> ${med.instructions}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        
        <!-- Clinical Notes -->
        ${prescription.notes ? `
          <div class="notes-section">
            <div class="info-label">Clinical Notes:</div>
            <div style="margin-top: 5px;">${prescription.notes}</div>
          </div>
        ` : ''}
        
        <!-- Follow-up -->
        ${prescription.follow_up_date ? `
          <div class="follow-up">
            <div class="info-label">Follow-up Date:</div>
            <div style="margin-top: 5px;">${formatDate(prescription.follow_up_date)}</div>
          </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          <div class="print-date">
            Printed on: ${currentDate}<br>
            Status: ${prescription.status.toUpperCase()}
            ${prescription.pharmacy_dispensed ? '<br>✓ Sent to Pharmacy' : ''}
          </div>
          <div class="doctor-signature">
            <div class="signature-line"></div>
            <div>Dr. ${prescription.doctor_id.first_name} ${prescription.doctor_id.last_name}</div>
            <div style="font-size: 12px; color: #666;">Prescribing Physician</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Print prescription function
export const printPrescription = (prescription: Prescription): void => {
  try {
    // Generate HTML content
    const htmlContent = generatePrescriptionHTML(prescription);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }
    
    // Write content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Close the window after printing (optional)
      // printWindow.close();
    };
    
  } catch (error) {
    console.error('Error printing prescription:', error);
    throw error;
  }
};

// Export prescription as PDF (requires additional libraries like html2pdf or jsPDF)
export const exportPrescriptionAsPDF = async (prescription: Prescription): Promise<void> => {
  try {
    // Generate HTML content
    const htmlContent = generatePrescriptionHTML(prescription);
    
    // For now, we'll open the print dialog
    // In the future, you can integrate libraries like html2pdf.js or jsPDF
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.focus();
      // For PDF export, you would integrate a PDF library here
      printWindow.print();
    };
    
  } catch (error) {
    console.error('Error exporting prescription as PDF:', error);
    throw error;
  }
}; 