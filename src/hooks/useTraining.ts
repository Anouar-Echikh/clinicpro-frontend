import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { trainingApi, Training, TrainingProgress, trainingHelpers } from '@/lib/api/training';

export const useTraining = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [userProgress, setUserProgress] = useState<TrainingProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all trainings
  const fetchTrainings = useCallback(async (role?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { trainings } = await trainingApi.getTrainings(role);
      setTrainings(trainings);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch trainings');
      console.error('Error fetching trainings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user progress
  const fetchUserProgress = useCallback(async (role?: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const { progress } = await trainingApi.getUserProgress(role);
      setUserProgress(progress);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch progress');
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Start training
  const startTraining = useCallback(async (trainingId: string, role?: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    try {
      const { progress } = await trainingApi.startTraining({ trainingId, role });
      setUserProgress(prev => [...prev, progress]);
      return progress;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to start training';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update module progress
  const updateModuleProgress = useCallback(async (
    progressId: string,
    moduleId: string,
    completed: boolean,
    lessonsCompleted?: string[],
    progressPercentage?: number
  ) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    try {
      const { progress } = await trainingApi.updateModuleProgress(progressId, {
        moduleId,
        completed,
        lessonsCompleted,
        progressPercentage
      });
      
      setUserProgress(prev => 
        prev.map(p => p._id === progressId ? progress : p)
      );
      return progress;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update progress';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Complete training
  const completeTraining = useCallback(async (progressId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    try {
      const { progress } = await trainingApi.completeTraining(progressId);
      setUserProgress(prev => 
        prev.map(p => p._id === progressId ? progress : p)
      );
      return progress;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to complete training';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Issue certificate
  const issueCertificate = useCallback(async (progressId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    try {
      const { progress, certificate } = await trainingApi.issueCertificate(progressId);
      setUserProgress(prev => 
        prev.map(p => p._id === progressId ? progress : p)
      );
      return { progress, certificate };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to issue certificate';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get training by role
  const getTrainingByRole = useCallback(async (role: string) => {
    setLoading(true);
    setError(null);
    try {
      const { training } = await trainingApi.getTrainingByRole(role);
      return training;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch training');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions
  const getProgressForTraining = useCallback((trainingId: string) => {
    return userProgress.find(p => 
      typeof p.training_id === 'string' 
        ? p.training_id === trainingId 
        : p.training_id._id === trainingId
    );
  }, [userProgress]);

  const getTrainingCompletionPercentage = useCallback((trainingId: string) => {
    const progress = getProgressForTraining(trainingId);
    return progress ? progress.overall_progress : 0;
  }, [getProgressForTraining]);

  const isTrainingStarted = useCallback((trainingId: string) => {
    return !!getProgressForTraining(trainingId);
  }, [getProgressForTraining]);

  const isTrainingCompleted = useCallback((trainingId: string) => {
    const progress = getProgressForTraining(trainingId);
    return progress?.is_completed || false;
  }, [getProgressForTraining]);

  return {
    // Data
    trainings,
    userProgress,
    
    // Loading states
    loading,
    error,
    
    // Actions
    fetchTrainings,
    fetchUserProgress,
    startTraining,
    updateModuleProgress,
    completeTraining,
    issueCertificate,
    getTrainingByRole,
    
    // Helpers
    getProgressForTraining,
    getTrainingCompletionPercentage,
    isTrainingStarted,
    isTrainingCompleted,
    
    // Utility functions from trainingHelpers
    calculateProgress: trainingHelpers.calculateProgress,
    getNextModule: trainingHelpers.getNextModule,
    isTrainingCompletedHelper: trainingHelpers.isTrainingCompleted,
    getRoleDisplayName: trainingHelpers.getRoleDisplayName,
    formatDuration: trainingHelpers.formatDuration,
    getModuleCompletionRate: trainingHelpers.getModuleCompletionRate,
    getEstimatedTimeRemaining: trainingHelpers.getEstimatedTimeRemaining,
    getTrainingStatus: trainingHelpers.getTrainingStatus,
    generateCertificateData: trainingHelpers.generateCertificateData,
  };
};

export default useTraining; 