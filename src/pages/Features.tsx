import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";
import FeaturesShowcase from "@/components/features/FeaturesShowcase";
import FeatureCards from "@/components/features/FeatureCards";
import PublicHeader from "@/components/layout/PublicHeader";

const Features = () => {
  return (
    <div className="w-full bg-background">
      <PublicHeader showBackToHome={true} variant="auth" />

      {/* Features Content */}
      <FeaturesShowcase />
      <FeatureCards />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">ClinicPro</span>
            </Link>
            <p className="text-gray-400 mb-6">
              The complete clinic management solution for modern healthcare
              practices.
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Try Demo
              </Link>
              <Link
                to="/#contact"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact Us
              </Link>
              <Link
                to="/#pricing"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;
