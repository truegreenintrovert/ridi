
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, Calendar, CreditCard, Plus, ArrowRight, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

function StatCard({ icon: Icon, label, value, color, isLocked }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-card p-6 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <h3 className="mt-1 text-2xl font-semibold text-card-foreground">
            {isLocked ? (
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Admin only</span>
              </div>
            ) : (
              value
            )}
          </h3>
        </div>
        <div className={`rounded-full ${color} p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        // Fetch total patients
        const { count: patientsCount } = await supabase
          .from('patients')
          .select('*', { count: 'exact' });

        // Fetch total doctors
        const { count: doctorsCount } = await supabase
          .from('doctors')
          .select('*', { count: 'exact' });

        // Fetch today's appointments
        const today = format(new Date(), 'yyyy-MM-dd');
        const { count: appointmentsCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('appointment_date', today);

        // Fetch monthly revenue only if user is admin
        let monthlyRevenue = 0;
        if (isAdmin) {
          const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
          const { data: payments } = await supabase
            .from('payments')
            .select('amount')
            .gte('payment_date', startOfMonth)
            .eq('status', 'completed');

          monthlyRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
        }

        setStats({
          totalPatients: patientsCount || 0,
          totalDoctors: doctorsCount || 0,
          todayAppointments: appointmentsCount || 0,
          monthlyRevenue,
        });

        // Fetch recent activity (appointments and payments)
        const [recentAppointments, recentPayments] = await Promise.all([
          supabase
            .from('appointments')
            .select(`
              id,
              appointment_date,
              appointment_time,
              type,
              status,
              patients(name),
              doctors(name)
            `)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('payments')
            .select(`
              id,
              amount,
              payment_date,
              status,
              patients(name)
            `)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        const combinedActivity = [
          ...(recentAppointments.data || []).map(apt => ({
            type: 'appointment',
            date: apt.appointment_date,
            data: apt
          })),
          ...(recentPayments.data || []).map(payment => ({
            type: 'payment',
            date: payment.payment_date,
            data: payment
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        setRecentActivity(combinedActivity);

        // Fetch upcoming appointments
        const { data: upcoming } = await supabase
          .from('appointments')
          .select(`
            id,
            appointment_date,
            appointment_time,
            type,
            patients(name),
            doctors(name)
          `)
          .gte('appointment_date', today)
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true })
          .limit(5);

        setUpcomingAppointments(upcoming || []);

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    }

    fetchDashboardStats();
  }, [isAdmin]);

  const quickActions = [
    {
      label: "New Appointment",
      path: "/appointments",
      action: () => navigate("/appointments"),
      icon: Calendar
    },
    {
      label: "Add Patient",
      path: "/patients",
      action: () => navigate("/patients"),
      icon: Users
    },
    {
      label: "New Payment",
      path: "/payments",
      action: () => navigate("/payments"),
      icon: CreditCard
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-card-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your dashboard overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Patients"
          value={stats.totalPatients}
          color="bg-blue-500"
        />
        <StatCard
          icon={UserCheck}
          label="Total Doctors"
          value={stats.totalDoctors}
          color="bg-green-500"
        />
        <StatCard
          icon={Calendar}
          label="Today's Appointments"
          value={stats.todayAppointments}
          color="bg-purple-500"
        />
        <StatCard
          icon={CreditCard}
          label="Monthly Revenue"
          value={isAdmin ? `₹${stats.monthlyRevenue.toLocaleString()}` : null}
          color="bg-orange-500"
          isLocked={!isAdmin}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-card-foreground">
                      {activity.type === 'appointment' 
                        ? `Appointment: ${activity.data.patients?.name} with Dr. ${activity.data.doctors?.name}`
                        : `Payment: ${activity.data.patients?.name}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(activity.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activity.type === 'appointment' 
                      ? activity.data.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      : activity.data.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.type === 'appointment' ? activity.data.status : activity.data.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-card-foreground">
                      {appointment.patients?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      with Dr. {appointment.doctors?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(appointment.appointment_date), 'MMM dd, yyyy')} at {appointment.appointment_time}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    {appointment.type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={action.action}
                >
                  <span className="flex items-center">
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
