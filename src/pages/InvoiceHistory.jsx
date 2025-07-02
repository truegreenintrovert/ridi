
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [patientMap, setPatientMap] = useState({});

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          payments (
            id,
            amount,
            patient_id,
            payment_date,
            payment_method,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;
      setInvoices(invoicesData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name');

      if (error) throw error;

      const patientMapping = {};
      data?.forEach(patient => {
        patientMapping[patient.id] = patient.name;
      });
      setPatientMap(patientMapping);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
  };

  const filteredInvoices = invoices.filter(invoice => {
    const patientName = patientMap[invoice.payments?.patient_id] || '';
    const searchString = searchQuery.toLowerCase();
    return (
      invoice.invoice_number.toLowerCase().includes(searchString) ||
      patientName.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoice History</h1>
          <p className="mt-2 text-gray-600">View and download all invoices</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Loading invoices...</p>
        ) : (
          filteredInvoices.map((invoice) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">{invoice.invoice_number}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(invoice.pdf_url)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>

                    {invoice.payments && (
                      <>
                        <div>
                          <span className="text-sm text-gray-500">Patient:</span>
                          <span className="ml-2">
                            {patientMap[invoice.payments.patient_id]}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Amount:</span>
                          <span className="ml-2">₹{invoice.payments.amount.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Payment Method:</span>
                          <span className="ml-2 capitalize">
                            {invoice.payments.payment_method}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default InvoiceHistory;
