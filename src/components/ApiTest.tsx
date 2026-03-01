import React from 'react';
import { useHealthCheck } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const ApiTest: React.FC = () => {
  const { data, isLoading, error } = useHealthCheck();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          API Connection Test
          {isLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : error ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Failed
            </Badge>
          ) : (
            <Badge variant="default" className="flex items-center gap-1 bg-green-600">
              <CheckCircle className="h-3 w-3" />
              Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to connect to backend API. Make sure the backend server is running on port 5000.
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        
        {data && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Status:</span>
              <span className="text-sm">{data.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Timestamp:</span>
              <span className="text-sm">{new Date(data.timestamp).toLocaleString()}</span>
            </div>
            <div className="text-xs text-green-600 mt-2">
              ✅ Backend API is running and accessible
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiTest; 