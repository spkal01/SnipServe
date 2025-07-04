import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, Paste } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Copy, Edit, Trash2, ArrowLeft, Check, Lock, Globe } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ViewPaste = () => {
  const { id } = useParams<{ id: string }>();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, apiKey } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchPaste();
    }
  }, [id, apiKey]);

  const fetchPaste = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const data = await api.getPaste(id, apiKey || undefined);
      setPaste(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load paste',
        variant: 'destructive',
      });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (paste) {
      await navigator.clipboard.writeText(paste.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Paste content copied to clipboard',
      });
    }
  };

  const copyUrl = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    toast({
      title: 'Copied!',
      description: 'Paste URL copied to clipboard',
    });
  };

  const handleDelete = async () => {
    if (!paste || !id) return;
    
    setIsDeleting(true);
    try {
      await api.deletePaste(id, apiKey || undefined);
      toast({
        title: 'Success',
        description: 'Paste deleted successfully',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete paste',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading paste...</p>
        </div>
      </div>
    );
  }

  if (!paste) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Paste Not Found</h1>
          <Link to="/">
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              Go Back Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === paste.user_id;
  const createdDate = new Date(paste.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground mb-2">
                    {paste.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>By {paste.username}</span>
                    <span>•</span>
                    <span>{createdDate}</span>
                    <span>•</span>
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
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={copyUrl}
                    className="hover:bg-muted"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={copyToClipboard}
                    className="hover:bg-muted"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    Copy
                  </Button>
                  
                  {isOwner && (
                    <>
                      <Link to={`/paste/${paste.id}/edit`}>
                        <Button
                          variant="outline"
                          className="hover:bg-muted"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:text-red-400 dark:hover:border-red-800"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
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
                              onClick={handleDelete}
                              disabled={isDeleting}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-0">
            <pre className="p-6 bg-muted rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap text-foreground">
              {paste.content}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewPaste;
