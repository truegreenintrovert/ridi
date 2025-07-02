
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Upload, FileText, Calendar, User, FlaskRound as Flask, Phone, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export default function LabTests() {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [tests, setTests] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    test_id: "",
    test_date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
    status: "pending"
  });

  const canManageTests = userRole === 'admin' || userRole === 'staff';

  useEffect(() => {
    fetchData();
    initializeStorage();
  }, []);

  const initializeStorage = async () => {
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      if (listError) throw listError;

      const labReportsBucket = buckets.find(b => b.name === 'lab-reports');
      if (!labReportsBucket) {
        const { error: createError } = await supabase.storage.createBucket('lab-reports', {
          public: false,
          fileSizeLimit: 5242880,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf']
        });
        if (createError) throw createError;
      }
    } catch (error) {
      console.error('Storage initialization error:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientsData, doctorsData, testsData, labTestsData] = await Promise.all([
        supabase.from('patients').select('*').order('name'),
        supabase.from('doctors').select('*').order('name'),
        supabase.from('lab_tests').select('*').order('name'),
        supabase.from('patient_lab_tests').select(`
          *,
          patients (name, mobile),
          doctors (name),
          lab_tests (name)
        `).order('created_at', { ascending: false })
      ]);

      if (patientsData.error) throw patientsData.error;
      if (doctorsData.error) throw doctorsData.error;
      if (testsData.error) throw testsData.error;
      if (labTestsData.error) throw labTestsData.error;

      setPatients(patientsData.data || []);
      setDoctors(doctorsData.data || []);
      setTests(testsData.data || []);
      setLabTests(labTestsData.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setFormData({
      patient_id: test.patient_id || "",
      doctor_id: test.doctor_id || "",
      test_id: test.test_id || "",
      test_date: format(parseISO(test.test_date), "yyyy-MM-dd"),
      notes: test.notes || "",
      status: test.status || "pending"
    });
    setIsAddingTest(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManageTests) {
      toast({
        title: "Error",
        description: "You don't have permission to manage lab tests",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      if (editingTest) {
        const { error } = await supabase
          .from('patient_lab_tests')
          .update(formData)
          .eq('id', editingTest.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Lab test updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('patient_lab_tests')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Lab test added successfully",
        });
      }

      setIsAddingTest(false);
      setEditingTest(null);
      setFormData({
        patient_id: "",
        doctor_id: "",
        test_id: "",
        test_date: format(new Date(), "yyyy-MM-dd"),
        notes: "",
        status: "pending"
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportUpload = async (testId, file) => {
    if (!canManageTests) {
      toast({
        title: "Error",
        description: "You don't have permission to upload reports",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      if (file.size > 5242880) {
        throw new Error('File size must be less than 5MB');
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type must be PNG, JPEG, or PDF');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${testId}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Delete old report if exists
      const test = labTests.find(t => t.id === testId);
      if (test?.report_url) {
        const oldFileName = test.report_url.split('/').pop();
        await supabase.storage
          .from('lab-reports')
          .remove([oldFileName]);
      }

      // Upload new report
      const { error: uploadError } = await supabase.storage
        .from('lab-reports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl }, error: urlError } = await supabase.storage
        .from('lab-reports')
        .getPublicUrl(fileName);

      if (urlError) throw urlError;

      // Update the database
      const { error: updateError } = await supabase
        .from('patient_lab_tests')
        .update({
          report_url: publicUrl,
          status: 'completed'
        })
        .eq('id', testId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Report uploaded successfully",
      });

      fetchData();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (testId) => {
    if (!canManageTests) {
      toast({
        title: "Error",
        description: "You don't have permission to delete lab tests",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('patient_lab_tests')
        .delete()
        .eq('id', testId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lab test deleted successfully",
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lab test",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (testId, newStatus) => {
    if (!canManageTests) {
      toast({
        title: "Error",
        description: "You don't have permission to update test status",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('patient_lab_tests')
        .update({ status: newStatus })
        .eq('id', testId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Status updated successfully",
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = labTests.filter(test =>
    test.patients?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.lab_tests?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lab Tests</h1>
          <p className="mt-2 text-gray-600">Manage patient lab tests and reports</p>
        </div>
        {canManageTests && (
          <Button onClick={() => setIsAddingTest(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lab Test
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search tests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isAddingTest && canManageTests && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTest ? 'Edit Lab Test' : 'Add New Lab Test'}</CardTitle>
            <CardDescription>Enter the details for the lab test</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Doctor</Label>
                  <Select
                    value={formData.doctor_id}
                    onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Test Type</Label>
                  <Select
                    value={formData.test_id}
                    onValueChange={(value) => setFormData({ ...formData, test_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test" />
                    </SelectTrigger>
                    <SelectContent>
                      {tests.map((test) => (
                        <SelectItem key={test.id} value={test.id}>
                          {test.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Test Date</Label>
                  <Input
                    type="date"
                    value={formData.test_date}
                    onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes"
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : (editingTest ? "Update Lab Test" : "Save Lab Test")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingTest(false);
                    setEditingTest(null);
                    setFormData({
                      patient_id: "",
                      doctor_id: "",
                      test_id: "",
                      test_date: format(new Date(), "yyyy-MM-dd"),
                      notes: "",
                      status: "pending"
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {filteredTests.map((test) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{test.patients?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Flask className="h-4 w-4 text-gray-500" />
                      <span>{test.lab_tests?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{format(parseISO(test.test_date), "MMM dd, yyyy")}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {test.report_url ? (
                      <div className="flex items-center space-x-2">
                        <a
                          href={test.report_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          <span>View Report</span>
                        </a>
                        {canManageTests && (
                          <>
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleReportUpload(test.id, e.target.files[0]);
                                }
                              }}
                              className="hidden"
                              id={`file-change-${test.id}`}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById(`file-change-${test.id}`).click()}
                            >
                              <RefreshCw className="h-4 w-4" />
                              <span className="ml-2">Change Report</span>
                            </Button>
                          </>
                        )}
                      </div>
                    ) : (
                      canManageTests && (
                        <div className="flex items-center space-x-4">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleReportUpload(test.id, e.target.files[0]);
                              }
                            }}
                            className="hidden"
                            id={`file-upload-${test.id}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`file-upload-${test.id}`).click()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Report
                          </Button>
                        </div>
                      )
                    )}

                    {canManageTests && (
                      <>
                        <Select
                          value={test.status}
                          onValueChange={(value) => handleStatusChange(test.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(test)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(test.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {test.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">{test.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
