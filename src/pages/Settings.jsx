
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Printer, Heart, Activity, Weight, Ruler, Thermometer } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import jsPDF from "jspdf";

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [patients, setPatients] = React.useState([]);
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [healthRecord, setHealthRecord] = React.useState({
    heart_rate: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    weight: "",
    height: "",
    temperature: "",
    oxygen_saturation: "",
    notes: ""
  });

  React.useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    }
  };

  const handlePatientSelect = async (patientId) => {
    try {
      const { data, error } = await supabase
        .from('patient_health_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const selectedPatientData = patients.find(p => p.id === patientId);
      setSelectedPatient(selectedPatientData);

      if (data) {
        setHealthRecord({
          heart_rate: data.heart_rate || "",
          blood_pressure_systolic: data.blood_pressure_systolic || "",
          blood_pressure_diastolic: data.blood_pressure_diastolic || "",
          weight: data.weight || "",
          height: data.height || "",
          temperature: data.temperature || "",
          oxygen_saturation: data.oxygen_saturation || "",
          notes: data.notes || ""
        });
      } else {
        setHealthRecord({
          heart_rate: "",
          blood_pressure_systolic: "",
          blood_pressure_diastolic: "",
          weight: "",
          height: "",
          temperature: "",
          oxygen_saturation: "",
          notes: ""
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patient health record",
        variant: "destructive",
      });
    }
  };

  const handleHealthRecordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('patient_health_records')
        .insert({
          patient_id: selectedPatient.id,
          ...healthRecord,
          bmi: (healthRecord.weight / ((healthRecord.height / 100) ** 2)).toFixed(2)
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Health record updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update health record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintProfile = async () => {
    if (!selectedPatient) return;

    try {
      const { data: healthRecords, error: healthRecordsError } = await supabase
        .from('patient_health_records')
        .select('*')
        .eq('patient_id', selectedPatient.id)
        .order('recorded_at', { ascending: false })
        .limit(5);

      if (healthRecordsError) throw healthRecordsError;

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text("Patient Profile", 20, 20);
      
      // Patient Information
      doc.setFontSize(12);
      doc.text(`Name: ${selectedPatient.name}`, 20, 40);
      doc.text(`Gender: ${selectedPatient.gender || 'N/A'}`, 20, 50);
      doc.text(`Blood Group: ${selectedPatient.blood_group || 'N/A'}`, 20, 60);
      doc.text(`Date of Birth: ${selectedPatient.birth_date ? format(new Date(selectedPatient.birth_date), 'MMM dd, yyyy') : 'N/A'}`, 20, 70);
      doc.text(`Contact: ${selectedPatient.mobile || 'N/A'}`, 20, 80);
      doc.text(`Email: ${selectedPatient.email || 'N/A'}`, 20, 90);
      doc.text(`Emergency Contact: ${selectedPatient.emergency_contact || 'N/A'}`, 20, 100);
      
      // Latest Health Records
      if (healthRecords && healthRecords.length > 0) {
        doc.text("Latest Health Records", 20, 120);
        const latest = healthRecords[0];
        doc.text(`Heart Rate: ${latest.heart_rate || 'N/A'} bpm`, 20, 130);
        doc.text(`Blood Pressure: ${latest.blood_pressure_systolic || 'N/A'}/${latest.blood_pressure_diastolic || 'N/A'} mmHg`, 20, 140);
        doc.text(`Weight: ${latest.weight || 'N/A'} kg`, 20, 150);
        doc.text(`Height: ${latest.height || 'N/A'} cm`, 20, 160);
        doc.text(`Temperature: ${latest.temperature || 'N/A'} °C`, 20, 170);
        doc.text(`Oxygen Saturation: ${latest.oxygen_saturation || 'N/A'}%`, 20, 180);
        doc.text(`BMI: ${latest.bmi || 'N/A'}`, 20, 190);
      }

      // Medical History
      doc.text("Medical History", 20, 210);
      doc.text(selectedPatient.medical_history || 'No medical history available', 20, 220);

      doc.save(`patient_profile_${selectedPatient.id}.pdf`);

      toast({
        title: "Success",
        description: "Patient profile downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate patient profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-2 text-gray-600">Manage patient health records and system settings</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Selection</CardTitle>
            <CardDescription>Select a patient to manage their health records</CardDescription>
          </CardHeader>
          <CardContent>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              onChange={(e) => handlePatientSelect(e.target.value)}
              value={selectedPatient?.id || ""}
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>

            {selectedPatient && (
              <Button
                className="mt-4"
                onClick={handlePrintProfile}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Profile
              </Button>
            )}
          </CardContent>
        </Card>

        {selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle>Health Records</CardTitle>
              <CardDescription>Update health measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleHealthRecordSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Heart Rate (bpm)</Label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="number"
                        className="pl-9"
                        value={healthRecord.heart_rate}
                        onChange={(e) => setHealthRecord({ ...healthRecord, heart_rate: e.target.value })}
                        placeholder="Enter heart rate"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Blood Pressure (mmHg)</Label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Activity className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          className="pl-9"
                          value={healthRecord.blood_pressure_systolic}
                          onChange={(e) => setHealthRecord({ ...healthRecord, blood_pressure_systolic: e.target.value })}
                          placeholder="Systolic"
                        />
                      </div>
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          value={healthRecord.blood_pressure_diastolic}
                          onChange={(e) => setHealthRecord({ ...healthRecord, blood_pressure_diastolic: e.target.value })}
                          placeholder="Diastolic"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <div className="relative">
                      <Weight className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="number"
                        step="0.1"
                        className="pl-9"
                        value={healthRecord.weight}
                        onChange={(e) => setHealthRecord({ ...healthRecord, weight: e.target.value })}
                        placeholder="Enter weight"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Height (cm)</Label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="number"
                        className="pl-9"
                        value={healthRecord.height}
                        onChange={(e) => setHealthRecord({ ...healthRecord, height: e.target.value })}
                        placeholder="Enter height"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Temperature (°C)</Label>
                    <div className="relative">
                      <Thermometer className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="number"
                        step="0.1"
                        className="pl-9"
                        value={healthRecord.temperature}
                        onChange={(e) => setHealthRecord({ ...healthRecord, temperature: e.target.value })}
                        placeholder="Enter temperature"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Oxygen Saturation (%)</Label>
                    <div className="relative">
                      <Activity className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="number"
                        className="pl-9"
                        value={healthRecord.oxygen_saturation}
                        onChange={(e) => setHealthRecord({ ...healthRecord, oxygen_saturation: e.target.value })}
                        placeholder="Enter SpO2"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    rows={3}
                    value={healthRecord.notes}
                    onChange={(e) => setHealthRecord({ ...healthRecord, notes: e.target.value })}
                    placeholder="Add any additional notes"
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Health Record"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
