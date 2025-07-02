
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, FileText, Download, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { jsPDF } from "jspdf";

function PrescriptionForm({ prescription, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    patient_id: prescription?.patient_id || "",
    doctor_id: prescription?.doctor_id || "",
    prescription_date: prescription?.prescription_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    diagnosis: prescription?.diagnosis || "",
    symptoms: prescription?.symptoms || "",
    medicines: prescription?.medicines || [],
    notes: prescription?.notes || "",
    follow_up_date: prescription?.follow_up_date?.split('T')[0] || ""
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" }
  ]);

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    if (prescription?.medicines) {
      setMedicines(prescription.medicines);
    }
  }, [prescription]);

  const fetchPatients = async () => {
    const { data } = await supabase.from('patients').select('id, name');
    setPatients(data || []);
  };

  const fetchDoctors = async () => {
    const { data } = await supabase.from('doctors').select('id, name');
    setDoctors(data || []);
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
    setFormData({ ...formData, medicines: updatedMedicines });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, medicines });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{prescription ? "Edit" : "New"} Prescription</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                required
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Doctor</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.doctor_id}
                onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prescription Date</label>
              <Input
                type="date"
                value={formData.prescription_date}
                onChange={(e) => setFormData({ ...formData, prescription_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Follow-up Date</label>
              <Input
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Diagnosis</label>
              <Input
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Symptoms</label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                required
              />
            </div>

            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Medicines</label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddMedicine}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medicine
                </Button>
              </div>

              {medicines.map((medicine, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 border rounded-md p-4">
                  <Input
                    placeholder="Medicine Name"
                    value={medicine.name}
                    onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Dosage"
                    value={medicine.dosage}
                    onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Frequency"
                    value={medicine.frequency}
                    onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Duration"
                    value={medicine.duration}
                    onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                    required
                  />
                  <div className="col-span-2">
                    <Input
                      placeholder="Instructions"
                      value={medicine.instructions}
                      onChange={(e) => handleMedicineChange(index, "instructions", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {prescription ? "Update" : "Create"} Prescription
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Prescriptions() {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [patientMap, setPatientMap] = useState({});
  const [doctorMap, setDoctorMap] = useState({});

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch prescriptions",
        variant: "destructive",
      });
    }
  };

  const fetchPatients = async () => {
    const { data } = await supabase.from('patients').select('id, name');
    const mapping = {};
    data?.forEach(patient => {
      mapping[patient.id] = patient.name;
    });
    setPatientMap(mapping);
  };

  const fetchDoctors = async () => {
    const { data } = await supabase.from('doctors').select('id, name');
    const mapping = {};
    data?.forEach(doctor => {
      mapping[doctor.id] = doctor.name;
    });
    setDoctorMap(mapping);
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedPrescription) {
        const { error } = await supabase
          .from('prescriptions')
          .update(formData)
          .eq('id', selectedPrescription.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Prescription updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('prescriptions')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Prescription created successfully",
        });
      }

      setIsFormOpen(false);
      setSelectedPrescription(null);
      fetchPrescriptions();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generatePDF = async (prescription) => {
    try {
      const doc = new jsPDF();
      const patientName = patientMap[prescription.patient_id];
      const doctorName = doctorMap[prescription.doctor_id];

      // Header
      doc.setFontSize(20);
      doc.text("Ridi Hospital", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.text("Medical Prescription", 105, 30, { align: "center" });

      // Patient and Doctor Info
      doc.setFontSize(10);
      doc.text(`Patient: ${patientName}`, 20, 50);
      doc.text(`Doctor: ${doctorName}`, 20, 60);
      doc.text(`Date: ${format(new Date(prescription.prescription_date), 'MMM dd, yyyy')}`, 20, 70);

      // Diagnosis and Symptoms
      doc.setFontSize(12);
      doc.text("Diagnosis:", 20, 90);
      doc.setFontSize(10);
      doc.text(prescription.diagnosis, 30, 100);

      doc.setFontSize(12);
      doc.text("Symptoms:", 20, 120);
      doc.setFontSize(10);
      doc.text(prescription.symptoms, 30, 130);

      // Medicines
      doc.setFontSize(12);
      doc.text("Medicines:", 20, 150);
      let y = 160;
      prescription.medicines.forEach((medicine, index) => {
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${medicine.name}`, 30, y);
        doc.text(`   Dosage: ${medicine.dosage}`, 40, y + 5);
        doc.text(`   Frequency: ${medicine.frequency}`, 40, y + 10);
        doc.text(`   Duration: ${medicine.duration}`, 40, y + 15);
        doc.text(`   Instructions: ${medicine.instructions}`, 40, y + 20);
        y += 30;
      });

      // Notes and Follow-up
      if (prescription.notes) {
        doc.setFontSize(12);
        doc.text("Notes:", 20, y);
        doc.setFontSize(10);
        doc.text(prescription.notes, 30, y + 10);
        y += 20;
      }

      if (prescription.follow_up_date) {
        doc.setFontSize(12);
        doc.text("Follow-up Date:", 20, y);
        doc.setFontSize(10);
        doc.text(format(new Date(prescription.follow_up_date), 'MMM dd, yyyy'), 30, y + 10);
      }

      // Save the PDF
      doc.save(`prescription_${patientName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);

      toast({
        title: "Success",
        description: "Prescription downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription) =>
    patientMap[prescription.patient_id]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctorMap[prescription.doctor_id]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prescriptions</h1>
          <p className="mt-2 text-gray-600">Manage patient prescriptions</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Prescription
        </Button>
      </div>

      {isFormOpen && (
        <PrescriptionForm
          prescription={selectedPrescription}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedPrescription(null);
          }}
        />
      )}

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search prescriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-6">
        {filteredPrescriptions.map((prescription) => (
          <motion.div
            key={prescription.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Patient:</span>
                      <span className="ml-2 font-medium">{patientMap[prescription.patient_id]}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Doctor:</span>
                      <span className="ml-2">{doctorMap[prescription.doctor_id]}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        {format(new Date(prescription.prescription_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPrescription(prescription);
                        setIsFormOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generatePDF(prescription)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Prescriptions;
