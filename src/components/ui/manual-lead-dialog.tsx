import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp, FieldValue } from 'firebase/firestore';
import { useAuth } from '@/lib/auth-context';
import { analyzeLead } from '@/lib/cron/leadAnalysis';
import { BusinessCardSubmissionDB, AdminAnnotation } from '@/types';

export function ManualLeadDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    organization: '',
    xHandle: '',
    note: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !user?.email) return;

    try {
      setLoading(true);
      
      const adminAnnotation: AdminAnnotation = {
        text: `Manually added by ${user.email}`,
        createdAt: Timestamp.now(),
        createdBy: user.email
      };

      const leadData: Omit<BusinessCardSubmissionDB, 'createdAt' | 'updatedAt'> & {
        createdAt: FieldValue;
        updatedAt: FieldValue;
      } = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isAnnotated: false,
        aiAnalysis: undefined,
        adminAnnotation
      };
      
      // Create the lead document
      const docRef = await addDoc(collection(db, 'leads'), leadData);

      // Trigger AI analysis
      analyzeLead({ ...leadData, id: docRef.id, createdAt: Timestamp.now() } as BusinessCardSubmissionDB & { id: string }).catch(err => {
        console.error('Error analyzing lead:', err);
      });

      // Reset form and close dialog
      setFormData({
        email: '',
        name: '',
        organization: '',
        xHandle: '',
        note: ''
      });
      setOpen(false);
    } catch (error) {
      console.error('Error adding lead:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1A1A1A] border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="font-satori">Add Lead Manually</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email *"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Organization"
              value={formData.organization}
              onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="X Handle (e.g. @username)"
              value={formData.xHandle}
              onChange={(e) => setFormData(prev => ({ ...prev, xHandle: e.target.value }))}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Notes"
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.email.trim() || !user?.email}
              className="bg-white text-black hover:bg-gray-100"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </div>
              ) : (
                'Add Lead'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 