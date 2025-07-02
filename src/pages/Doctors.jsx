
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

function DoctorForm({ doctor, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: doctor?.name || "",
    email: doctor?.email || "",
    mobile: doctor?.mobile || "",
    specialization: doctor?.specialization || "",
    qualification: doctor?.qualification || "",
    experience: doctor?.experience || "",
    consultation_fee: doctor?.consultation_fee || "",
    bio: doctor?.bio || "",
    available_days: doctor?.available_days || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <Input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <Input
        placeholder="Mobile"
        value={formData.mobile}
        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
        required
      />
      <Input
        placeholder="Specialization"
        value={formData.specialization}
        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
        required
      />
      <Input
        placeholder="Qualification"
        value={formData.qualification}
        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
        required
      />
      <Input
        type="number"
        placeholder="Experience (years)"
        value={formData.experience}
        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
        required
      />
      <Input
        type="number"
        placeholder="Consultation Fee"
        value={formData.consultation_fee}
        onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
        required
      />
      <Input
        placeholder="Available Days (e.g., Mon,Tue,Wed)"
        value={formData.available_days}
        onChange={(e) => setFormData({ ...formData, available_days: e.target.value })}
        required
      />
      <textarea
        className="w-full rounded-md border p-2"
        placeholder="Bio"
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        rows={4}
      />
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{doctor ? "Update" : "Add"} Doctor</Button>
      </div>
    </form>
  );
}

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { userRole } = useAuth();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDoctors(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch doctors",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedDoctor) {
        const { error } = await supabase
          .from("doctors")
          .update(formData)
          .eq("id", selectedDoctor.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Doctor updated successfully",
        });
      } else {
        const { error } = await supabase.from("doctors").insert([formData]);
        if (error) throw error;
        toast({
          title: "Success",
          description: "Doctor added successfully",
        });
      }

      setIsFormOpen(false);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from("doctors").delete().eq("id", id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      });
      fetchDoctors();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Doctors</h1>
          <p className="mt-2 text-gray-600">
            {isAdmin ? "Manage hospital doctors" : "View hospital doctors"}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search doctors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isFormOpen && isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedDoctor ? "Edit" : "Add"} Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            <DoctorForm
              doctor={selectedDoctor}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedDoctor(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.map((doctor) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{doctor.name}</h3>
                    <p className="text-sm text-gray-500">{doctor.specialization}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(doctor)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(doctor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {doctor.email}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Mobile:</span> {doctor.mobile}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Qualification:</span>{" "}
                    {doctor.qualification}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Experience:</span>{" "}
                    {doctor.experience} years
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Consultation Fee:</span> ₹
                    {doctor.consultation_fee}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Available Days:</span>{" "}
                    {doctor.available_days}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Doctors;
