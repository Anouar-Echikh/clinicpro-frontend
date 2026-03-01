import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Users,
  DollarSign,
  Package,
  BarChart3,
  Shield,
  Clock,
  Heart,
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Building2,
  Activity,
  TestTube2,
  Stethoscope,
  Building,
  UserCheck,
  FileText,
  BookOpen,
  Settings,
  TrendingUp,
  Zap,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/ui/LanguageSelector";

const Index = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const coreFeatures = [
    {
      icon: Calendar,
      title: t("Smart Appointment System"),
      description:
        t("Advanced scheduling with automated reminders, conflict detection, and calendar integration"),
    },
    {
      icon: Users,
      title: t("Complete Patient Management"),
      description:
        t("Comprehensive patient records, medical history, allergies, and treatment tracking"),
    },
    {
      icon: DollarSign,
      title: t("Financial Management"),
      description:
        t("Automated billing, invoicing, payment tracking, and comprehensive financial reporting"),
    },
    {
      icon: Building2,
      title: t("Department Management"),
      description:
        t("Organize staff by departments with budget tracking and location management"),
    },
    {
      icon: UserCheck,
      title: t("Staff & Role Management"),
      description:
        t("Complete staff management with role-based access control and scheduling"),
    },
    {
      icon: Activity,
      title: t("Services Management"),
      description:
        t("Medical services catalog with pricing, scheduling, and department assignments"),
    },
  ];

  const advancedFeatures = [
    {
      icon: Package,
      title: t("Inventory Control"),
      description:
        t("Advanced inventory management with expiry tracking, low stock alerts, and supplier management"),
      highlight: "Smart Alerts",
    },
    {
      icon: TestTube2,
      title: t("Laboratory Integration"),
      description:
        t("Complete test management with external lab vendor integration and result tracking"),
      highlight: "Lab Vendors",
    },
    {
      icon: Stethoscope,
      title: t("Prescription Management"),
      description:
        t("Digital prescriptions with medication tracking and inventory integration"),
      highlight: "Digital Rx",
    },
    {
      icon: BarChart3,
      title: t("Advanced Analytics"),
      description:
        t("Comprehensive dashboards with revenue tracking, patient analytics, and performance metrics"),
      highlight: "Real-time Data",
    },

  ];

  const systemFeatures = [
    {
      icon: Shield,
      title: t("Enterprise Security"),
      description: t("HIPAA compliant with role-based access control"),
    },
    {
      icon: BookOpen,
      title: t("Complete Documentation"),
      description: t("Comprehensive guides and workflow documentation"),
    },
    {
      icon: Settings,
      title: t("Customizable Workflows"),
      description: t("Adapt the system to your clinic's specific needs"),
    },
    {
      icon: Globe,
      title: t("Multi-location Support"),
      description: t("Manage multiple clinic locations from one dashboard"),
    },
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: t("Chief Medical Officer"),
      clinic: "HealthCare Plus",
      content:
        t("The new Department Management feature revolutionized how we organize our staff. The Training Center helped our team adapt quickly to the new workflows."),
      rating: 5,
    },
    {
      name: "Dr. Michael Chen",
      role: t("Clinic Director"),
      clinic: "MedCenter Pro",
      content:
        t("The advanced analytics and comprehensive reporting gave us insights we never had before. Revenue tracking is now seamless."),
      rating: 5,
    },
    {
      name: "Dr. Emily Rodriguez",
      role: t("Practice Manager"),
      clinic: "Wellness Clinic",
      content:
        t("The Services Management and Lab Vendor integration streamlined our entire operation. Patient satisfaction increased significantly."),
      rating: 5,
    },
  ];

  const stats = [
    { number: "10,000+", label: t("Active Users") },
    { number: "500+", label: t("Clinics Worldwide") },
    { number: "99.9%", label: t("Uptime Guarantee") },
    { number: "24/7", label: t("Expert Support") },
  ];

  return (
    <div className="w-full bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-foreground">{t("ClinicPro")}</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/features"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {t("Features")}
              </Link>
              <a
                href="#testimonials"
                className="text-muted-foreground hover:text-primary transition-colors"
               >
                {t("Testimonials")}
              </a>
              <a
                href="#modules"
                className="text-muted-foreground hover:text-primary transition-colors"
               >
                {t("Modules")}
              </a>
              <a
                href="#contact"
                className="text-muted-foreground hover:text-primary transition-colors"
               >
                {t("Contact")}
              </a>
              <ThemeToggle />
              <LanguageSelector />
              <Link to="/login">
                <Button variant="outline">{t("Login")}</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden border-t bg-background/95 backdrop-blur-md"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/features"
                  className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                   {t("Features")}
                </Link>
                <a
                  href="#testimonials"
                  className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                   {t("Testimonials")}
                </a>
                <a
                  href="#modules"
                  className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                   {t("Modules")}
                </a>
                <a
                  href="#contact"
                  className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                   {t("Contact")}
                </a>
                <div className="px-3 pt-2 space-y-2">
                  <div className="flex justify-center py-2">
                    <ThemeToggle />
                  </div>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                       {t("Login")}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/50 dark:via-background dark:to-purple-950/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-4" variant="secondary">
                <Star className="w-4 h-4 mr-1" />
                {t("Trusted by 10,000+ Healthcare Professionals")}
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                {t("Next-Generation Clinic Management Platform")}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {t("Complete healthcare management solution with advanced department organization, training modules, analytics, and comprehensive workflow automation. Transform your clinic operations today.")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                    {t("Explore Platform")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 w-full sm:w-auto"
                  >
                    {t("Login")}
                  </Button>
                </Link>
              </div>
              <div className="flex items-center mt-8 space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                  {t("Free access")}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                  {t("No credit card required")}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                  {t("Full feature access")}
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-card rounded-2xl shadow-2xl border p-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">
                      Advanced Dashboard
                    </h3>
                    <TrendingUp className="h-5 w-5 text-green-500 dark:text-green-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card rounded p-3 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">47</div>
                       <div className="text-sm text-blue-600 dark:text-blue-400">
                         {t("Today's Appointments")}
                       </div>
                    </div>
                    <div className="bg-card rounded p-3 shadow-sm">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        $12,450
                      </div>
                       <div className="text-sm text-green-600 dark:text-green-400">
                         {t("Weekly Revenue")}
                       </div>
                    </div>
                  </div>
                </div>
                                  <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{t("6 Departments")}</div>
                      <div className="text-xs text-muted-foreground">
                        {t("Active with 47 staff members")}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t("Core Platform Features")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("Essential features that form the foundation of modern clinic management, designed for efficiency and growth.")}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl mb-2">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section id="modules" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t("Advanced Platform Modules")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("Cutting-edge features that set ClinicPro apart from traditional clinic management systems." )}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-purple-500 dark:border-l-purple-400">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <feature.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        {feature.highlight}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* System Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t("Enterprise-Grade System Features")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("Built with security, scalability, and reliability at its core.")}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {systemFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <feature.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-lg mb-2">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t("Trusted by Healthcare Professionals")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("See how ClinicPro's advanced features are transforming clinics worldwide")}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 text-yellow-400 dark:text-yellow-300 fill-current"
                        />
                      ))}
                    </div>
                    <CardDescription className="text-base italic mb-4">
                      "{testimonial.content}"
                    </CardDescription>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                      <div className="text-sm text-primary">
                        {testimonial.clinic}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              {t("Ready to Transform Your Clinic?")}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {t("Join thousands of healthcare professionals who are already using ClinicPro to streamline their operations and improve patient care.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6"
              >
                {t("Schedule Demo")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
                >
                  {t("Login")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                {t("Experience ClinicPro Today")}
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                {t("Get in touch with our team to schedule a personalized demo and see how ClinicPro's advanced features can transform your practice.")}
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-primary mr-3" />
                  <span className="text-foreground">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-primary mr-3" />
                  <span className="text-foreground">contact@clinicpro.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary mr-3" />
                  <span className="text-foreground">San Francisco, CA</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t("Request a Demo")}</CardTitle>
                  <CardDescription>
                    {t("Fill out the form below and we'll get back to you within 24 hours.")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input placeholder={t("First Name")} />
                      <Input placeholder={t("Last Name")} />
                    </div>
                    <Input placeholder={t("Email Address")} type="email" />
                    <Input placeholder={t("Phone Number")} type="tel" />
                    <Input placeholder={t("Clinic Name")} />
                    <Textarea placeholder={t("Tell us about your clinic and which features interest you most...")} />
                    <Button className="w-full" size="lg">
                      {t("Request Demo")}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-8 w-8 text-blue-400" />
              <span className="font-bold text-xl">{t("ClinicPro")}</span>
              </div>
              <p className="text-gray-400 mb-4">
                {t("The next-generation clinic management platform with advanced features for modern healthcare practices.")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t("Platform")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    {t("Core Features")}
                  </a>
                </li>
                <li>
                  <a
                    href="#modules"
                    className="hover:text-white transition-colors"
                  >
                    {t("Advanced Modules")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("Security & Compliance")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("Integration API")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t("Resources")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("Documentation")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("Training Center")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("Help Center")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("System Status")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t("Company")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("About Us")}
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-white transition-colors"
                  >
                    {t("Contact")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("Privacy Policy")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t("Terms of Service")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {t("ClinicPro")}. {t("All rights reserved.")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
