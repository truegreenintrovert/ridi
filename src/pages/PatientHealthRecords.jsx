
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Activity, Weight, Ruler, Thermometer, Printer, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import jsPDF from "jspdf";
import HealthRecordHistory from "@/components/HealthRecordHistory";
import PatientSearch from "@/components/PatientSearch";

export default function PatientHealthRecords() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [patients, setPatients] = React.useState([]);
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [healthRecords, setHealthRecords] = React.useState([]);
  const [healthRecord, setHealthRecord] = React.useState({
    heart_rate: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    weight: "",
    height: "",
    temperature: "",
    oxygen_saturation: "",
    notes: "",
    recorded_at: format(new Date(), "yyyy-MM-dd'T'HH:mm")
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

  const fetchHealthRecords = async (patientId) => {
    try {
      const { data, error } = await supabase
        .from('patient_health_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      setHealthRecords(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch health records",
        variant: "destructive",
      });
    }
  };

  const handlePatientSelect = async (patientId) => {
    try {
      const selectedPatientData = patients.find(p => p.id === patientId);
      setSelectedPatient(selectedPatientData);
      
      if (selectedPatientData) {
        await fetchHealthRecords(patientId);
        
        setHealthRecord({
          heart_rate: "",
          blood_pressure_systolic: "",
          blood_pressure_diastolic: "",
          weight: "",
          height: "",
          temperature: "",
          oxygen_saturation: "",
          notes: "",
          recorded_at: format(new Date(), "yyyy-MM-dd'T'HH:mm")
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patient data",
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
          bmi: healthRecord.weight && healthRecord.height ? 
            (healthRecord.weight / ((healthRecord.height / 100) ** 2)).toFixed(2) : null,
          recorded_at: healthRecord.recorded_at
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Health record saved successfully",
      });

      await fetchHealthRecords(selectedPatient.id);

      setHealthRecord({
        ...healthRecord,
        heart_rate: "",
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        weight: "",
        height: "",
        temperature: "",
        oxygen_saturation: "",
        notes: "",
        recorded_at: format(new Date(), "yyyy-MM-dd'T'HH:mm")
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save health record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintProfile = async () => {
    if (!selectedPatient) return;

    try {
      const doc = new jsPDF();
      let yPos = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 10;

      // Helper function to add text with page break check
      const addText = (text, y) => {
        if (y >= pageHeight - margin) {
          doc.addPage();
          return margin;
        }
        doc.text(text, margin, y);
        return y + lineHeight;
      };

      // Header
      doc.setFontSize(20);
      yPos = addText("Patient Health Record", yPos);
      
      // Patient Information
      doc.setFontSize(12);
      yPos += 10;
      yPos = addText(`Name: ${selectedPatient.name}`, yPos);
      yPos = addText(`Gender: ${selectedPatient.gender || 'N/A'}`, yPos);
      yPos = addText(`Blood Group: ${selectedPatient.blood_group || 'N/A'}`, yPos);
      yPos = addText(`Date of Birth: ${selectedPatient.birth_date ? format(new Date(selectedPatient.birth_date), 'MMM dd, yyyy') : 'N/A'}`, yPos);
      yPos = addText(`Contact: ${selectedPatient.mobile || 'N/A'}`, yPos);
      yPos = addText(`Email: ${selectedPatient.email || 'N/A'}`, yPos);
      yPos = addText(`Emergency Contact: ${selectedPatient.emergency_contact || 'N/A'}`, yPos);
      
      // Health Records History
      if (healthRecords.length > 0) {
        yPos += 10;
        doc.setFontSize(16);
        yPos = addText("Health Records History", yPos);
        doc.setFontSize(12);
        
        healthRecords.forEach((record, index) => {
          yPos += 5;
          yPos = addText(`Record ${index + 1} - ${format(new Date(record.recorded_at), 'MMM dd, yyyy HH:mm')}`, yPos);
          yPos = addText(`Heart Rate: ${record.heart_rate || 'N/A'} bpm`, yPos);
          yPos = addText(`Blood Pressure: ${record.blood_pressure_systolic || 'N/A'}/${record.blood_pressure_diastolic || 'N/A'} mmHg`, yPos);
          yPos = addText(`Weight: ${record.weight || 'N/A'} kg`, yPos);
          yPos = addText(`Height: ${record.height || 'N/A'} cm`, yPos);
          yPos = addText(`Temperature: ${record.temperature || 'N/A'} °C`, yPos);
          yPos = addText(`Oxygen Saturation: ${record.oxygen_saturation || 'N/A'}%`, yPos);
          if (record.bmi) {
            yPos = addText(`BMI: ${record.bmi}`, yPos);
          }
          if (record.notes) {
            yPos = addText(`Notes: ${record.notes}`, yPos);
          }
          yPos += 5;
        });
      }

      doc.save(`patient_health_record_${selectedPatient.id}.pdf`);

      toast({
        title: "Success",
        description: "Health record downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate health record",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patient Health Records</h1>
          <p className="mt-2 text-gray-600">Manage and track patient health measurements</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Selection</CardTitle>
            <CardDescription>Search and select a patient to manage their health records</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientSearch
              patients={patients}
              onSelect={handlePatientSelect}
              selectedPatient={selectedPatient}
            />

            {selectedPatient && (
              <div className="mt-4">
                <div className="mb-4">
                  <h3 className="font-medium">Selected Patient:</h3>
                  <p className="text-gray-600">{selectedPatient.name} - {selectedPatient.mobile || "No mobile number"}</p>
                </div>
                <Button
                  onClick={handlePrintProfile}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Health Record
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedPatient && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>New Health Record</CardTitle>
                <CardDescription>Add new health measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleHealthRecordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Record Date and Time</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="datetime-local"
                        className="pl-9"
                        value={healthRecord.recorded_at}
                        onChange={(e) => setHealthRecord({ ...healthRecord, recorded_at: e.target.value })}
                      />
                    </div>
                  </div>

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

            <HealthRecordHistory records={healthRecords} />
          </div>
        )}
      </div>
    </div>
  );
}
