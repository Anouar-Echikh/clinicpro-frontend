import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Clock,
  Calendar,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { transformUserToStaff } from "@/hooks/useStaff";

interface ManageScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: ReturnType<typeof transformUserToStaff> | null;
  onUpdate: (id: string, schedule: any) => Promise<void>;
}

const ManageScheduleModal: React.FC<ManageScheduleModalProps> = ({
  open,
  onOpenChange,
  staff,
  onUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState<any>({});

  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  // Initialize schedule when staff changes
  useEffect(() => {
    if (staff) {
      setSchedule(staff.schedule);
    }
  }, [staff]);

  const handleWorkingDayChange = (day: string, isWorking: boolean) => {
    setSchedule((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isWorking,
        // Set default times when enabling a day
        start: isWorking ? (prev[day]?.start || "09:00") : prev[day]?.start,
        end: isWorking ? (prev[day]?.end || "17:00") : prev[day]?.end,
      },
    }));
  };

  const handleTimeChange = (day: string, field: 'start' | 'end', value: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const getWorkingDaysCount = () => {
    return Object.values(schedule).filter((day: any) => day?.isWorking).length;
  };

  const getTotalHours = () => {
    let totalMinutes = 0;
    Object.values(schedule).forEach((day: any) => {
      if (day?.isWorking && day.start && day.end) {
        const startMinutes = timeToMinutes(day.start);
        const endMinutes = timeToMinutes(day.end);
        if (endMinutes > startMinutes) {
          totalMinutes += endMinutes - startMinutes;
        }
      }
    });
    return (totalMinutes / 60).toFixed(1);
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const validateSchedule = () => {
    for (const [day, daySchedule] of Object.entries(schedule)) {
      const dayData = daySchedule as any;
      if (dayData.isWorking) {
        if (!dayData.start || !dayData.end) {
          toast({
            title: "Validation Error",
            description: `Please set both start and end times for ${day}`,
            variant: "destructive",
          });
          return false;
        }
        
        const startMinutes = timeToMinutes(dayData.start);
        const endMinutes = timeToMinutes(dayData.end);
        
        if (endMinutes <= startMinutes) {
          toast({
            title: "Validation Error",
            description: `End time must be after start time for ${day}`,
            variant: "destructive",
          });
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staff || !validateSchedule()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the backend API to update the schedule
      await onUpdate(staff.id, schedule);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setStandardSchedule = (type: 'fullTime' | 'partTime') => {
    const standardSchedules = {
      fullTime: {
        monday: { start: "09:00", end: "17:00", isWorking: true },
        tuesday: { start: "09:00", end: "17:00", isWorking: true },
        wednesday: { start: "09:00", end: "17:00", isWorking: true },
        thursday: { start: "09:00", end: "17:00", isWorking: true },
        friday: { start: "09:00", end: "17:00", isWorking: true },
        saturday: { start: "00:00", end: "00:00", isWorking: false },
        sunday: { start: "00:00", end: "00:00", isWorking: false },
      },
      partTime: {
        monday: { start: "09:00", end: "13:00", isWorking: true },
        tuesday: { start: "09:00", end: "13:00", isWorking: true },
        wednesday: { start: "09:00", end: "13:00", isWorking: true },
        thursday: { start: "00:00", end: "00:00", isWorking: false },
        friday: { start: "00:00", end: "00:00", isWorking: false },
        saturday: { start: "00:00", end: "00:00", isWorking: false },
        sunday: { start: "00:00", end: "00:00", isWorking: false },
      },
    };
    
    setSchedule(standardSchedules[type]);
  };

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Manage Work Schedule
          </DialogTitle>
          <DialogDescription>
            Set working hours for {staff.firstName} {staff.lastName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Schedule Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Quick Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStandardSchedule('fullTime')}
                  size="sm"
                >
                  Full Time (9-5, Mon-Fri)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStandardSchedule('partTime')}
                  size="sm"
                >
                  Part Time (9-1, Mon-Wed)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Working Days:</span>
                  <span className="font-semibold ml-2">{getWorkingDaysCount()} days/week</span>
                </div>
                <div>
                  <span className="text-gray-500">Total Hours:</span>
                  <span className="font-semibold ml-2">{getTotalHours()} hours/week</span>
                </div>
                <div>
                  <span className="text-gray-500">Schedule Type:</span>
                  <span className="font-semibold ml-2">
                    {getWorkingDaysCount() >= 5 ? "Full Time" : "Part Time"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {daysOfWeek.map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 w-24">
                      <Checkbox
                        id={`working-${key}`}
                        checked={schedule[key]?.isWorking || false}
                        onCheckedChange={(checked) => 
                          handleWorkingDayChange(key, checked as boolean)
                        }
                      />
                      <Label htmlFor={`working-${key}`} className="font-medium">
                        {label}
                      </Label>
                    </div>
                    
                    {schedule[key]?.isWorking ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm">Start:</Label>
                          <Input
                            type="time"
                            value={schedule[key]?.start || "09:00"}
                            onChange={(e) => handleTimeChange(key, 'start', e.target.value)}
                            className="w-24"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm">End:</Label>
                          <Input
                            type="time"
                            value={schedule[key]?.end || "17:00"}
                            onChange={(e) => handleTimeChange(key, 'end', e.target.value)}
                            className="w-24"
                          />
                        </div>
                        <div className="text-sm text-gray-500">
                          ({schedule[key]?.start && schedule[key]?.end 
                            ? Math.max(0, (timeToMinutes(schedule[key].end) - timeToMinutes(schedule[key].start)) / 60).toFixed(1)
                            : "0"} hours)
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 text-gray-500 italic">
                        Off duty
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Schedule
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManageScheduleModal; 