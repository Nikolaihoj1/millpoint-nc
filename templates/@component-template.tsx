import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ExampleProps {
  title: string;
  icon?: LucideIcon;
}

export function Example({ title, icon: Icon }: ExampleProps) {
  return (
    <motion.div
      className="p-4 bg-gray-100 rounded-2xl shadow-md hover:shadow-lg transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {Icon && <Icon className="w-5 h-5 text-blue-500" />}
      <h2 className="text-xl font-semibold">{title}</h2>
    </motion.div>
  );
}
