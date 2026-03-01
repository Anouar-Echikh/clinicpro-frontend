import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  DollarSign,
  Package,
  UserCheck,
  Stethoscope,
  BarChart3,
  UserPlus,
  Shield,
  Bell,
  CreditCard,
  Globe,
  Building2,
  GraduationCap,
  Database,
  Activity,
  TestTube2,
  Building,
  ArrowRight,
  Star,
  Zap,
  TrendingUp,
} from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  stats: string[];
  badge?: string;
  isPopular?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  gradient,
  stats,
  badge,
  isPopular,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group">
        <div className={`h-52 ${gradient} p-6 relative overflow-hidden`}>
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-6 right-6 w-20 h-20 rounded-full border-2 border-white/40" />
            <div className="absolute bottom-6 left-6 w-12 h-12 rounded-full border-2 border-white/40" />
            <div className="absolute top-1/2 left-1/2 w-28 h-28 rounded-full border border-white/30 transform -translate-x-1/2 -translate-y-1/2" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-white/25 backdrop-blur-sm rounded-xl group-hover:bg-white/35 transition-all">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <div className="flex flex-col space-y-2">
                {badge && (
                  <Badge className="bg-white/25 text-white border-white/40 backdrop-blur-sm text-xs">
                    {badge}
                  </Badge>
                )}
                {isPopular && (
                  <Badge className="bg-yellow-400 text-yellow-900 border-0 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-end">
              <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                {title}
              </h3>
              <p className="text-white/95 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 bg-white">
          <div className="space-y-3">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start text-sm text-gray-700"
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3 mt-2 flex-shrink-0" />
                <span className="leading-relaxed">{stat}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              Learn More
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const FeatureCards = () => {
  const features = [
    {
      title: "Smart Appointment System",
      description:
        "Advanced scheduling with conflict detection, automated reminders, and real-time availability tracking.",
      icon: Calendar,
      gradient: "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600",
      stats: [
        "Drag & drop scheduling interface",
        "Automated SMS/Email reminders",
        "Multi-doctor calendar management",
        "Recurring appointment support",
        "Real-time conflict detection",
      ],
      badge: "Core",
      isPopular: true,
    },
    {
      title: "Complete Patient Records",
      description:
        "Comprehensive digital patient management with medical history, prescriptions, and treatment tracking.",
      icon: Users,
      gradient: "bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600",
      stats: [
        "Digital medical record system",
        "Medical history tracking",
        "Prescription management",
        "Allergy and medication alerts",
        "Emergency contact information",
      ],
      badge: "Essential",
      isPopular: true,
    },
    {
      title: "Department Management",
      description:
        "Organize staff by departments with budget tracking, location management, and performance metrics.",
      icon: Building2,
      gradient:
        "bg-gradient-to-br from-purple-500 via-violet-600 to-purple-600",
      stats: [
        "Department organization system",
        "Budget allocation and tracking",
        "Staff department assignments",
        "Location and contact management",
        "Department performance analytics",
      ],
      badge: "New",
    },
    {
      title: "Services Management",
      description:
        "Medical services catalog with dynamic pricing, scheduling, and comprehensive booking management.",
      icon: Activity,
      gradient: "bg-gradient-to-br from-orange-500 via-red-500 to-pink-500",
      stats: [
        "Complete service catalog",
        "Dynamic pricing management",
        "Service booking system",
        "Department integration",
        "Service performance metrics",
      ],
      badge: "New",
    },
    {
      title: "Financial Management",
      description:
        "Automated billing and invoicing with payment tracking, insurance integration, and comprehensive reporting.",
      icon: DollarSign,
      gradient: "bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600",
      stats: [
        "Automated invoice generation",
        "Multiple payment method support",
        "Insurance claim processing",
        "Payment tracking & reminders",
        "Comprehensive financial reports",
      ],
      badge: "Revenue",
      isPopular: true,
    },
    {
      title: "Smart Inventory Control",
      description:
        "Advanced inventory management with automated reordering, expiry tracking, and supplier integration.",
      icon: Package,
      gradient: "bg-gradient-to-br from-red-500 via-pink-500 to-rose-600",
      stats: [
        "Real-time stock level monitoring",
        "Automated low stock alerts",
        "Expiry date tracking system",
        "Supplier management integration",
        "Usage analytics and forecasting",
      ],
      badge: "Operations",
    },
    {
      title: "Staff & Role Management",
      description:
        "Comprehensive staff management with role-based access control, scheduling, and performance tracking.",
      icon: UserCheck,
      gradient: "bg-gradient-to-br from-pink-500 via-rose-500 to-red-500",
      stats: [
        "Role-based access control",
        "Staff scheduling system",
        "Department assignments",
        "Performance tracking metrics",
        "Payroll system integration",
      ],
      badge: "HR",
    },
    {
      title: "Lab Vendor Integration",
      description:
        "External laboratory vendor management with test ordering, result tracking, and quality metrics.",
      icon: Building,
      gradient: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
      stats: [
        "Vendor management system",
        "Automated test ordering",
        "Result tracking and alerts",
        "Contract management",
        "Quality control metrics",
      ],
      badge: "New",
    },
    {
      title: "Digital Prescriptions",
      description:
        "Electronic prescription system with drug interaction checks, pharmacy integration, and inventory sync.",
      icon: Stethoscope,
      gradient: "bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500",
      stats: [
        "Digital prescription creation",
        "Drug interaction alert system",
        "Pharmacy integration platform",
        "Prescription history tracking",
        "Automated dosage calculations",
      ],
      badge: "Medical",
    },
    {
      title: "Test & Lab Reports",
      description:
        "Complete test management with result tracking, reference values, and comprehensive reporting.",
      icon: TestTube2,
      gradient: "bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500",
      stats: [
        "Test result management",
        "Reference value tracking",
        "Automated report generation",
        "Quality control systems",
        "Result analytics dashboard",
      ],
      badge: "Medical",
    },
    {
      title: "Advanced Analytics",
      description:
        "Comprehensive reporting and analytics for data-driven decision making and operational insights.",
      icon: BarChart3,
      gradient:
        "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600",
      stats: [
        "Revenue and financial analytics",
        "Patient demographic insights",
        "Staff performance metrics",
        "Operational efficiency reports",
        "Custom dashboard creation",
      ],
      badge: "Analytics",
      isPopular: true,
    },
    {
      title: "Training Center",
      description:
        "Role-based training modules with progress tracking, certifications, and comprehensive learning resources.",
      icon: GraduationCap,
      gradient: "bg-gradient-to-br from-amber-500 via-orange-500 to-red-500",
      stats: [
        "Role-based training modules",
        "Progress tracking system",
        "Interactive learning content",
        "Certification management",
        "Comprehensive knowledge base",
      ],
      badge: "New",
    },
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Feature Gallery
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore our comprehensive suite of clinic management features
            through these detailed visual cards
          </p>

          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-600">Most Popular Features</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Latest Updates</span>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>

        {/* Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <div className="bg-white rounded-2xl shadow-lg border p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Platform Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {features.length}
                </div>
                <div className="text-gray-600 text-sm">Total Features</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {features.filter((f) => f.badge === "New").length}
                </div>
                <div className="text-gray-600 text-sm">New Features</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {features.filter((f) => f.isPopular).length}
                </div>
                <div className="text-gray-600 text-sm">Popular Features</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  100%
                </div>
                <div className="text-gray-600 text-sm">HIPAA Compliant</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeatureCards;
