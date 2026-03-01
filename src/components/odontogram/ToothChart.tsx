import React from "react";
import { cn } from "@/lib/utils";
import { 
  ToothChartProps, 
  DentalConditionType, 
  ConditionColorMap, 
  ToothNumberingSystem,
  ToothCondition,
  ToothSurface,
  SurfaceCondition
} from "@/types";
import ToothImage from "@/components/teeth/ToothImage";

// Color mapping for different dental conditions
const conditionColors: ConditionColorMap = {
  healthy: "#22c55e",        // Green
  caries: "#ef4444",         // Red
  filling: "#3b82f6",        // Blue
  crown: "#f59e0b",          // Amber
  bridge: "#8b5cf6",         // Purple
  implant: "#6b7280",        // Gray
  extraction: "#000000",     // Black
  root_canal: "#dc2626",     // Dark red
  missing: "#f3f4f6",        // Light gray
  fractured: "#f97316",      // Orange
  wear: "#facc15",           // Yellow
  restoration_needed: "#ec4899", // Pink
  sealant: "#06b6d4",        // Cyan
  veneer: "#a855f7",         // Violet
  temporary_filling: "#84cc16", // Lime
  periapical_lesion: "#7c2d12", // Dark orange
};

// Standard adult teeth numbering (Universal system 1-32)
const adultTeethLayout = {
  upper: {
    right: [1, 2, 3, 4, 5, 6, 7, 8],    // Upper right
    left: [9, 10, 11, 12, 13, 14, 15, 16]  // Upper left
  },
  lower: {
    left: [17, 18, 19, 20, 21, 22, 23, 24], // Lower left
    right: [25, 26, 27, 28, 29, 30, 31, 32]  // Lower right
  }
};

// Pediatric teeth numbering (Primary teeth A-T or 55-85 in FDI)
const childTeethLayout = {
  upper: {
    right: [55, 54, 53, 52, 51],    // Upper right primary
    left: [61, 62, 63, 64, 65]      // Upper left primary
  },
  lower: {
    left: [75, 74, 73, 72, 71],     // Lower left primary
    right: [81, 82, 83, 84, 85]     // Lower right primary
  }
};

// Palmer notation conversion (for display purposes)
const universalToPalmer = (toothNumber: number, isChild: boolean = false): string => {
  if (isChild) {
    // Primary teeth Palmer notation
    const palmerMap: Record<number, string> = {
      // Upper right
      55: "E", 54: "D", 53: "C", 52: "B", 51: "A",
      // Upper left  
      61: "A", 62: "B", 63: "C", 64: "D", 65: "E",
      // Lower left
      75: "E", 74: "D", 73: "C", 72: "B", 71: "A",
      // Lower right
      81: "A", 82: "B", 83: "C", 84: "D", 85: "E"
    };
    return palmerMap[toothNumber] || toothNumber.toString();
  } else {
    // Adult teeth Palmer notation
    const palmerMap: Record<number, string> = {
      // Upper right (UR)
      1: "8", 2: "7", 3: "6", 4: "5", 5: "4", 6: "3", 7: "2", 8: "1",
      // Upper left (UL)
      9: "1", 10: "2", 11: "3", 12: "4", 13: "5", 14: "6", 15: "7", 16: "8",
      // Lower left (LL)
      17: "8", 18: "7", 19: "6", 20: "5", 21: "4", 22: "3", 23: "2", 24: "1",
      // Lower right (LR)
      25: "1", 26: "2", 27: "3", 28: "4", 29: "5", 30: "6", 31: "7", 32: "8"
    };
    return palmerMap[toothNumber] || toothNumber.toString();
  }
};

// FDI notation conversion (from Universal)
const universalToFDI = (toothNumber: number, isChild: boolean = false): string => {
  if (isChild) {
    // Already in FDI for primary teeth
    return toothNumber.toString();
  } else {
    // Adult teeth FDI notation
    const fdiMap: Record<number, string> = {
      // Upper right (1x)
      1: "18", 2: "17", 3: "16", 4: "15", 5: "14", 6: "13", 7: "12", 8: "11",
      // Upper left (2x)
      9: "21", 10: "22", 11: "23", 12: "24", 13: "25", 14: "26", 15: "27", 16: "28",
      // Lower left (3x)
      17: "38", 18: "37", 19: "36", 20: "35", 21: "34", 22: "33", 23: "32", 24: "31",
      // Lower right (4x)
      25: "41", 26: "42", 27: "43", 28: "44", 29: "45", 30: "46", 31: "47", 32: "48"
    };
    return fdiMap[toothNumber] || toothNumber.toString();
  }
};

// Tooth names for tooltips
const toothNames: Record<number, string> = {
  // Adult teeth (Universal numbering)
  1: "Upper Right 3rd Molar", 2: "Upper Right 2nd Molar", 3: "Upper Right 1st Molar",
  4: "Upper Right 2nd Premolar", 5: "Upper Right 1st Premolar", 6: "Upper Right Canine",
  7: "Upper Right Lateral Incisor", 8: "Upper Right Central Incisor",
  9: "Upper Left Central Incisor", 10: "Upper Left Lateral Incisor", 11: "Upper Left Canine",
  12: "Upper Left 1st Premolar", 13: "Upper Left 2nd Premolar", 14: "Upper Left 1st Molar",
  15: "Upper Left 2nd Molar", 16: "Upper Left 3rd Molar",
  17: "Lower Left 3rd Molar", 18: "Lower Left 2nd Molar", 19: "Lower Left 1st Molar",
  20: "Lower Left 2nd Premolar", 21: "Lower Left 1st Premolar", 22: "Lower Left Canine",
  23: "Lower Left Lateral Incisor", 24: "Lower Left Central Incisor",
  25: "Lower Right Central Incisor", 26: "Lower Right Lateral Incisor", 27: "Lower Right Canine",
  28: "Lower Right 1st Premolar", 29: "Lower Right 2nd Premolar", 30: "Lower Right 1st Molar",
  31: "Lower Right 2nd Molar", 32: "Lower Right 3rd Molar",
  
  // Primary teeth (FDI numbering)
  55: "Upper Right 2nd Molar", 54: "Upper Right 1st Molar", 53: "Upper Right Canine",
  52: "Upper Right Lateral Incisor", 51: "Upper Right Central Incisor",
  61: "Upper Left Central Incisor", 62: "Upper Left Lateral Incisor", 63: "Upper Left Canine",
  64: "Upper Left 1st Molar", 65: "Upper Left 2nd Molar",
  75: "Lower Left 2nd Molar", 74: "Lower Left 1st Molar", 73: "Lower Left Canine",
  72: "Lower Left Lateral Incisor", 71: "Lower Left Central Incisor",
  81: "Lower Right Central Incisor", 82: "Lower Right Lateral Incisor", 83: "Lower Right Canine",
  84: "Lower Right 1st Molar", 85: "Lower Right 2nd Molar",
};

interface ToothProps {
  number: number;
  condition?: DentalConditionType;
  toothData?: ToothCondition;
  isHighlighted?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onSurfaceClick?: (surface: ToothSurface) => void;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
  numberingSystem?: ToothNumberingSystem;
  isChild?: boolean;
  editable?: boolean;
}

const Tooth: React.FC<ToothProps> = ({ 
  number, 
  condition = "healthy",
  toothData,
  isHighlighted = false,
  isSelected = false,
  onClick,
  onSurfaceClick,
  showLabels = true,
  size = "md",
  numberingSystem = "universal",
  isChild = false,
  editable = false
}) => {
  const sizeClasses = {
    sm: "w-7 h-9 md:w-8 md:h-10",
    md: "w-9 h-11 md:w-10 md:h-12", 
    lg: "w-11 h-13 md:w-12 md:h-14"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const color = conditionColors[condition];
  const toothName = toothNames[number] || `Tooth ${number}`;
  
  // Get display number based on numbering system
  const getDisplayNumber = () => {
    switch (numberingSystem) {
      case 'palmer':
        return universalToPalmer(number, isChild);
      case 'fdi':
        return universalToFDI(number, isChild);
      default:
        return number.toString();
    }
  };

  // Get surface condition color
  const getSurfaceColor = (surface: ToothSurface): string => {
    if (!toothData?.surfaces) return conditionColors['healthy'];
    const surfaceCondition = toothData.surfaces.find(s => s.surface === surface);
    return surfaceCondition ? conditionColors[surfaceCondition.condition] : conditionColors['healthy'];
  };

  // Check if surface has condition
  const hasSurfaceCondition = (surface: ToothSurface): boolean => {
    if (!toothData?.surfaces) return false;
    const surfaceCondition = toothData.surfaces.find(s => s.surface === surface);
    return surfaceCondition ? surfaceCondition.condition !== 'healthy' : false;
  };

  const handleSurfaceClick = (surface: ToothSurface, event: React.MouseEvent) => {
    event.stopPropagation();
    if (editable && onSurfaceClick) {
      onSurfaceClick(surface);
    }
  };

  // Determine if tooth is in upper or lower jaw
  const isUpperTooth = () => {
    if (isChild) {
      // Child teeth: upper (51-65), lower (71-85)
      return (number >= 51 && number <= 65);
    } else {
      // Adult teeth: upper (1-16), lower (17-32)
      return (number >= 1 && number <= 16);
    }
  };

  // Determine if tooth is on the right side of mouth (patient's right)
  const isRightSide = () => {
    if (isChild) {
      // Child teeth: right side (51-55, 81-85), left side (61-65, 71-75)
      return (number >= 51 && number <= 55) || (number >= 81 && number <= 85);
    } else {
      // Adult teeth: right side (1-8, 25-32), left side (9-16, 17-24)
      return (number >= 1 && number <= 8) || (number >= 25 && number <= 32);
    }
  };
  
  return (
    <div 
      className={cn(
        "relative group cursor-pointer transition-all duration-200",
        onClick && "hover:scale-105"
      )}
      onClick={onClick}
      title={`${toothName} - ${condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
    >
      {/* Tooth Image with surface areas */}
      <div 
        className={cn(
          "relative transition-all duration-200",
          isSelected && "ring-2 ring-blue-500 ring-offset-2",
          isHighlighted && "ring-2 ring-yellow-400 ring-offset-1",
          onClick && "hover:shadow-lg"
        )}
      >
        {/* Real Tooth Image */}
        <ToothImage
          toothNumber={number}
          condition={condition}
          size={size}
          isChild={isChild}
          className="relative z-0"
        />
        
        {/* Overlay container for surface interactions */}
        <div 
          className={cn(
            sizeClasses[size],
            "absolute inset-0 z-10"
          )}
        >
        {/* Surface areas for interaction */}
        {editable && condition !== "missing" && (
          <>
            {/* Occlusal/Incisal surface */}
            <div
              className={cn(
                isUpperTooth() 
                  ? "absolute bottom-0 left-1/4 right-1/4 h-1/3 hover:bg-blue-200 hover:bg-opacity-50 transition-colors"
                  : "absolute top-0 left-1/4 right-1/4 h-1/3 hover:bg-blue-200 hover:bg-opacity-50 transition-colors",
                hasSurfaceCondition('occlusal') && "border border-red-400"
              )}
              onClick={(e) => handleSurfaceClick('occlusal', e)}
              title="Occlusal/Incisal surface"
              style={{ 
                backgroundColor: hasSurfaceCondition('occlusal') ? getSurfaceColor('occlusal') + '40' : 'transparent'
              }}
            />
            
            {/* Mesial surface (toward midline) */}
            <div
              className={cn(
                isRightSide()
                  ? "absolute top-1/4 right-0 w-1/3 bottom-1/4 hover:bg-blue-200 hover:bg-opacity-50 transition-colors"
                  : "absolute top-1/4 left-0 w-1/3 bottom-1/4 hover:bg-blue-200 hover:bg-opacity-50 transition-colors",
                hasSurfaceCondition('mesial') && "border border-red-400"
              )}
              onClick={(e) => handleSurfaceClick('mesial', e)}
              title="Mesial surface (toward midline)"
              style={{ 
                backgroundColor: hasSurfaceCondition('mesial') ? getSurfaceColor('mesial') + '40' : 'transparent'
              }}
            />
            
            {/* Distal surface (away from midline) */}
            <div
              className={cn(
                isRightSide()
                  ? "absolute top-1/4 left-0 w-1/3 bottom-1/4 hover:bg-blue-200 hover:bg-opacity-50 transition-colors"
                  : "absolute top-1/4 right-0 w-1/3 bottom-1/4 hover:bg-blue-200 hover:bg-opacity-50 transition-colors",
                hasSurfaceCondition('distal') && "border border-red-400"
              )}
              onClick={(e) => handleSurfaceClick('distal', e)}
              title="Distal surface (away from midline)"
              style={{ 
                backgroundColor: hasSurfaceCondition('distal') ? getSurfaceColor('distal') + '40' : 'transparent'
              }}
            />
            
            {/* Buccal surface (toward cheek) */}
            <div
              className={cn(
                "absolute top-1/3 left-1/3 right-1/3 bottom-1/3 hover:bg-blue-200 hover:bg-opacity-50 transition-colors",
                hasSurfaceCondition('buccal') && "border border-red-400"
              )}
              onClick={(e) => handleSurfaceClick('buccal', e)}
              title="Buccal surface"
              style={{ 
                backgroundColor: hasSurfaceCondition('buccal') ? getSurfaceColor('buccal') + '40' : 'transparent'
              }}
            />
            
            {/* Lingual surface */}
            <div
              className={cn(
                isUpperTooth()
                  ? "absolute top-0 left-1/4 right-1/4 h-1/3 hover:bg-blue-200 hover:bg-opacity-50 transition-colors"
                  : "absolute bottom-0 left-1/4 right-1/4 h-1/3 hover:bg-blue-200 hover:bg-opacity-50 transition-colors",
                hasSurfaceCondition('lingual') && "border border-red-400"
              )}
              onClick={(e) => handleSurfaceClick('lingual', e)}
              title={isUpperTooth() ? "Lingual surface (palatal)" : "Lingual surface"}
              style={{ 
                backgroundColor: hasSurfaceCondition('lingual') ? getSurfaceColor('lingual') + '40' : 'transparent'
              }}
            />
          </>
        )}

        {/* Tooth number label */}
        {showLabels && (
          <div 
            className={cn(
              "absolute inset-0 flex items-center justify-center font-bold pointer-events-none",
              textSizeClasses[size],
              condition === "missing" ? "text-gray-400" : "text-gray-800",
              "z-20"
            )}
            style={{
              textShadow: "1px 1px 2px rgba(255,255,255,0.8)"
            }}
          >
            {getDisplayNumber()}
          </div>
        )}
        </div>
      </div>
      
      {/* Surface condition indicators */}
      {toothData?.surfaces && toothData.surfaces.length > 0 && (
        <div className="absolute -top-2 -left-1 flex flex-wrap gap-0.5">
          {toothData.surfaces
            .filter(surface => surface.condition !== 'healthy')
            .slice(0, 3)
            .map((surface, index) => (
              <div 
                key={surface.surface}
                className="w-2 h-2 rounded-full border border-white text-xs"
                style={{ backgroundColor: conditionColors[surface.condition] }}
                title={`${surface.surface} - ${surface.condition}`}
              />
            ))}
        </div>
      )}
      
      {/* Main condition indicator dot */}
      {condition !== "healthy" && condition !== "missing" && (
        <div 
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white"
          style={{ backgroundColor: color }}
        />
      )}

      {/* Mobility indicator */}
      {toothData?.mobility && toothData.mobility > 0 && (
        <div className="absolute -bottom-1 -left-1 w-4 h-2 bg-red-500 text-white text-xs flex items-center justify-center rounded">
          M{toothData.mobility}
        </div>
      )}
      
      {/* Enhanced tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] min-w-max shadow-lg border">
        <div className="font-semibold">{toothName}</div>
        <div className="text-muted-foreground capitalize">
          Overall: {condition.replace('_', ' ')}
        </div>
        {toothData?.surfaces && toothData.surfaces.length > 0 && (
          <div className="text-muted-foreground text-xs mt-1">
            Surfaces: {toothData.surfaces.map(s => `${s.surface.charAt(0).toUpperCase()}:${s.condition}`).join(', ')}
          </div>
        )}
        {toothData?.mobility && toothData.mobility > 0 && (
          <div className="text-destructive text-xs">
            Mobility: Grade {toothData.mobility}
          </div>
        )}
        {editable && (
          <div className="text-primary text-xs mt-1">
            Click surfaces to edit conditions
          </div>
        )}
      </div>
    </div>
  );
};

const ToothChart: React.FC<ToothChartProps> = ({ 
  odontogram, 
  onToothClick, 
  editable = false,
  highlightTooth,
  showLabels = true,
  numberingSystem = "universal"
}) => {
  const isChild = odontogram?.patient_type === "child";
  const layout = isChild ? childTeethLayout : adultTeethLayout;
  
  // Get condition for a specific tooth
  const getToothCondition = (toothNumber: number): DentalConditionType => {
    if (!odontogram) return "healthy";
    
    const toothCondition = odontogram.teeth_conditions?.find(
      tooth => tooth.tooth_number === toothNumber
    );
    
    return toothCondition?.overall_condition || "healthy";
  };

  // Get tooth data for a specific tooth
  const getToothData = (toothNumber: number): ToothCondition | undefined => {
    if (!odontogram) return undefined;
    
    return odontogram.teeth_conditions?.find(
      tooth => tooth.tooth_number === toothNumber
    );
  };

  const handleToothClick = (toothNumber: number) => {
    if (editable && onToothClick) {
      onToothClick(toothNumber);
    }
  };

  const handleSurfaceClick = (toothNumber: number, surface: ToothSurface) => {
    if (editable && onToothClick) {
      // Pass both tooth number and surface information
      onToothClick(toothNumber, surface);
    }
  };

  return (
    <div className="bg-card p-3 md:p-6 rounded-lg border w-full max-w-none overflow-hidden">
      {/* Header with numbering system info */}
      <div className="mb-4 md:mb-6 pb-3 md:pb-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-card-foreground">Dental Chart</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              {isChild ? "Primary Teeth" : "Permanent Teeth"} • {numberingSystem.toUpperCase()} Numbering
            </p>
          </div>
          {editable && (
            <div className="text-xs md:text-sm text-primary bg-primary/10 px-2 md:px-3 py-1 rounded-full text-center flex-shrink-0">
              Interactive Mode: Touch teeth or surfaces to edit
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 md:space-y-8 min-w-max">
        {/* Upper jaw */}
        <div className="space-y-2">
          <h3 className="text-xs md:text-sm font-medium text-gray-700 text-center">Upper Jaw</h3>
          <div className="flex justify-center space-x-2 md:space-x-6 min-w-max">
            {/* Upper right */}
            <div className="flex space-x-0.5 md:space-x-1">
              {layout.upper.right.map((toothNumber) => (
                <Tooth
                  key={toothNumber}
                  number={toothNumber}
                  condition={getToothCondition(toothNumber)}
                  toothData={getToothData(toothNumber)}
                  isHighlighted={highlightTooth === toothNumber}
                  onClick={editable ? () => handleToothClick(toothNumber) : undefined}
                  onSurfaceClick={editable ? (surface) => handleSurfaceClick(toothNumber, surface) : undefined}
                  showLabels={showLabels}
                  numberingSystem={numberingSystem}
                  isChild={isChild}
                  editable={editable}
                  size="sm"
                />
              ))}
            </div>
            
            {/* Center line */}
            <div className="w-px h-8 md:h-12 bg-gray-300 flex-shrink-0" />
            
            {/* Upper left */}
            <div className="flex space-x-0.5 md:space-x-1">
              {layout.upper.left.map((toothNumber) => (
                <Tooth
                  key={toothNumber}
                  number={toothNumber}
                  condition={getToothCondition(toothNumber)}
                  toothData={getToothData(toothNumber)}
                  isHighlighted={highlightTooth === toothNumber}
                  onClick={editable ? () => handleToothClick(toothNumber) : undefined}
                  onSurfaceClick={editable ? (surface) => handleSurfaceClick(toothNumber, surface) : undefined}
                  showLabels={showLabels}
                  numberingSystem={numberingSystem}
                  isChild={isChild}
                  editable={editable}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Gum line separator */}
        <div className="flex justify-center">
          <div className="w-80 md:w-96 h-px bg-gray-400 flex-shrink-0" />
        </div>

        {/* Lower jaw - patient's right on viewer's left, patient's left on viewer's right (anatomical orientation) */}
        <div className="space-y-2">
          <div className="flex justify-center space-x-2 md:space-x-6 min-w-max">
            {/* Lower right (patient's right) - displayed on viewer's left */}
            <div className="flex space-x-0.5 md:space-x-1">
              {layout.lower.right.map((toothNumber) => (
                <Tooth
                  key={toothNumber}
                  number={toothNumber}
                  condition={getToothCondition(toothNumber)}
                  toothData={getToothData(toothNumber)}
                  isHighlighted={highlightTooth === toothNumber}
                  onClick={editable ? () => handleToothClick(toothNumber) : undefined}
                  onSurfaceClick={editable ? (surface) => handleSurfaceClick(toothNumber, surface) : undefined}
                  showLabels={showLabels}
                  numberingSystem={numberingSystem}
                  isChild={isChild}
                  editable={editable}
                  size="sm"
                />
              ))}
            </div>
            
            {/* Center line */}
            <div className="w-px h-8 md:h-12 bg-gray-300 flex-shrink-0" />
            
            {/* Lower left (patient's left) - displayed on viewer's right */}
            <div className="flex space-x-0.5 md:space-x-1">
              {layout.lower.left.map((toothNumber) => (
                <Tooth
                  key={toothNumber}
                  number={toothNumber}
                  condition={getToothCondition(toothNumber)}
                  toothData={getToothData(toothNumber)}
                  isHighlighted={highlightTooth === toothNumber}
                  onClick={editable ? () => handleToothClick(toothNumber) : undefined}
                  onSurfaceClick={editable ? (surface) => handleSurfaceClick(toothNumber, surface) : undefined}
                  showLabels={showLabels}
                  numberingSystem={numberingSystem}
                  isChild={isChild}
                  editable={editable}
                  size="sm"
                />
              ))}
            </div>
          </div>
          <h3 className="text-xs md:text-sm font-medium text-gray-700 text-center">Lower Jaw</h3>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Condition Legend</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-1 text-xs">
          {Object.entries(conditionColors).map(([condition, color]) => (
            <div key={condition} className="flex items-center space-x-1 min-w-0">
              <div 
                className="w-3 h-3 rounded border flex-shrink-0"
                style={{ backgroundColor: color, borderColor: color }}
              />
              <span className="text-gray-600 capitalize leading-tight truncate">
                {condition.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Patient info */}
      {odontogram && (
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs md:text-sm text-gray-600">
            <div>
              Patient: {odontogram.patient_id?.full_name || 
                       `${odontogram.patient_id?.first_name || ''} ${odontogram.patient_id?.last_name || ''}`.trim() || 
                       'Unknown Patient'} (Age: {odontogram.patient_id?.age || 'N/A'})
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div>
                Type: {isChild ? "Primary Teeth" : "Permanent Teeth"}
              </div>
              <div>
                Version: {odontogram.version}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToothChart;
