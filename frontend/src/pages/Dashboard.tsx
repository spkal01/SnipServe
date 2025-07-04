import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, Paste } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Copy, Edit, Trash2, RefreshCw, Search, Globe, Lock, Check } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const Dashboard = () => {
  const [pastes, setPastes] = useState<Paste[]>([]);
  const [filteredPastes, setFilteredPastes] = useState<Paste[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [isRefreshingKey, setIsRefreshingKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { user, apiKey, refreshApiKey } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPastes();
    }
  }, [user, apiKey]);

  useEffect(() => {
    // Filter pastes based on search query
    if (searchQuery.trim()) {
      const filtered = pastes.filter(paste =>
        paste.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paste.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPastes(filtered);
    } else {
      setFilteredPastes(pastes);
    }
  }, [pastes, searchQuery]);

  const fetchPastes = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyPastes(apiKey || undefined);
      setPastes(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load pastes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshApiKey = async () => {
    setIsRefreshingKey(true);
    try {
      const key = await refreshApiKey();
      setNewApiKey(key);
      setShowApiKey(true);
      toast({
        title: 'Success',
        description: 'API key refreshed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to refresh API key',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshingKey(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: 'Copied!',
      description: `${type} copied to clipboard`,
    });
  };

  const handleDeletePaste = async (pasteId: string) => {
    try {
      await api.deletePaste(pasteId, apiKey || undefined);
      toast({
        title: 'Success',
        description: 'Paste deleted successfully',
      });
      setPastes(prev => prev.filter(p => p.id !== pasteId));
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete paste',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-muted-foreground">Manage your pastes and API access</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/create" className="block">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      <Plus className="w-4 h-4 mr-2" />
                      New Paste
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* API Key Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Use your API key to create and manage pastes programmatically.
                  </div>
                  
                  {(showApiKey && newApiKey) ? (
                    <div className="p-3 bg-muted rounded border-2 border-dashed border-border">
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-mono break-all pr-2">
                          {newApiKey}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(newApiKey, 'API key')}
                        >
                          {copied === 'API key' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-muted rounded">
                      <code className="text-xs font-mono">••••••••••••••••</code>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshApiKey}
                    disabled={isRefreshingKey}
                    className="w-full"
                  >
                    {isRefreshingKey ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Refresh Key
                  </Button>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {pastes.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Pastes</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Your Pastes</CardTitle>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search your pastes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {filteredPastes.length === 0 ? (
                  <div className="text-center py-12">
                    {pastes.length === 0 ? (
                      <div>
                        <p className="text-muted-foreground mb-4">You haven't created any pastes yet.</p>
                        <Link to="/create">
                          <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                            Create Your First Paste
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No pastes match your search.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPastes.map((paste) => (
                      <div
                        key={paste.id}
                        className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1">
                            <Link
                              to={`/paste/${paste.id}`}
                              className="text-lg font-semibold text-foreground hover:text-orange-600 transition-colors"
                            >
                              {paste.title}
                            </Link>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>{formatDate(paste.created_at)}</span>
                              <div className="flex items-center gap-1">
                                {paste.hidden ? (
                                  <>
                                    <Lock className="w-4 h-4" />
                                    <span>Private</span>
                                  </>
                                ) : (
                                  <>
                                    <Globe className="w-4 h-4" />
                                    <span>Public</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {paste.content.substring(0, 100)}
                              {paste.content.length > 100 && '...'}
                            </p>
                          </div>
                          
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(`${window.location.origin}/paste/${paste.id}`, 'Paste URL')}
                            >
                              {copied === 'Paste URL' ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            
                            <Link to={`/paste/${paste.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Paste</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{paste.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePaste(paste.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
