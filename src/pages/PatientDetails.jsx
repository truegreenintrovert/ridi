
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import { FileText } from "lucide-react";

function PatientDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [patient, setPatient] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      // Fetch patient details
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch health records
      const { data: healthData, error: healthError } = await supabase
        .from('patient_health_records')
        .select('*')
        .eq('patient_id', id)
        .order('recorded_at', { ascending: false });

      if (healthError) throw healthError;
      setHealthRecords(healthData || []);

      // Fetch prescriptions
      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          doctors (
            name,
            specialization
          )
        `)
        .eq('patient_id', id)
        .order('prescription_date', { ascending: false });

      if (prescriptionError) throw prescriptionError;
      setPrescriptions(prescriptionData || []);

      // Fetch lab tests
      const { data: labData, error: labError } = await supabase
        .from('patient_lab_tests')
        .select(`
          *,
          lab_tests (
            name,
            description
          ),
          doctors (
            name
          )
        `)
        .eq('patient_id', id)
        .order('test_date', { ascending: false });

      if (labError) throw labError;
      setLabTests(labData || []);

    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch patient data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text("Patient Medical Report", 105, 20, { align: "center" });
      
      // Patient Information
      doc.setFontSize(14);
      doc.text("Patient Information", 20, 40);
      doc.setFontSize(12);
      doc.text(`Name: ${patient.name}`, 20, 50);
      doc.text(`Gender: ${patient.gender || 'N/A'}`, 20, 60);
      doc.text(`Blood Group: ${patient.blood_group || 'N/A'}`, 20, 70);
      doc.text(`Mobile: ${patient.mobile || 'N/A'}`, 20, 80);
      doc.text(`Address: ${patient.address || 'N/A'}`, 20, 90);

      // Latest Health Record
      if (healthRecords.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Latest Health Record", 20, 20);
        doc.setFontSize(12);
        const latestRecord = healthRecords[0];
        doc.text(`Date: ${format(new Date(latestRecord.recorded_at), 'MMM dd, yyyy')}`, 20, 30);
        doc.text(`Blood Pressure: ${latestRecord.blood_pressure_systolic}/${latestRecord.blood_pressure_diastolic}`, 20, 40);
        doc.text(`Heart Rate: ${latestRecord.heart_rate || 'N/A'}`, 20, 50);
        doc.text(`Temperature: ${latestRecord.temperature || 'N/A'}°C`, 20, 60);
        doc.text(`Weight: ${latestRecord.weight || 'N/A'} kg`, 20, 70);
        doc.text(`Height: ${latestRecord.height || 'N/A'} cm`, 20, 80);
        doc.text(`BMI: ${latestRecord.bmi || 'N/A'}`, 20, 90);
        doc.text(`Notes: ${latestRecord.notes || 'N/A'}`, 20, 100);
      }

      // Latest Prescription
      if (prescriptions.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Latest Prescription", 20, 20);
        doc.setFontSize(12);
        const latestPrescription = prescriptions[0];
        doc.text(`Date: ${format(new Date(latestPrescription.prescription_date), 'MMM dd, yyyy')}`, 20, 30);
        doc.text(`Doctor: ${latestPrescription.doctors?.name || 'N/A'}`, 20, 40);
        doc.text(`Diagnosis: ${latestPrescription.diagnosis || 'N/A'}`, 20, 50);
        doc.text(`Symptoms: ${latestPrescription.symptoms || 'N/A'}`, 20, 60);
        doc.text("Medicines:", 20, 70);
        const medicines = latestPrescription.medicines || [];
        medicines.forEach((medicine, index) => {
          doc.text(`${index + 1}. ${medicine.name} - ${medicine.dosage}`, 30, 80 + (index * 10));
        });
      }

      // Latest Lab Test
      if (labTests.length > 0) {
        const latestTest = labTests[0];
        doc.text("Latest Lab Test", 110, 20);
        doc.text(`Test: ${latestTest.lab_tests?.name || 'N/A'}`, 110, 30);
        doc.text(`Date: ${latestTest.test_date ? format(new Date(latestTest.test_date), 'MMM dd, yyyy') : 'N/A'}`, 110, 40);
        doc.text(`Status: ${latestTest.status || 'N/A'}`, 110, 50);
        doc.text(`Notes: ${latestTest.notes || 'N/A'}`, 110, 60);
      }

      // Save the PDF
      doc.save(`patient_report_${patient.name}_${Date.now()}.pdf`);

      toast({
        title: "Success",
        description: "Patient report generated successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate patient report",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{patient.name}</h1>
          <p className="text-muted-foreground">Patient Details</p>
        </div>
        <Button onClick={handlePrint}>
          <FileText className="mr-2 h-4 w-4" />
          Print Report
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health Records</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="lab">Lab Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Gender</label>
                  <p>{patient.gender || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Blood Group</label>
                  <p>{patient.blood_group || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Mobile</label>
                  <p>{patient.mobile || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p>{patient.email || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Birth Date</label>
                  <p>{patient.birth_date ? format(new Date(patient.birth_date), 'MMM dd, yyyy') : 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Emergency Contact</label>
                  <p>{patient.emergency_contact || 'Not specified'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <p>{patient.address || 'Not specified'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Medical History</label>
                  <p>{patient.medical_history || 'No medical history recorded'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <div className="space-y-4">
            {healthRecords.map((record) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Health Record - {format(new Date(record.recorded_at), 'MMM dd, yyyy')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="text-sm font-medium">Blood Pressure</label>
                        <p>{record.blood_pressure_systolic}/{record.blood_pressure_diastolic} mmHg</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Heart Rate</label>
                        <p>{record.heart_rate || 'N/A'} bpm</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Temperature</label>
                        <p>{record.temperature || 'N/A'}°C</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Weight</label>
                        <p>{record.weight || 'N/A'} kg</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Height</label>
                        <p>{record.height || 'N/A'} cm</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">BMI</label>
                        <p>{record.bmi || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-sm font-medium">Notes</label>
                        <p>{record.notes || 'No notes'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prescriptions">
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <motion.div
                key={prescription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Prescription - {format(new Date(prescription.prescription_date), 'MMM dd, yyyy')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Doctor</label>
                        <p>{prescription.doctors?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Diagnosis</label>
                        <p>{prescription.diagnosis || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Symptoms</label>
                        <p>{prescription.symptoms || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Medicines</label>
                        <div className="mt-2 space-y-2">
                          {(prescription.medicines || []).map((medicine, index) => (
                            <div key={index} className="rounded-lg bg-accent p-3">
                              <p className="font-medium">{medicine.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {medicine.dosage} - {medicine.frequency}
                              </p>
                              {medicine.instructions && (
                                <p className="mt-1 text-sm">{medicine.instructions}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      {prescription.notes && (
                        <div>
                          <label className="text-sm font-medium">Notes</label>
                          <p>{prescription.notes}</p>
                        </div>
                      )}
                      {prescription.follow_up_date && (
                        <div>
                          <label className="text-sm font-medium">Follow-up Date</label>
                          <p>{format(new Date(prescription.follow_up_date), 'MMM dd, yyyy')}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lab">
          <div className="space-y-4">
            {labTests.map((test) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {test.lab_tests?.name} - {test.test_date ? format(new Date(test.test_date), 'MMM dd, yyyy') : 'Date not set'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Doctor</label>
                        <p>{test.doctors?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <p>{test.status || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <p>{test.lab_tests?.description || 'N/A'}</p>
                      </div>
                      {test.notes && (
                        <div>
                          <label className="text-sm font-medium">Notes</label>
                          <p>{test.notes}</p>
                        </div>
                      )}
                      {test.report_url && (
                        <div>
                          <Button
                            variant="outline"
                            onClick={() => window.open(test.report_url, '_blank')}
                          >
                            View Report
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PatientDetails;
