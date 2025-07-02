
import React from "react";
import { motion } from "framer-motion";

function PaymentStats({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-card p-6 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <h3 className="mt-1 text-2xl font-semibold text-card-foreground">{value}</h3>
        </div>
        <div className={`rounded-full ${color} p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

export default PaymentStats;
