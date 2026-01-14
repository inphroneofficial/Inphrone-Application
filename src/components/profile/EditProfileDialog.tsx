import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, UploadCloud, Loader2 } from "lucide-react";

interface EditProfileDialogProps {
  trigger?: React.ReactNode;
  profile: any;
  onUpdated?: () => void;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ trigger, profile, onUpdated }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState(profile?.city || "");
  const [stateRegion, setStateRegion] = useState(profile?.state_region || "");
  const [country, setCountry] = useState(profile?.country || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setCity(profile?.city || "");
      setStateRegion(profile?.state_region || "");
      setCountry(profile?.country || "");
    }
  }, [open, profile]);

  const onDetectLocation = async () => {
    try {
      if (!navigator.geolocation) {
        toast({ variant: "destructive", title: "Location not supported", description: "Your browser doesn't support geolocation." });
        return;
      }
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              // Reverse geocode using Nominatim (no key required)
              const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=10&addressdetails=1`;
              const res = await fetch(url, { headers: { "Accept": "application/json" } });
              const data = await res.json();
              const addr = data?.address || {};
              setCity(addr.city || addr.town || addr.village || "");
              setStateRegion(addr.state || addr.region || "");
              setCountry(addr.country || "");
              toast({ title: "Location detected", description: `${addr.city || addr.town || addr.village || ''} ${addr.state || ''}` });
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          (err) => reject(err),
          { enableHighAccuracy: false, timeout: 10000 }
        );
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Detection failed", description: "Couldn't detect location. Please enter manually." });
    }
  };

  const onUploadAvatar = async () => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (!file) {
        toast({ variant: "destructive", title: "No file selected" });
        return;
      }
      const path = `${user.id}/avatar-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const { error: updErr } = await supabase.from('profiles').update({ profile_picture: pub.publicUrl }).eq('id', user.id);
      if (updErr) throw updErr;
      toast({ title: "Avatar updated" });
      onUpdated?.();
      setOpen(false);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Upload failed", description: e.message });
    } finally {
      setUploading(false);
    }
  };

  const onSaveLocation = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from('profiles').update({ city, state_region: stateRegion, country }).eq('id', user.id);
      if (error) throw error;
      toast({ title: "Location updated" });
      onUpdated?.();
      setOpen(false);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save failed", description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Edit Profile</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-2">
          <div className="grid gap-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-3">
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <Button onClick={onUploadAvatar} disabled={uploading} className="min-w-[120px]">
                {uploading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading</>) : (<><UploadCloud className="w-4 h-4 mr-2" />Upload</>)}
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Location</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input placeholder="State/Region" value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} />
              <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <Button type="button" variant="secondary" onClick={onDetectLocation} className="mt-2 w-fit">
              <MapPin className="w-4 h-4 mr-2" /> Auto-detect location
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onSaveLocation} disabled={saving}>
            {saving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving</>) : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
