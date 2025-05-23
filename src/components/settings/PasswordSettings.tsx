import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { supabaseSimple as supabase } from '@/integrations/supabase/simple-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PasswordSettingsProps {
  onPasswordChange?: (currentPassword: string, newPassword: string) => Promise<void>;
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters long." }),
  confirmNewPassword: z.string().min(1, { message: "Please confirm your new password." }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match.",
  path: ["confirmNewPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const PasswordSettings = ({ onPasswordChange }: PasswordSettingsProps) => {
  const { user, updatePassword } = useAuth();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    if (!user?.email) {
      toast({ title: "Error", description: "User email not found.", variant: "destructive" });
      return;
    }

    setIsVerifying(true);
    try {
      if (onPasswordChange) {
        await onPasswordChange(data.currentPassword, data.newPassword);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: data.currentPassword,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
             toast({ title: "Verification Failed", description: "Incorrect current password.", variant: "destructive" });
          } else {
             toast({ title: "Verification Failed", description: signInError.message, variant: "destructive" });
          }
          return;
        }

        await updatePassword(data.newPassword);
      }

      form.reset();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your account security.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Enter your current password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Enter your new password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Confirm your new password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isVerifying}>
              {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default PasswordSettings;
