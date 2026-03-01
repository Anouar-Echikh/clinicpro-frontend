import jsPDF from 'jspdf';
import { Prescription } from '@/types';

export interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
}

export interface PrescriptionSlipData {
  prescription: Prescription;
  date: Date;
  patient: {
    name: string;
    phone?: string;
    email?: string;
    age?: number;
    gender?: string;
  };
  doctor: {
    name: string;
    specialization?: string;
  };
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    quantity: number;
  }>;
  diagnosis: string;
  notes?: string;
}

export const convertToPrescriptionSlipData = (prescription: Prescription): PrescriptionSlipData => {
  // Calculate patient age
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

  return {
    prescription,
    date: new Date(prescription.created_at),
    patient: {
      name: prescription.patient_id 
        ? `${prescription.patient_id.first_name} ${prescription.patient_id.last_name}` 
        : 'Unknown Patient',
      phone: prescription.patient_id?.phone,
      email: prescription.patient_id?.email,
      age: prescription.patient_id?.date_of_birth 
        ? calculateAge(prescription.patient_id.date_of_birth) 
        : undefined,
      gender: prescription.patient_id?.gender,
    },
    doctor: {
      name: prescription.doctor_id 
        ? `Dr. ${prescription.doctor_id.first_name} ${prescription.doctor_id.last_name}` 
        : 'Unknown Doctor',
      specialization: prescription.doctor_id?.specialization,
    },
    medications: prescription.medications || [],
    diagnosis: prescription.diagnosis || '',
    notes: prescription.notes,
  };
};

export class PrescriptionSlipPDFGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private marginLeft: number;
  private marginRight: number;
  private contentWidth: number;

  constructor() {
    this.pdf = new jsPDF();
    this.pageWidth = this.pdf.internal.pageSize.width;
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.marginLeft = 15;
    this.marginRight = 15;
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;
  }

  generatePrescriptionSlipPDF(
    prescriptionData: PrescriptionSlipData,
    clinicInfo: ClinicInfo,
    includeNotes: boolean = true
  ): jsPDF {
    let yPosition = 15;

    // Clinic Header
    yPosition = this.addClinicHeader(clinicInfo, yPosition);
    yPosition += 8;

    // Date (top right)
    this.addDateTopRight(prescriptionData, 25);

    // Patient Information
    yPosition = this.addPatientInformation(prescriptionData, yPosition);
    yPosition += 8;

    // Doctor Information
    yPosition = this.addDoctorInformation(prescriptionData, yPosition);
    yPosition += 8;

    // Diagnosis
    yPosition = this.addDiagnosis(prescriptionData, yPosition);
    yPosition += 8;

    // Medications
    yPosition = this.addMedications(prescriptionData, yPosition);

    // Notes (if enabled and exists)
    if (includeNotes && prescriptionData.notes) {
      yPosition += 8;
      yPosition = this.addNotes(prescriptionData, yPosition);
    }

    // Instructions
    yPosition += 10;
    yPosition = this.addInstructions(yPosition);

    // Footer
    this.addFooter();

    return this.pdf;
  }

  private addClinicHeader(clinicInfo: ClinicInfo, yPosition: number): number {
    // Clinic Name
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(51, 51, 51);
    
    // Handle long clinic names with text wrapping
    const clinicNameLines = this.pdf.splitTextToSize(clinicInfo.name.toUpperCase(), this.contentWidth);
    
    if (Array.isArray(clinicNameLines)) {
      clinicNameLines.forEach((line, index) => {
        this.pdf.text(line, this.marginLeft + (this.contentWidth / 2), yPosition + (index * 4), { align: 'center' });
      });
      yPosition += clinicNameLines.length * 4;
    } else {
      this.pdf.text(clinicNameLines, this.marginLeft + (this.contentWidth / 2), yPosition, { align: 'center' });
      yPosition += 4;
    }

    // Clinic Address and Contact
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(51, 51, 51);
    
    const contactInfo = `${clinicInfo.address} | ${clinicInfo.phone} | ${clinicInfo.email}`;
    this.pdf.text(contactInfo, this.marginLeft + (this.contentWidth / 2), yPosition, { align: 'center' });
    yPosition += 3;

    if (clinicInfo.website) {
      this.pdf.text(clinicInfo.website, this.marginLeft + (this.contentWidth / 2), yPosition, { align: 'center' });
      yPosition += 3;
    }

    return yPosition;
  }

  private addDateTopRight(prescriptionData: PrescriptionSlipData, yPosition: number): void {
    // Date in top right corner
    const prescriptionDate = prescriptionData.date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(51, 51, 51);
    
    // Position date at top right
    const dateText = `Date: ${prescriptionDate}`;
    const textWidth = this.pdf.getTextWidth(dateText);
    const rightAlignX = this.marginLeft + this.contentWidth - textWidth;
    
    this.pdf.text(dateText, rightAlignX, yPosition);
  }

  private addPatientInformation(prescriptionData: PrescriptionSlipData, yPosition: number): number {
    // Section Header
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(51, 51, 51);
    this.pdf.text('PATIENT INFORMATION', this.marginLeft, yPosition);
    yPosition += 6;

    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(51, 51, 51);

    // Patient details without borders
    yPosition += 3;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`Name: ${prescriptionData.patient.name}`, this.marginLeft, yPosition);
    yPosition += 4;
    
    this.pdf.setFont('helvetica', 'normal');
    if (prescriptionData.patient.phone) {
      this.pdf.text(`Phone: ${prescriptionData.patient.phone}`, this.marginLeft, yPosition);
    }
    if (prescriptionData.patient.email) {
      this.pdf.text(`Email: ${prescriptionData.patient.email}`, this.marginLeft + 95, yPosition);
    }
    yPosition += 4;
    
    const additionalInfo: string[] = [];
    if (prescriptionData.patient.age) {
      additionalInfo.push(`Age: ${prescriptionData.patient.age} years`);
    }
    if (prescriptionData.patient.gender) {
      additionalInfo.push(`Gender: ${prescriptionData.patient.gender}`);
    }
    
    if (additionalInfo.length > 0) {
      this.pdf.text(additionalInfo.join(' | '), this.marginLeft, yPosition);
    }
    
    return yPosition + 8;
  }


  private addDoctorInformation(prescriptionData: PrescriptionSlipData, yPosition: number): number {
    // Section Header
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(51, 51, 51);
    this.pdf.text('DOCTOR INFORMATION', this.marginLeft, yPosition);
    yPosition += 6;

    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');

    // Doctor details without borders
    yPosition += 3;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(51, 51, 51);
    this.pdf.text(`Doctor: ${prescriptionData.doctor.name}`, this.marginLeft, yPosition);
    
    if (prescriptionData.doctor.specialization) {
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`Specialization: ${prescriptionData.doctor.specialization}`, this.marginLeft + 95, yPosition);
    }
    
    return yPosition + 8;
  }

  private addDiagnosis(prescriptionData: PrescriptionSlipData, yPosition: number): number {
    // Section Header
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(51, 51, 51);
    this.pdf.text('DIAGNOSIS', this.marginLeft, yPosition);
    yPosition += 6;

    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(51, 51, 51);

    // Diagnosis without borders
    yPosition += 3;
    const diagnosisLines = this.pdf.splitTextToSize(prescriptionData.diagnosis, this.contentWidth - 10);
    this.pdf.text(diagnosisLines, this.marginLeft, yPosition);
    const diagnosisHeight = Array.isArray(diagnosisLines) ? diagnosisLines.length * 3 : 3;
    
    return yPosition + diagnosisHeight + 4;
  }

  private addMedications(prescriptionData: PrescriptionSlipData, yPosition: number): number {
    // Section Header
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(51, 51, 51);
    this.pdf.text('MEDICATIONS PRESCRIBED', this.marginLeft, yPosition);
    yPosition += 6;

    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(51, 51, 51);

    // Medications without borders
    yPosition += 3;

    prescriptionData.medications.forEach((medication, index) => {
      // Check if we need a new page
      if (yPosition > this.pageHeight - 40) {
        this.pdf.addPage();
        yPosition = 20;
      }

      // Medication number and name
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`${index + 1}. ${medication.name}`, this.marginLeft, yPosition);
      yPosition += 3;

      // Medication details
      this.pdf.setFont('helvetica', 'normal');
      const details = [
        `Dosage: ${medication.dosage}`,
        `Frequency: ${medication.frequency}`,
        `Duration: ${medication.duration}`,
        `Quantity: ${medication.quantity} units`
      ];
      
      details.forEach((detail) => {
        this.pdf.text(`  ${detail}`, this.marginLeft + 3, yPosition);
        yPosition += 3;
      });

      // Instructions (if any)
      if (medication.instructions) {
        this.pdf.setFont('helvetica', 'italic');
        const instructionLines = this.pdf.splitTextToSize(`  Instructions: ${medication.instructions}`, this.contentWidth - 10);
        this.pdf.text(instructionLines, this.marginLeft + 3, yPosition);
        const instructionHeight = Array.isArray(instructionLines) ? instructionLines.length * 3 : 3;
        yPosition += instructionHeight;
      }

      yPosition += 3; // Space between medications
    });

    return yPosition;
  }

  private addNotes(prescriptionData: PrescriptionSlipData, yPosition: number): number {
    // Section Header
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(51, 51, 51);
    this.pdf.text('CLINICAL NOTES', this.marginLeft, yPosition);
    yPosition += 6;

    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(51, 51, 51);
    
    // Notes without borders
    const splitNotes = this.pdf.splitTextToSize(prescriptionData.notes!, this.contentWidth - 10);
    yPosition += 2;
    
    // Split long notes into multiple lines
    this.pdf.text(splitNotes, this.marginLeft, yPosition);
    const notesHeight = Array.isArray(splitNotes) ? splitNotes.length * 3 : 8;
    
    return yPosition + notesHeight + 4;
  }

  private addInstructions(yPosition: number): number {
    // Section Header
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(220, 53, 69);
    this.pdf.text('IMPORTANT INSTRUCTIONS', this.marginLeft, yPosition);
    yPosition += 5;

    // Instructions list
    const instructions = [
      '• Take medications exactly as prescribed by the doctor',
      '• Complete the full course of antibiotics even if you feel better',
      '• Do not share medications with others',
      '• Contact doctor immediately if you experience any adverse reactions',
      '• Keep all medications in a cool, dry place away from children'
    ];

    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(51, 51, 51);

    instructions.forEach((instruction) => {
      this.pdf.text(instruction, this.marginLeft + 3, yPosition);
      yPosition += 3;
    });

    return yPosition;
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 20;
    
    // Professional blue divider line
    this.pdf.setDrawColor(41, 84, 144);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.marginLeft, footerY - 5, this.marginLeft + this.contentWidth, footerY - 5);
    
    // Footer text
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(51, 51, 51);
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    this.pdf.text(`Generated on: ${currentDate}`, this.marginLeft, footerY);
    this.pdf.text('This is a computer-generated prescription slip', this.marginLeft + (this.contentWidth / 2), footerY, { align: 'center' });
  }

  download(filename: string): void {
    this.pdf.save(filename);
  }
}

// Main function to generate and download prescription slip PDF
export const generatePrescriptionSlipPDF = (
  prescription: Prescription,
  clinicInfo: ClinicInfo,
  includeNotes: boolean = true
): void => {
  try {
    const prescriptionData = convertToPrescriptionSlipData(prescription);
    const generator = new PrescriptionSlipPDFGenerator();
    const pdf = generator.generatePrescriptionSlipPDF(prescriptionData, clinicInfo, includeNotes);
    
    const filename = `prescription-slip-${prescription.prescription_id}.pdf`;
    generator.download(filename);
  } catch (error) {
    console.error('Error generating prescription slip PDF:', error);
    throw error;
  }
};
