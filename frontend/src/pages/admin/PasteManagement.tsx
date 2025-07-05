
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi, AdminPaste } from '@/utils/admin-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/utils/api';
import { 
  Search, 
  Eye, 
  Lock, 
  Globe, 
  ExternalLink, 
  Edit, 
  Trash2,
  MoreHorizontal,
  Calendar
} from 'lucide-react';

const PasteManagement = () => {
  const { apiKey } = useAuth();
  const { toast } = useToast();
  const [pastes, setPastes] = useState<AdminPaste[]>([]);
  const [filteredPastes, setFilteredPastes] = useState<AdminPaste[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPastes = async () => {
      try {
        const pasteData = await adminApi.getAllPastes(apiKey || undefined);
        setPastes(pasteData);
        setFilteredPastes(pasteData);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch pastes',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPastes();
  }, [apiKey, toast]);

  useEffect(() => {
    const filtered = pastes.filter(paste =>
      paste.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paste.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paste.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPastes(filtered);
  }, [searchTerm, pastes]);

  const handleDeletePaste = async (pasteId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await api.deletePaste(pasteId, apiKey || undefined);
      setPastes(pastes.filter(p => p.id !== pasteId));
      toast({
        title: 'Success',
        description: `Paste "${title}" has been deleted.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete paste',
        variant: 'destructive',
      });
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-muted rounded w-48 mb-2"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paste Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all pastes in the system
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search pastes by title, author, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                All ({pastes.length})
              </Button>
              <Button variant="outline" size="sm">
                Public ({pastes.filter(p => !p.hidden).length})
              </Button>
              <Button variant="outline" size="sm">
                Private ({pastes.filter(p => p.hidden).length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pastes Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>
            Pastes ({filteredPastes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title & Content</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Privacy</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPastes.map((paste) => (
                  <TableRow key={paste.id} className="hover:bg-muted/50">
                    <TableCell className="max-w-xs">
                      <div>
                        <Link 
                          to={`/paste/${paste.id}`}
                          className="font-medium text-foreground hover:text-orange-500 transition-colors"
                        >
                          {truncateText(paste.title, 50)}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {truncateText(paste.content, 80)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {paste.username[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{paste.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {paste.hidden ? (
                        <Badge variant="secondary" className="text-orange-600">
                          <Lock className="w-3 h-3 mr-1" />
                          Private
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-green-600">
                          <Globe className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span>{paste.view_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-foreground">
                          {new Date(paste.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(paste.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Link to={`/paste/${paste.id}`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/paste/${paste.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePaste(paste.id, paste.title)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasteManagement;
