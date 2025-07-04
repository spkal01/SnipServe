import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, Paste } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

const EditPaste = () => {
  const { id } = useParams<{ id: string }>();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hidden, setHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
      
      // Check if user owns this paste
      if (user && user.id !== data.user_id) {
        toast({
          title: 'Access Denied',
          description: 'You can only edit your own pastes',
          variant: 'destructive',
        });
        navigate(`/paste/${id}`);
        return;
      }
      
      setPaste(data);
      setTitle(data.title);
      setContent(data.content);
      setHidden(data.hidden);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load paste',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide both title and content',
        variant: 'destructive',
      });
      return;
    }

    if (!id) return;

    setIsSaving(true);
    try {
      await api.updatePaste(id, {
        title: title.trim(),
        content: content.trim(),
        hidden,
      }, apiKey || undefined);

      toast({
        title: 'Success',
        description: 'Paste updated successfully!',
      });
      
      navigate(`/paste/${id}`);
    } catch (error) {
      toast({
        title: 'Failed to Update Paste',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading paste...</p>
        </div>
      </div>
    );
  }

  if (!paste) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Paste Not Found</h1>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/paste/${id}`)}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Paste
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Edit Paste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your paste a descriptive title"
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your code or text here..."
                  className="min-h-[400px] font-mono text-sm"
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hidden"
                  checked={hidden}
                  onCheckedChange={setHidden}
                  disabled={isSaving}
                />
                <Label htmlFor="hidden" className="text-sm">
                  Private paste (requires authentication to view)
                </Label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 flex-1"
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/paste/${id}`)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditPaste;
