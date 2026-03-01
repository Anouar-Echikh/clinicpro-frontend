import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Odontogram, ToothCondition } from '@/types';

export interface ExportOptions {
  includeChart?: boolean;
  includeTreatmentPlan?: boolean;
  includeNotes?: boolean;
  includePeriodontalAssessment?: boolean;
  quality?: number;
}

export class OdontogramExporter {
  
  /**
   * Export odontogram to PDF
   */
  static async exportToPDF(
    odontogram: Odontogram, 
    chartElement?: HTMLElement,
    options: ExportOptions = {}
  ): Promise<void> {
    const {
      includeChart = true,
      includeTreatmentPlan = true,
      includeNotes = true,
      includePeriodontalAssessment = true,
      quality = 1
    } = options;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Dental Chart Report', 20, yPosition);
      yPosition += 10;

      // Patient Information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const patientName = odontogram.patient_id?.full_name || 
                         `${odontogram.patient_id?.first_name || ''} ${odontogram.patient_id?.last_name || ''}`.trim() || 
                         'Unknown Patient';
      const patientAge = odontogram.patient_id?.age ? `${odontogram.patient_id.age} years` : 'Age not specified';
      const doctorName = odontogram.doctor_id?.first_name && odontogram.doctor_id?.last_name
                        ? `Dr. ${odontogram.doctor_id.first_name} ${odontogram.doctor_id.last_name}`
                        : 'Doctor not specified';
      
      pdf.text(`Patient: ${patientName}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Age: ${patientAge}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Examination Date: ${new Date(odontogram.examination_date).toLocaleDateString()}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Doctor: ${doctorName}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Numbering System: ${odontogram.numbering_system?.toUpperCase() || 'UNIVERSAL'}`, 20, yPosition);
      yPosition += 10;

      // Dental Chart Image
      if (includeChart && chartElement) {
        try {
          const canvas = await html2canvas(chartElement, {
            scale: quality,
            useCORS: true,
            backgroundColor: '#ffffff',
            allowTaint: true,
            logging: false,
            scrollX: 0,
            scrollY: 0
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 170;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Check if we need a new page
          if (yPosition + imgHeight > 280) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch (error) {
          console.error('Error capturing chart:', error);
          pdf.text('Chart image could not be generated', 20, yPosition);
          yPosition += 10;
        }
      }

      // Condition Legend
      if (includeChart) {
        // Check if we need a new page
        if (yPosition > 200) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Condition Legend', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');

        // Define condition legend in columns
        const conditions = [
          { name: 'Healthy', color: 'Green' },
          { name: 'Caries', color: 'Red' },
          { name: 'Filling', color: 'Blue' },
          { name: 'Crown', color: 'Orange' },
          { name: 'Bridge', color: 'Purple' },
          { name: 'Implant', color: 'Gray' },
          { name: 'Extraction', color: 'Black' },
          { name: 'Root Canal', color: 'Dark Red' },
          { name: 'Missing', color: 'White' },
          { name: 'Fractured', color: 'Orange' },
          { name: 'Restoration Needed', color: 'Pink' },
          { name: 'Sealant', color: 'Light Blue' },
          { name: 'Veneer', color: 'Light Purple' },
          { name: 'Temporary Filling', color: 'Light Green' },
          { name: 'Wear', color: 'Yellow' },
          { name: 'Periodontal Lesion', color: 'Brown' }
        ];

        // Print legend in 2 columns
        let columnX = 20;
        let legendY = yPosition;
        const itemsPerColumn = 8;
        
        conditions.forEach((condition, index) => {
          if (index === itemsPerColumn) {
            columnX = 110; // Second column
            legendY = yPosition;
          }
          
          pdf.text(`• ${condition.name}`, columnX, legendY);
          legendY += 4;
        });

        yPosition = Math.max(yPosition + (itemsPerColumn * 4), legendY) + 10;
      }

      // Treatment Summary
      if (includeTreatmentPlan && odontogram.treatment_summary) {
        // Check if we need a new page
        if (yPosition > 220) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Treatment Summary', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const summary = odontogram.treatment_summary;
        pdf.text(`Total Planned Treatments: ${summary.total_planned_treatments || 0}`, 20, yPosition);
        yPosition += 5;
        pdf.text(`Completed Treatments: ${summary.completed_treatments || 0}`, 20, yPosition);
        yPosition += 5;
        pdf.text(`In Progress Treatments: ${summary.in_progress_treatments || 0}`, 20, yPosition);
        yPosition += 5;
        
        const progress = odontogram.treatment_progress || 0;
        pdf.text(`Treatment Progress: ${progress}%`, 20, yPosition);
        yPosition += 10;
      }

      // Tooth Conditions
      if (odontogram.teeth_conditions && odontogram.teeth_conditions.length > 0) {
        // Check if we need a new page
        if (yPosition > 200) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Tooth Conditions', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');

        odontogram.teeth_conditions.forEach((tooth: ToothCondition) => {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.text(`Tooth ${tooth.tooth_number}: ${tooth.overall_condition.replace('_', ' ').toUpperCase()}`, 20, yPosition);
          yPosition += 4;

          if (tooth.surfaces && tooth.surfaces.length > 0) {
            const surfaceText = tooth.surfaces
              .map(s => `${s.surface}: ${s.condition}`)
              .join(', ');
            pdf.text(`  Surfaces: ${surfaceText}`, 25, yPosition);
            yPosition += 4;
          }

          if (tooth.mobility && tooth.mobility > 0) {
            pdf.text(`  Mobility: Grade ${tooth.mobility}`, 25, yPosition);
            yPosition += 4;
          }

          if (tooth.treatment_plan && tooth.treatment_plan.planned_treatment) {
            pdf.text(`  Treatment: ${tooth.treatment_plan.planned_treatment}`, 25, yPosition);
            yPosition += 4;
          }

          if (tooth.notes) {
            const maxWidth = 170;
            const lines = pdf.splitTextToSize(`  Notes: ${tooth.notes}`, maxWidth);
            pdf.text(lines, 25, yPosition);
            yPosition += lines.length * 4;
          }

          yPosition += 2;
        });
      }

      // Periodontal Assessment
      if (includePeriodontalAssessment && odontogram.periodontal_assessment) {
        // Check if we need a new page
        if (yPosition > 220) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Periodontal Assessment', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const assessment = odontogram.periodontal_assessment;
        pdf.text(`Bleeding on Probing: ${assessment.bleeding_on_probing ? 'Yes' : 'No'}`, 20, yPosition);
        yPosition += 5;
        pdf.text(`Calculus Present: ${assessment.calculus_present ? 'Yes' : 'No'}`, 20, yPosition);
        yPosition += 5;
        
        if (assessment.plaque_index !== undefined) {
          pdf.text(`Plaque Index: ${assessment.plaque_index}/3`, 20, yPosition);
          yPosition += 5;
        }
        
        if (assessment.gingival_index !== undefined) {
          pdf.text(`Gingival Index: ${assessment.gingival_index}/3`, 20, yPosition);
          yPosition += 5;
        }

        if (assessment.general_notes) {
          yPosition += 3;
          const maxWidth = 170;
          const lines = pdf.splitTextToSize(`Notes: ${assessment.general_notes}`, maxWidth);
          pdf.text(lines, 20, yPosition);
          yPosition += lines.length * 5;
        }
      }

      // General Notes
      if (includeNotes && odontogram.general_notes) {
        // Check if we need a new page
        if (yPosition > 240) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('General Notes', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const maxWidth = 170;
        const lines = pdf.splitTextToSize(odontogram.general_notes, maxWidth);
        pdf.text(lines, 20, yPosition);
      }

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
          20,
          290
        );
      }

      // Save the PDF
      const filename = `dental-chart-${patientName.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

}

export default OdontogramExporter;
