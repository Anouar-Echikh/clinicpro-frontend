import React from "react";
import { cn } from "@/lib/utils";

export interface ToothImageProps {
  toothNumber: number;
  condition?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  isChild?: boolean;
}

const ToothImage: React.FC<ToothImageProps> = ({
  toothNumber,
  condition = "healthy",
  color = "#f8f9fa",
  size = "md",
  className = "",
  isChild = false
}) => {
  const sizeClasses = {
    sm: "w-7 h-9 md:w-8 md:h-10",
    md: "w-9 h-11 md:w-10 md:h-12", 
    lg: "w-11 h-13 md:w-12 md:h-14"
  };

  // Map child teeth numbers (FDI) to adult tooth image numbers
  const getImageNumber = () => {
    if (!isChild) {
      return toothNumber; // Adult teeth use direct numbering (1-32)
    }
    
    // Child teeth FDI to adult tooth image mapping
    const childToAdultMapping: Record<number, number> = {
      // Upper right primary teeth → adult teeth
      55: 2,  // Upper right 2nd primary molar → adult 2nd molar
      54: 3,  // Upper right 1st primary molar → adult 1st molar  
      53: 6,  // Upper right primary canine → adult canine
      52: 7,  // Upper right primary lateral incisor → adult lateral incisor
      51: 8,  // Upper right primary central incisor → adult central incisor
      
      // Upper left primary teeth → adult teeth  
      61: 9,  // Upper left primary central incisor → adult central incisor
      62: 10, // Upper left primary lateral incisor → adult lateral incisor
      63: 11, // Upper left primary canine → adult canine
      64: 14, // Upper left 1st primary molar → adult 1st molar
      65: 15, // Upper left 2nd primary molar → adult 2nd molar
      
      // Lower left primary teeth → adult teeth
      75: 18, // Lower left 2nd primary molar → adult 2nd molar
      74: 19, // Lower left 1st primary molar → adult 1st molar
      73: 22, // Lower left primary canine → adult canine  
      72: 23, // Lower left primary lateral incisor → adult lateral incisor
      71: 24, // Lower left primary central incisor → adult central incisor
      
      // Lower right primary teeth → adult teeth
      81: 25, // Lower right primary central incisor → adult central incisor
      82: 26, // Lower right primary lateral incisor → adult lateral incisor  
      83: 27, // Lower right primary canine → adult canine
      84: 30, // Lower right 1st primary molar → adult 1st molar
      85: 31, // Lower right 2nd primary molar → adult 2nd molar
    };
    
    return childToAdultMapping[toothNumber] || 1; // Fallback to tooth 1 if not found
  };
  
  const imageNumber = getImageNumber();
  const imagePath = `/teeth/${imageNumber}.png`;

  // Condition overlay styles
  const getConditionOverlay = () => {
    const overlayStyles = {
      caries: "bg-red-500/60",
      filling: "bg-blue-500/60", 
      crown: "bg-yellow-500/60",
      bridge: "bg-purple-500/60",
      implant: "bg-gray-500/60",
      extraction: "bg-black/80",
      root_canal: "bg-red-700/60",
      missing: "bg-gray-300/40",
      fractured: "bg-orange-500/60",
      wear: "bg-yellow-400/50",
      restoration_needed: "bg-pink-500/60",
      sealant: "bg-cyan-500/50",
      veneer: "bg-violet-500/50",
      temporary_filling: "bg-lime-500/50",
      periapical_lesion: "bg-orange-700/60",
    };

    return overlayStyles[condition as keyof typeof overlayStyles] || "";
  };

  const conditionOverlay = getConditionOverlay();

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Tooth Image */}
      <img
        src={imagePath}
        alt={`Tooth ${toothNumber}${isChild ? ' (Primary)' : ''}`}
        className={cn(
          "w-full h-full object-contain transition-all duration-200",
          condition === "missing" && "opacity-30 grayscale"
        )}
        onError={(e) => {
          // Fallback to a colored box with tooth number if image doesn't load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          
          // Create a fallback div
          const fallbackDiv = document.createElement('div');
          fallbackDiv.className = 'w-full h-full flex items-center justify-center bg-gray-100 border-2 border-gray-300 rounded text-gray-700 font-bold text-sm';
          fallbackDiv.textContent = toothNumber.toString();
          fallbackDiv.style.minHeight = '36px';
          
          target.parentElement?.appendChild(fallbackDiv);
        }}
      />
      
      {/* Condition Overlay */}
      {condition !== "healthy" && conditionOverlay && (
        <div 
          className={cn(
            "absolute inset-0 rounded-sm transition-opacity duration-300",
            conditionOverlay
          )}
        />
      )}
      
      {/* Missing Tooth X Mark */}
      {condition === "missing" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-red-500 text-xl font-bold">×</div>
        </div>
      )}
      
      {/* Extraction Mark */}
      {condition === "extraction" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-0.5 bg-red-500 transform rotate-45"></div>
          <div className="w-full h-0.5 bg-red-500 transform -rotate-45 absolute"></div>
        </div>
      )}
    </div>
  );
};

export default ToothImage;
