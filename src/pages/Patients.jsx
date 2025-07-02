
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Users, Calendar, ChevronDown, Plus, Edit, Trash, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import PatientForm from "@/components/PatientForm";

function PatientStats({ totalPatients }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg bg-card p-6 shadow-lg"
      >
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Total Patients</h3>
        </div>
        <p className="mt-2 text-2xl font-bold">{totalPatients}</p>
      </motion.div>
    </div>
  );
}

function Patients() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });

      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
    }
  };

  const handleAddPatient = () => {
    setIsFormOpen(true);
    // Wait for the form to be rendered
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.mobile && patient.mobile.includes(searchTerm))
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Button onClick={handleAddPatient}>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <PatientStats totalPatients={patients.length} />

      <div className="rounded-lg bg-card p-6 shadow-lg">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-4 text-left font-semibold text-card-foreground">Serial No.</th>
                <th className="pb-4 text-left font-semibold text-card-foreground">Patient Name</th>
                <th className="pb-4 text-left font-semibold text-card-foreground">Created At</th>
                <th className="pb-4 text-left font-semibold text-card-foreground">Gender</th>
                <th className="pb-4 text-left font-semibold text-card-foreground">Blood Group</th>
                <th className="pb-4 text-left font-semibold text-card-foreground">Mobile</th>
                <th className="pb-4 text-left font-semibold text-card-foreground">Birth Date</th>
                <th className="pb-4 text-left font-semibold text-card-foreground">Address</th>
                <th className="pb-4 text-left font-semibold text-card-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="text-card-foreground">
              {filteredPatients.map((patient, index) => (
                <tr key={patient.id} className="border-b border-border">
                  <td className="py-4">{index + 1}</td>
                  <td className="py-4">{patient.name}</td>
                  <td className="py-4">
                    {patient.created_at ? format(new Date(patient.created_at), 'MMM dd, yyyy') : '-'}
                  </td>
                  <td className="py-4">{patient.gender || '-'}</td>
                  <td className="py-4">{patient.blood_group || '-'}</td>
                  <td className="py-4">{patient.mobile || '-'}</td>
                  <td className="py-4">
                    {patient.birth_date ? format(new Date(patient.birth_date), 'MMM dd, yyyy') : '-'}
                  </td>
                  <td className="py-4">{patient.address || '-'}</td>
                  <td className="py-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setIsFormOpen(true);
                          setTimeout(() => {
                            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(patient.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div ref={formRef}>
          <PatientForm
            patient={selectedPatient}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedPatient(null);
            }}
            onSuccess={() => {
              setIsFormOpen(false);
              setSelectedPatient(null);
              fetchPatients();
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Patients;
