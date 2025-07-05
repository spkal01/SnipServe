
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi, PasteAnalytics } from '@/utils/admin-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BarChart2, TrendingUp, Users, Eye } from 'lucide-react';

const Analytics = () => {
  const { apiKey } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<PasteAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analyticsData = await adminApi.getPasteAnalytics(undefined, apiKey || undefined) as PasteAnalytics[];
        setAnalytics(analyticsData);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch analytics',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [apiKey, toast]);

  const totalViews = analytics.reduce((sum, p) => sum + p.total_views, 0);
  const totalUniqueViews = analytics.reduce((sum, p) => sum + p.unique_ips, 0);
  const recentViews = analytics.reduce((sum, p) => sum + p.recent_views, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Detailed insights into paste views and user engagement
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-3xl font-bold text-foreground">{totalViews.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Visitors</p>
                <p className="text-3xl font-bold text-foreground">{totalUniqueViews.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent Views</p>
                <p className="text-3xl font-bold text-foreground">{recentViews}</p>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Pastes */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart2 className="w-5 h-5 mr-2" />
            Most Popular Pastes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics
              .sort((a, b) => b.total_views - a.total_views)
              .slice(0, 10)
              .map((paste, index) => (
                <div key={paste.paste_id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{paste.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{paste.total_views.toLocaleString()} total views</span>
                      <span>{paste.unique_ips.toLocaleString()} unique visitors</span>
                      <span>{paste.authenticated_views} authenticated views</span>
                      <span>{paste.recent_views} recent views</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {((paste.total_views / totalViews) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">of total</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
