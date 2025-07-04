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
    window.scrollTo(0, 0);
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-6 text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - moved down much more */}
      <div className="pt-16 lg:pt-32 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-lg text-muted-foreground">Manage your pastes and API access</p>
        </div>
      </div>

      {/* Container with responsive padding and proper spacing */}
      <div className="pb-16">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="shadow-lg border">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <Link to="/create" className="block">
                      <Button 
                        size="lg" 
                        className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-base font-medium"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        New Paste
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* API Key Management */}
                <Card className="shadow-lg border">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">API Access</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      Use your API key to create and manage pastes programmatically.
                    </div>
                    
                    {(showApiKey && newApiKey) ? (
                      <div className="p-4 bg-muted rounded-lg border border-dashed border-border">
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-mono break-all pr-2">
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
                      <div className="p-4 bg-muted rounded-lg">
                        <code className="text-sm font-mono">••••••••••••••••</code>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="default"
                      onClick={handleRefreshApiKey}
                      disabled={isRefreshingKey}
                      className="w-full h-10"
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
                <Card className="shadow-lg border">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="py-6 p-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-orange-600 mb-2">
                        {pastes.length}
                      </div>
                      <div className="text-base text-muted-foreground">Total Pastes</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg border">
                <CardHeader className="pb-6 p-6">
                  <CardTitle className="text-2xl mb-4">Your Pastes</CardTitle>
                  
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search your pastes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 py-3 text-base h-12"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {filteredPastes.length === 0 ? (
                    <div className="text-center py-16">
                      {pastes.length === 0 ? (
                        <div>
                          <p className="text-lg text-muted-foreground mb-6">You haven't created any pastes yet.</p>
                          <Link to="/create">
                            <Button 
                              size="lg" 
                              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-base h-12 px-6"
                            >
                              Create Your First Paste
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <p className="text-lg text-muted-foreground">No pastes match your search.</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredPastes.map((paste) => (
                        <div
                          key={paste.id}
                          className="p-6 border border-border rounded-lg hover:shadow-lg transition-all duration-200 hover:border-orange-200 dark:hover:border-orange-800"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            <div className="flex-1">
                              <Link
                                to={`/paste/${paste.id}`}
                                className="text-xl font-semibold text-foreground hover:text-orange-600 transition-colors"
                              >
                                {paste.title}
                              </Link>
                              <div className="flex items-center gap-6 mt-3 text-base text-muted-foreground">
                                <span>{formatDate(paste.created_at)}</span>
                                <span>{paste.view_count || 0} views</span>
                                <div className="flex items-center gap-2">
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
                              <p className="text-base text-muted-foreground mt-2 line-clamp-2">
                                {paste.content.substring(0, 150)}
                                {paste.content.length > 150 && '...'}
                              </p>
                            </div>
                            
                            <div className="flex gap-3 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="default"
                                onClick={() => copyToClipboard(`${window.location.origin}/paste/${paste.id}`, 'Paste URL')}
                              >
                                {copied === 'Paste URL' ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                              
                              <Link to={`/paste/${paste.id}/edit`}>
                                <Button variant="outline" size="default">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="default"
                                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:text-red-400 dark:hover:border-red-800"
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
    </div>
  );
};

export default Dashboard;
