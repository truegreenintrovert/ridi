
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

function PaymentForm({ payment, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    patient_id: payment?.patient_id || "",
    amount: payment?.amount || "",
    payment_method: payment?.payment_method || "cash",
    payment_reference: payment?.payment_reference || "",
    payment_notes: payment?.payment_notes || "",
    status: payment?.status || "pending"
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatientMobile, setSelectedPatientMobile] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, mobile');
      
      if (error) throw error;
      setPatients(data || []);

      // Set initial mobile number if payment exists
      if (payment?.patient_id) {
        const patient = data?.find(p => p.id === payment.patient_id);
        setSelectedPatientMobile(patient?.mobile || "");
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handlePatientChange = (patientId) => {
    setFormData({ ...formData, patient_id: patientId });
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatientMobile(patient?.mobile || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        payment_date: new Date().toISOString(),
        amount: parseFloat(formData.amount)
      });
      setLoading(false);
    } catch (error) {
      console.error('Error submitting payment:', error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label>Patient</Label>
          <Select
            value={formData.patient_id}
            onValueChange={handlePatientChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name} {patient.mobile ? `(${patient.mobile})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPatientMobile && (
          <div>
            <Label>Patient Mobile</Label>
            <Input
              value={selectedPatientMobile}
              disabled
              className="bg-gray-50"
            />
          </div>
        )}
      </div>

      <div>
        <Label>Amount</Label>
        <Input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="Enter amount"
          required
        />
      </div>

      <div>
        <Label>Payment Method</Label>
        <Select
          value={formData.payment_method}
          onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Reference Number</Label>
        <Input
          value={formData.payment_reference}
          onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
          placeholder="Enter reference number (optional)"
        />
      </div>

      <div>
        <Label>Notes</Label>
        <Input
          value={formData.payment_notes}
          onChange={(e) => setFormData({ ...formData, payment_notes: e.target.value })}
          placeholder="Add payment notes (optional)"
        />
      </div>

      <div>
        <Label>Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : payment ? "Update Payment" : "Create Payment"}
        </Button>
      </div>
    </form>
  );
}

export default PaymentForm;
