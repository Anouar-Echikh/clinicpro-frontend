import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Home, ArrowLeft } from "lucide-react";
import PublicHeader from "@/components/layout/PublicHeader";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full bg-background min-h-screen">
      <PublicHeader />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-md mx-auto"
      >
        {/* Logo */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Heart className="h-12 w-12 text-primary" />
            <span className="text-3xl font-bold text-foreground">{t("ClinicPro")}</span>
          </Link>
        </div>

        {/* 404 Display */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {t("Page Not Found")}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t("The page you're looking for doesn't exist or has been moved.")}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                {t("Go Home")}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Go Back")}
            </Button>
          </div>
        </motion.div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-sm text-muted-foreground"
        >
          <p>
            {t("Need help?")}{" "}
            <Link to="/#contact" className="text-primary hover:underline">
              {t("Contact our support team")}
            </Link>
          </p>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
