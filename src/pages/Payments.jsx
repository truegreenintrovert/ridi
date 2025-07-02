
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, DollarSign, Calendar, CreditCard, Wallet as Cash, Edit, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { InvoiceButton } from "@/components/Invoice";
import PaymentStats from "@/components/PaymentStats";
import PaymentForm from "@/components/PaymentForm";

function getPaymentMethodIcon(method) {
  switch (method) {
    case 'cash':
      return Cash;
    case 'card':
    case 'online':
      return CreditCard;
    default:
      return DollarSign;
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-300';
    case 'failed':
      return 'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300';
    default:
      return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-300';
  }
}

function Payments() {
  const [payments, setPayments] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [patientMap, setPatientMap] = useState({});
  const [stats, setStats] = useState({
    totalPayments: 0,
    pendingAmount: 0,
    completedAmount: 0,
    cashPayments: 0,
    onlinePayments: 0
  });

  useEffect(() => {
    fetchPayments();
    fetchPatients();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPayments(data || []);
      calculateStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
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

  const calculateStats = (paymentsData) => {
    const newStats = {
      totalPayments: paymentsData.length,
      pendingAmount: 0,
      completedAmount: 0,
      cashPayments: 0,
      onlinePayments: 0
    };

    paymentsData.forEach(payment => {
      if (payment.status === 'completed') {
        newStats.completedAmount += payment.amount;
      } else if (payment.status === 'pending') {
        newStats.pendingAmount += payment.amount;
      }

      if (payment.payment_method === 'cash') {
        newStats.cashPayments++;
      } else if (payment.payment_method === 'online') {
        newStats.onlinePayments++;
      }
    });

    setStats(newStats);
  };

  const handleSubmit = async (formData) => {
    try {
      let result;
      if (selectedPayment) {
        const { data, error } = await supabase
          .from('payments')
          .update(formData)
          .eq('id', selectedPayment.id)
          .select()
          .single();

        if (error) throw error;
        result = data;

        toast({
          title: "Success",
          description: "Payment updated successfully",
        });
      } else {
        const { data, error } = await supabase
          .from('payments')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        result = data;

        toast({
          title: "Success",
          description: "Payment created successfully",
        });
      }

      setIsFormOpen(false);
      setSelectedPayment(null);
      fetchPayments();
    } catch (error) {
      console.error('Error saving payment:', error);
      toast({
        title: "Error",
        description: "Failed to save payment",
        variant: "destructive",
      });
    }
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setIsFormOpen(true);
  };

  const handleQuickStatusUpdate = async (payment, newStatus) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('id', payment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Payment status updated to ${newStatus}`,
      });

      fetchPayments();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const filteredPayments = payments.filter(payment => {
    const patientName = patientMap[payment.patient_id] || '';
    const searchString = searchQuery.toLowerCase();
    return (
      patientName.toLowerCase().includes(searchString) ||
      payment.payment_reference?.toLowerCase().includes(searchString) ||
      payment.status.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Payments</h1>
          <p className="mt-2 text-muted-foreground">Manage patient payments</p>
        </div>
        <Button onClick={() => {
          setSelectedPayment(null);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          New Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <PaymentStats
          icon={DollarSign}
          label="Total Payments"
          value={stats.totalPayments}
          color="bg-blue-500"
        />
        <PaymentStats
          icon={Cash}
          label="Cash Payments"
          value={stats.cashPayments}
          color="bg-green-500"
        />
        <PaymentStats
          icon={CreditCard}
          label="Online Payments"
          value={stats.onlinePayments}
          color="bg-purple-500"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search payments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">
              {selectedPayment ? "Edit" : "New"} Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentForm
              payment={selectedPayment}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedPayment(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-card-foreground">Loading payments...</p>
        ) : (
          filteredPayments.map((payment) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-card-foreground">
                          {payment.payment_date ? format(new Date(payment.payment_date), 'MMM dd, yyyy') : 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-card-foreground">₹{payment.amount.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Patient:</span>
                        <span className="ml-2 text-card-foreground">{patientMap[payment.patient_id]}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {React.createElement(getPaymentMethodIcon(payment.payment_method), {
                          className: "h-4 w-4 text-muted-foreground"
                        })}
                        <span className="capitalize text-card-foreground">{payment.payment_method}</span>
                      </div>
                      {payment.payment_reference && (
                        <div className="text-sm text-muted-foreground">
                          Ref: {payment.payment_reference}
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickStatusUpdate(payment, payment.status === 'pending' ? 'completed' : 'pending')}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPayment(payment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {payment.status === 'completed' && (
                            <InvoiceButton
                              payment={payment}
                              patient={patientMap[payment.patient_id]}
                              onSuccess={(url) => {
                                toast({
                                  title: "Success",
                                  description: "Invoice generated successfully",
                                });
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
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

export default Payments;
