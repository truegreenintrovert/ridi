
import React from "react";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";

export async function generateInvoice(payment, patient) {
  try {
    const doc = new jsPDF();
    const hospitalName = "Ridi Hospital";
    const hospitalAddress = "123 Healthcare Street, Medical District";
    const hospitalContact = "Phone: +1234567890 | Email: info@ridihospital.com";

    // Set font styles
    doc.setFont("helvetica", "normal");
    
    // Header
    doc.setFontSize(24);
    doc.text(hospitalName, 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(hospitalAddress, 105, 30, { align: "center" });
    doc.text(hospitalContact, 105, 40, { align: "center" });

    // Invoice details
    doc.setFontSize(16);
    doc.text("INVOICE", 20, 60);
    
    doc.setFontSize(12);
    doc.text(`Invoice Number: INV-${payment.id.toString().slice(0, 8)}`, 20, 70);
    doc.text(`Date: ${format(new Date(payment.payment_date || new Date()), 'MMM dd, yyyy')}`, 20, 80);

    // Patient details
    doc.text("Bill To:", 20, 100);
    doc.text(patient || "Patient Name Not Available", 20, 110);

    // Payment details
    doc.text("Payment Details", 20, 130);
    doc.line(20, 135, 190, 135);
    
    // Table headers
    doc.text("Description", 20, 145);
    doc.text("Amount", 160, 145);

    // Payment info
    doc.text("Medical Services", 20, 155);
    doc.text(`₹${payment.amount.toFixed(2)}`, 160, 155);

    // Total
    doc.line(20, 165, 190, 165);
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 120, 175);
    doc.text(`₹${payment.amount.toFixed(2)}`, 160, 175);

    // Payment method and status
    doc.setFont("helvetica", "normal");
    doc.text(`Payment Method: ${payment.payment_method?.toUpperCase() || 'N/A'}`, 20, 195);
    doc.text(`Status: ${payment.status?.toUpperCase() || 'N/A'}`, 20, 205);
    
    if (payment.payment_reference) {
      doc.text(`Reference: ${payment.payment_reference}`, 20, 215);
    }

    // Footer
    doc.setFontSize(10);
    doc.text("Thank you for choosing Ridi Hospital", 105, 280, { align: "center" });

    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

export async function saveInvoice(payment_id, pdf_url) {
  try {
    const invoice_number = `INV-${payment_id.toString().slice(0, 8)}`;
    
    const { data, error } = await supabase
      .from('invoices')
      .insert([
        {
          payment_id,
          invoice_number,
          pdf_url,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving invoice:', error);
    throw error;
  }
}

export function InvoiceButton({ payment, patient, onSuccess }) {
  const handleGenerateInvoice = async () => {
    try {
      const doc = await generateInvoice(payment, patient);
      
      // Save PDF to a blob
      const pdfBlob = doc.output('blob');
      
      // Generate a unique filename
      const filename = `invoice_${payment.id}_${Date.now()}.pdf`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase
        .storage
        .from('invoices')
        .upload(filename, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('invoices')
        .getPublicUrl(filename);

      // Save invoice record
      await saveInvoice(payment.id, publicUrl);

      // Trigger success callback
      if (onSuccess) onSuccess(publicUrl);

      // Open PDF in new tab
      window.open(publicUrl, '_blank');
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerateInvoice}
      className="flex items-center space-x-2"
    >
      <FileText className="h-4 w-4" />
      <span>Invoice</span>
    </Button>
  );
}
