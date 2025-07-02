
import React from "react";
import { motion } from "framer-motion";
import { FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import jsPDF from "jspdf";
import { useToast } from "@/components/ui/use-toast";

export default function PatientDataView({ patientId }) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [patientData, setPatientData] = React.useState(null);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [
        patientInfo,
        healthRecords,
        labTests,
        invoices
      ] = await Promise.all([
        supabase.from('patients').select('*').eq('id', patientId).single(),
        supabase.from('patient_health_records').select('*').eq('patient_id', patientId).order('recorded_at', { ascending: false }),
        supabase.from('patient_lab_tests').select('*, lab_tests(name)').eq('patient_id', patientId).order('test_date', { ascending: false }),
        supabase.from('invoices').select('*, payments(amount, payment_date, payment_method)').eq('payment_id', patientId).order('created_at', { ascending: false })
      ]);

      setPatientData({
        info: patientInfo.data,
        healthRecords: healthRecords.data || [],
        labTests: labTests.data || [],
        invoices: invoices.data || []
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patient data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!patientData) return;

    try {
      const doc = new jsPDF();
      let yPos = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 10;

      // Helper function to add text with page break check
      const addText = (text, y, fontSize = 12) => {
        if (y >= pageHeight - margin) {
          doc.addPage();
          return margin;
        }
        doc.setFontSize(fontSize);
        doc.text(text, margin, y);
        return y + lineHeight;
      };

      // Patient Information
      yPos = addText("Patient Information", yPos, 20);
      yPos += 5;
      yPos = addText(`Name: ${patientData.info.name}`, yPos);
      yPos = addText(`Gender: ${patientData.info.gender || 'N/A'}`, yPos);
      yPos = addText(`Blood Group: ${patientData.info.blood_group || 'N/A'}`, yPos);
      yPos = addText(`Birth Date: ${patientData.info.birth_date ? format(new Date(patientData.info.birth_date), 'MMM dd, yyyy') : 'N/A'}`, yPos);
      yPos = addText(`Contact: ${patientData.info.mobile || 'N/A'}`, yPos);
      yPos = addText(`Email: ${patientData.info.email || 'N/A'}`, yPos);
      yPos = addText(`Address: ${patientData.info.address || 'N/A'}`, yPos);

      // Health Records
      yPos += 10;
      yPos = addText("Health Records", yPos, 16);
      patientData.healthRecords.forEach((record) => {
        yPos += 5;
        yPos = addText(`Date: ${format(new Date(record.recorded_at), 'MMM dd, yyyy HH:mm')}`, yPos);
        yPos = addText(`Heart Rate: ${record.heart_rate || 'N/A'} bpm`, yPos);
        yPos = addText(`Blood Pressure: ${record.blood_pressure_systolic || 'N/A'}/${record.blood_pressure_diastolic || 'N/A'} mmHg`, yPos);
        yPos = addText(`Weight: ${record.weight || 'N/A'} kg`, yPos);
        yPos = addText(`Height: ${record.height || 'N/A'} cm`, yPos);
        if (record.bmi) yPos = addText(`BMI: ${record.bmi}`, yPos);
        yPos += 5;
      });

      // Lab Tests
      yPos += 10;
      yPos = addText("Lab Tests", yPos, 16);
      patientData.labTests.forEach((test) => {
        yPos += 5;
        yPos = addText(`Test: ${test.lab_tests?.name || 'N/A'}`, yPos);
        yPos = addText(`Date: ${test.test_date ? format(new Date(test.test_date), 'MMM dd, yyyy') : 'N/A'}`, yPos);
        yPos = addText(`Status: ${test.status || 'N/A'}`, yPos);
        if (test.notes) yPos = addText(`Notes: ${test.notes}`, yPos);
        yPos += 5;
      });

      // Invoices
      yPos += 10;
      yPos = addText("Payment History", yPos, 16);
      patientData.invoices.forEach((invoice) => {
        yPos += 5;
        yPos = addText(`Invoice: ${invoice.invoice_number}`, yPos);
        yPos = addText(`Amount: ₹${invoice.payments?.amount?.toFixed(2) || 'N/A'}`, yPos);
        yPos = addText(`Date: ${invoice.payments?.payment_date ? format(new Date(invoice.payments.payment_date), 'MMM dd, yyyy') : 'N/A'}`, yPos);
        yPos = addText(`Method: ${invoice.payments?.payment_method || 'N/A'}`, yPos);
        yPos += 5;
      });

      doc.save(`patient_complete_record_${patientData.info.id}.pdf`);

      toast({
        title: "Success",
        description: "Patient data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  return (
    <div className="space-y-4">
      <Button
        onClick={generatePDF}
        disabled={loading || !patientData}
        className="w-full"
      >
        <FileText className="mr-2 h-4 w-4" />
        Export Complete Record
      </Button>
    </div>
  );
}
