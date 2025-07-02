
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Calendar, Clock, User, UserX as UserMd } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

function AppointmentForm({ appointment, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    patient_id: appointment?.patient_id || "",
    doctor_id: appointment?.doctor_id || "",
    appointment_date: appointment?.appointment_date?.split('T')[0] || "",
    appointment_time: appointment?.appointment_time || "",
    type: appointment?.type || "consultation",
    notes: appointment?.notes || "",
    status: appointment?.status || "scheduled"
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientsAndDoctors();
  }, []);

  const fetchPatientsAndDoctors = async () => {
    try {
      const [patientsResponse, doctorsResponse] = await Promise.all([
        supabase.from('patients').select('id, name'),
        supabase.from('doctors').select('id, name')
      ]);

      if (patientsResponse.error) throw patientsResponse.error;
      if (doctorsResponse.error) throw doctorsResponse.error;

      setPatients(patientsResponse.data);
      setDoctors(doctorsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Patient</label>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={formData.patient_id}
          onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
          required
        >
          <option value="">Select Patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Doctor</label>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={formData.doctor_id}
          onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
          required
        >
          <option value="">Select Doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Input
          type="date"
          value={formData.appointment_date}
          onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Time</label>
        <Input
          type="time"
          value={formData.appointment_time}
          onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          required
        >
          <option value="consultation">Consultation</option>
          <option value="follow_up">Follow Up</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <textarea
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          required
        >
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {appointment ? "Update" : "Create"} Appointment
        </Button>
      </div>
    </form>
  );
}

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [patientMap, setPatientMap] = useState({});
  const [doctorMap, setDoctorMap] = useState({});

  useEffect(() => {
    fetchAppointments();
    fetchPatientsAndDoctors();
  }, []);

  const fetchPatientsAndDoctors = async () => {
    try {
      const [patientsResponse, doctorsResponse] = await Promise.all([
        supabase.from('patients').select('id, name'),
        supabase.from('doctors').select('id, name')
      ]);

      if (patientsResponse.error) throw patientsResponse.error;
      if (doctorsResponse.error) throw doctorsResponse.error;

      const patientMapping = {};
      const doctorMapping = {};

      patientsResponse.data.forEach(patient => {
        patientMapping[patient.id] = patient.name;
      });

      doctorsResponse.data.forEach(doctor => {
        doctorMapping[doctor.id] = doctor.name;
      });

      setPatientMap(patientMapping);
      setDoctorMap(doctorMapping);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true });

      if (error) throw error;
      setAppointments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedAppointment) {
        const { error } = await supabase
          .from("appointments")
          .update(formData)
          .eq("id", selectedAppointment.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Appointment updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("appointments")
          .insert([formData]);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Appointment created successfully",
        });
      }

      setIsFormOpen(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      no_show: "bg-yellow-100 text-yellow-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredAppointments = appointments.filter((appointment) =>
    patientMap[appointment.patient_id]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctorMap[appointment.doctor_id]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="mt-2 text-gray-600">Manage patient appointments</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search appointments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedAppointment ? "Edit" : "New"} Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentForm
              appointment={selectedAppointment}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedAppointment(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Loading appointments...</p>
        ) : (
          filteredAppointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setIsFormOpen(true);
                }}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {new Date(appointment.appointment_date).toLocaleDateString()}
                        </span>
                        <Clock className="h-4 w-4 text-gray-500 ml-2" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{patientMap[appointment.patient_id]}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UserMd className="h-4 w-4 text-gray-500" />
                        <span>{doctorMap[appointment.doctor_id]}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Type: <span className="capitalize">{appointment.type}</span>
                    </p>
                    {appointment.notes && (
                      <p className="mt-2 text-sm text-gray-600">
                        Notes: {appointment.notes}
                      </p>
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

export default Appointments;
