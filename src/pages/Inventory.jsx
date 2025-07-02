
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, AlertTriangle, Package, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

function InventoryForm({ medicine, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: medicine?.name || "",
    manufacturer: medicine?.manufacturer || "",
    stock_quantity: medicine?.stock_quantity || 0,
    unit: medicine?.unit || "",
    batch_number: medicine?.batch_number || "",
    expiry_date: medicine?.expiry_date?.split('T')[0] || "",
    reorder_level: medicine?.reorder_level || 10,
    unit_price: medicine?.unit_price || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{medicine ? "Edit" : "Add"} Medicine</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Medicine Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Manufacturer</Label>
              <Input
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Unit</Label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
                placeholder="e.g., tablets, bottles"
              />
            </div>

            <div className="space-y-2">
              <Label>Batch Number</Label>
              <Input
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Reorder Level</Label>
              <Input
                type="number"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Unit Price (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {medicine ? "Update" : "Add"} Medicine
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Inventory() {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicine_inventory')
        .select('*')
        .order('name');

      if (error) throw error;
      setMedicines(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch medicines",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedMedicine) {
        const { error } = await supabase
          .from('medicine_inventory')
          .update(formData)
          .eq('id', selectedMedicine.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Medicine updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('medicine_inventory')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Medicine added successfully",
        });
      }

      setIsFormOpen(false);
      setSelectedMedicine(null);
      fetchMedicines();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('medicine_inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Medicine deleted successfully",
      });
      fetchMedicines();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medicine.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="mt-2 text-gray-600">Manage medicine stock and inventory</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Medicine
        </Button>
      </div>

      {isFormOpen && (
        <InventoryForm
          medicine={selectedMedicine}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedMedicine(null);
          }}
        />
      )}

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search medicines..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-6">
        {filteredMedicines.map((medicine) => (
          <motion.div
            key={medicine.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">{medicine.name}</h3>
                    <p className="text-sm text-gray-500">
                      Manufacturer: {medicine.manufacturer || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMedicine(medicine);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(medicine.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-gray-500">Stock</p>
                    <p className="font-medium">
                      {medicine.stock_quantity} {medicine.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unit Price</p>
                    <p className="font-medium">₹{medicine.unit_price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Batch Number</p>
                    <p className="font-medium">{medicine.batch_number || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expiry Date</p>
                    <p className="font-medium">
                      {medicine.expiry_date ? format(new Date(medicine.expiry_date), 'MMM dd, yyyy') : "N/A"}
                    </p>
                  </div>
                </div>

                {medicine.stock_quantity <= medicine.reorder_level && (
                  <div className="mt-4 flex items-center text-amber-600">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    <span className="text-sm">Low stock alert! Time to reorder.</span>
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

export default Inventory;
