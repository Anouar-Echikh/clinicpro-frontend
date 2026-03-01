import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Heart,
  Building2,
  Activity,
  TestTube2,
  Building,
  FileText,
  Settings,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  benefits: string[];
  color: string;
  bgColor: string;
  roles: string[];
  isNew?: boolean;
}

const FeaturesShowcase = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const features: Feature[] = [
    {
      id: "appointments",
      title: "Smart Appointment System",
      description:
        "Advanced scheduling with automated reminders, conflict detection, and calendar integration.",
      icon: Calendar,
      category: "Patient Care",
      benefits: [
        "Drag & drop scheduling",
        "Automated SMS/Email reminders",
        "Conflict detection",
        "Multi-doctor calendars",
        "Recurring appointments",
      ],
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      roles: ["Admin", "Doctor", "Receptionist"],
    },
    {
      id: "patients",
      title: "Complete Patient Management",
      description:
        "Comprehensive patient records with medical history, prescriptions, and treatment tracking.",
      icon: Users,
      category: "Patient Care",
      benefits: [
        "Digital medical records",
        "Medical history tracking",
        "Prescription management",
        "Allergy alerts",
        "Emergency contacts",
      ],
      color: "text-green-600",
      bgColor: "bg-green-50",
      roles: ["Admin", "Doctor", "Nurse", "Receptionist"],
    },
    {
      id: "departments",
      title: "Department Management",
      description:
        "Organize staff by departments with budget tracking, location management, and head assignments.",
      icon: Building2,
      category: "Operations",
      benefits: [
        "Department organization",
        "Budget tracking",
        "Staff assignments",
        "Location management",
        "Department analytics",
      ],
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      roles: ["Admin"],
      isNew: true,
    },
    {
      id: "services",
      title: "Services Management",
      description:
        "Medical services catalog with pricing, scheduling, and department assignments.",
      icon: Activity,
      category: "Operations",
      benefits: [
        "Service catalog",
        "Dynamic pricing",
        "Booking management",
        "Department integration",
        "Service analytics",
      ],
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      roles: ["Admin", "Doctor"],
      isNew: true,
    },
    {
      id: "billing",
      title: "Financial Management",
      description:
        "Automated billing, invoicing, payment tracking, and comprehensive financial reporting.",
      icon: DollarSign,
      category: "Financial",
      benefits: [
        "Automated invoicing",
        "Payment tracking",
        "Insurance integration",
        "Financial reports",
        "Revenue analytics",
      ],
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      roles: ["Admin", "Accountant", "Receptionist"],
    },
    {
      id: "inventory",
      title: "Smart Inventory Control",
      description:
        "Advanced inventory management with expiry tracking, low stock alerts, and supplier management.",
      icon: Package,
      category: "Operations",
      benefits: [
        "Real-time stock tracking",
        "Expiry date monitoring",
        "Low stock alerts",
        "Supplier management",
        "Usage analytics",
      ],
      color: "text-red-600",
      bgColor: "bg-red-50",
      roles: ["Admin", "Nurse"],
    },
    {
      id: "staff",
      title: "Staff & Role Management",
      description:
        "Comprehensive staff management with role-based access control and department assignments.",
      icon: UserCheck,
      category: "Human Resources",
      benefits: [
        "Role-based permissions",
        "Staff scheduling",
        "Department assignments",
        "Performance tracking",
        "Payroll integration",
      ],
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      roles: ["Admin"],
    },
    {
      id: "lab-vendors",
      title: "Lab Vendor Integration",
      description:
        "External laboratory vendor management with test ordering and result tracking.",
      icon: Building,
      category: "Medical",
      benefits: [
        "Vendor management",
        "Test ordering",
        "Result tracking",
        "Contract management",
        "Quality metrics",
      ],
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      roles: ["Admin", "Doctor"],
      isNew: true,
    },
    {
      id: "prescriptions",
      title: "Digital Prescriptions",
      description:
        "Electronic prescription system with drug interaction checks and inventory integration.",
      icon: Stethoscope,
      category: "Medical",
      benefits: [
        "Digital prescriptions",
        "Drug interaction alerts",
        "Inventory integration",
        "Prescription history",
        "Dosage calculations",
      ],
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      roles: ["Admin", "Doctor"],
    },
    {
      id: "test-reports",
      title: "Test & Lab Reports",
      description:
        "Complete test management with result tracking, reference values, and reporting.",
      icon: TestTube2,
      category: "Medical",
      benefits: [
        "Test result management",
        "Reference value tracking",
        "Report generation",
        "Quality control",
        "Result analytics",
      ],
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      roles: ["Admin", "Doctor", "Nurse"],
    },
    {
      id: "analytics",
      title: "Advanced Analytics",
      description:
        "Comprehensive dashboards with revenue tracking, patient analytics, and performance metrics.",
      icon: BarChart3,
      category: "Analytics",
      benefits: [
        "Revenue analytics",
        "Patient insights",
        "Staff performance",
        "Operational metrics",
        "Custom dashboards",
      ],
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      roles: ["Admin", "Accountant"],
    },

    {
      id: "security",
      title: "Enterprise Security",
      description:
        "HIPAA-compliant security with encryption, audit trails, and role-based access controls.",
      icon: Shield,
      category: "Security",
      benefits: [
        "HIPAA compliance",
        "Data encryption",
        "Audit trails",
        "Access controls",
        "Backup & recovery",
      ],
      color: "text-stone-600",
      bgColor: "bg-stone-50",
      roles: ["Admin"],
    },
  ];

  const categories = [
    "All",
    ...Array.from(new Set(features.map((f) => f.category))),
  ];

  const filteredFeatures =
    selectedCategory === "All"
      ? features
      : features.filter((f) => f.category === selectedCategory);

  return (
    <div className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Complete Platform Features
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Everything you need to run a modern, efficient healthcare practice.
            From patient care to business operations, we've got you covered.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="transition-all duration-200"
              >
                {category}
                {category !== "All" && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-gray-100 text-gray-600"
                  >
                    {features.filter((f) => f.category === category).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>New Features</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
              <span>{features.length} Total Features</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden group">
                <CardHeader className={`${feature.bgColor} relative pb-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white shadow-sm group-hover:shadow-md transition-shadow">
                      <feature.icon className={`h-7 w-7 ${feature.color}`} />
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant="secondary" className="text-xs">
                        {feature.category}
                      </Badge>
                      {feature.isNew && (
                        <Badge className="bg-green-500 text-white text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 leading-tight mb-2">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-700 text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 flex-1 flex flex-col">
                  {/* Benefits */}
                  <div className="mb-4 flex-1">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                      Key Features:
                    </h4>
                    <ul className="space-y-2">
                      {feature.benefits.slice(0, 4).map((benefit, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-sm text-gray-600"
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${feature.color.replace("text-", "bg-")} mr-3 mt-2 flex-shrink-0`}
                          />
                          {benefit}
                        </li>
                      ))}
                      {feature.benefits.length > 4 && (
                        <li className="text-sm text-gray-500 italic ml-4">
                          +{feature.benefits.length - 4} more
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Roles */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                      Access Roles:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {feature.roles.map((role) => (
                        <Badge
                          key={role}
                          variant="outline"
                          className="text-xs py-1 px-2"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {features.length}
              </div>
              <div className="text-gray-600">Total Features</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {features.filter((f) => f.isNew).length}
              </div>
              <div className="text-gray-600">New Features</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {categories.length - 1}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">5</div>
              <div className="text-gray-600">User Roles</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 inline-block max-w-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Experience All Features?
              </h3>
              <p className="text-blue-100 mb-6">
                Get hands-on experience with our comprehensive demo system
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-blue-600 bg-white hover:bg-gray-100"
                >
                  Try Live Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Request Tour
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeaturesShowcase;
