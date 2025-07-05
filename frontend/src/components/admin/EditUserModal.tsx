import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { adminApi, AdminUser } from '@/utils/admin-api';
import { Loader2, UserCog, AlertTriangle } from 'lucide-react';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: (user: AdminUser) => void;
  user: AdminUser | null;
  apiKey?: string;
}

interface UpdateUserRequest {
  username: string;
  password?: string;
  is_admin: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  onOpenChange,
  onUserUpdated,
  user,
  apiKey
}) => {
  const [formData, setFormData] = useState<UpdateUserRequest>({
    username: '',
    password: '',
    is_admin: false
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Populate form when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: '',
        is_admin: user.is_admin
      });
      setConfirmPassword('');
      setChangePassword(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validation
    if (!formData.username.trim()) {
      toast({
        title: 'Error',
        description: 'Username is required',
        variant: 'destructive',
      });
      return;
    }

    // Password validation only if changing password
    if (changePassword) {
      if (!formData.password?.trim()) {
        toast({
          title: 'Error',
          description: 'Password is required when changing password',
          variant: 'destructive',
        });
        return;
      }

      if (formData.password !== confirmPassword) {
        toast({
          title: 'Error',
          description: 'Passwords do not match',
          variant: 'destructive',
        });
        return;
      }

      if (formData.password.length < 6) {
        toast({
          title: 'Error',
          description: 'Password must be at least 6 characters long',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      // Prepare update data
      const updateData: any = {
        username: formData.username.trim(),
        is_admin: formData.is_admin
      };

      // Only include password if changing it
      if (changePassword && formData.password) {
        updateData.password = formData.password;
      }

      const updatedUser = await adminApi.updateUser(user.username, updateData, apiKey);
      
      toast({
        title: 'Success',
        description: `User "${updatedUser.username}" updated successfully!`,
        duration: 3000,
      });

      onUserUpdated(updatedUser);
      onOpenChange(false);
      
      // Reset form
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', is_admin: false });
    setConfirmPassword('');
    setChangePassword(false);
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      resetForm();
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-orange-500" />
            Edit User: {user.username}
          </DialogTitle>
          <DialogDescription>
            Update user information and permissions. Leave password fields empty to keep current password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-username">Username</Label>
            <Input
              id="edit-username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter username"
              disabled={isLoading}
              required
            />
          </div>

          {/* Change Password Toggle */}
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/30">
            <Switch
              id="changePassword"
              checked={changePassword}
              onCheckedChange={setChangePassword}
              disabled={isLoading}
            />
            <Label htmlFor="changePassword" className="text-sm">
              Change password
            </Label>
          </div>

          {/* Password fields - only show when changing password */}
          {changePassword && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter new password (min. 6 characters)"
                  disabled={isLoading}
                  required={changePassword}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-confirmPassword">Confirm New Password</Label>
                <Input
                  id="edit-confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={isLoading}
                  required={changePassword}
                />
              </div>
            </>
          )}

          {/* Admin privileges */}
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/30">
            <Switch
              id="edit-isAdmin"
              checked={formData.is_admin}
              onCheckedChange={(checked) => setFormData({ ...formData, is_admin: checked })}
              disabled={isLoading}
            />
            <Label htmlFor="edit-isAdmin" className="text-sm">
              Grant admin privileges
            </Label>
          </div>

          {/* Warning for admin changes */}
          {formData.is_admin !== user.is_admin && (
            <div className="flex items-start space-x-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  {formData.is_admin ? 'Granting' : 'Removing'} admin privileges
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  {formData.is_admin 
                    ? 'This user will have full administrative access to the system.'
                    : 'This user will lose administrative access and become a regular user.'
                  }
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;