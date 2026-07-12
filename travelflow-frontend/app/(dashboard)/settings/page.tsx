"use client";

import { useState } from "react";
import { Settings, Building2, Bell, Palette, Save, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved successfully");
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-[var(--tf-surface)] p-6 rounded-xl border border-tf-border shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--tf-surface-2)] flex items-center justify-center">
          <Settings className="w-6 h-6 text-tf-text-secondary" />
        </div>
        <div className="flex-1">
          <h1 className="tf-h2 text-tf-text-primary">Settings</h1>
          <p className="tf-body text-tf-text-secondary mt-1">
            Manage your agency configuration, branding, and preferences.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)] hidden sm:flex"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="bg-[var(--tf-surface)] border border-tf-border p-1 rounded-lg w-full justify-start h-auto flex-wrap sm:flex-nowrap mb-6 shadow-sm">
          <TabsTrigger
            value="company"
            className="flex-1 sm:flex-none data-[state=active]:bg-[var(--tf-primary-soft)] data-[state=active]:text-tf-primary py-2.5 px-4 rounded-md"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Company
          </TabsTrigger>
          <TabsTrigger
            value="branding"
            className="flex-1 sm:flex-none data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 py-2.5 px-4 rounded-md"
          >
            <Palette className="w-4 h-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex-1 sm:flex-none data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 py-2.5 px-4 rounded-md"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6 mt-0">
          <div className="bg-[var(--tf-surface)] rounded-xl border border-tf-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-tf-border bg-[var(--tf-surface-2)]/30">
              <h2 className="tf-h3 text-tf-text-primary">Company Details</h2>
              <p className="tf-body-sm text-tf-text-secondary mt-1">
                Basic information about your travel agency.
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="agencyName"
                    className="text-tf-text-primary font-medium"
                  >
                    Agency Name
                  </Label>
                  <Input
                    id="agencyName"
                    defaultValue="Prestige Travel"
                    className="bg-[var(--tf-bg)] border-tf-border focus-visible:ring-[var(--tf-primary)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="registrationNo"
                    className="text-tf-text-primary font-medium"
                  >
                    Registration No. (Optional)
                  </Label>
                  <Input
                    id="registrationNo"
                    defaultValue="TRV-2023-0891"
                    className="bg-[var(--tf-bg)] border-tf-border focus-visible:ring-[var(--tf-primary)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-tf-text-primary font-medium"
                  >
                    Support Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="support@prestigetravel.com"
                    className="bg-[var(--tf-bg)] border-tf-border focus-visible:ring-[var(--tf-primary)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-tf-text-primary font-medium"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue="+92 21 111 222 333"
                    className="bg-[var(--tf-bg)] border-tf-border focus-visible:ring-[var(--tf-primary)]"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="address"
                    className="text-tf-text-primary font-medium"
                  >
                    Headquarters Address
                  </Label>
                  <Input
                    id="address"
                    defaultValue="Suite 400, Business Avenue, Main Boulevard, Karachi"
                    className="bg-[var(--tf-bg)] border-tf-border focus-visible:ring-[var(--tf-primary)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6 mt-0">
          <div className="bg-[var(--tf-surface)] rounded-xl border border-tf-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-tf-border bg-violet-50/30">
              <h2 className="tf-h3 text-tf-text-primary">
                Branding & Appearance
              </h2>
              <p className="tf-body-sm text-tf-text-secondary mt-1">
                Customize how your dashboard looks.
              </p>
            </div>
            <div className="p-6 space-y-8">
              <div>
                <Label className="text-tf-text-primary font-medium block mb-4">
                  Agency Logo
                </Label>
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-lg bg-[var(--tf-surface-2)] border border-tf-border flex items-center justify-center overflow-hidden">
                    <span className="text-3xl font-bold text-tf-primary">
                      PT
                    </span>
                  </div>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="border-tf-border text-tf-text-primary hover:bg-[var(--tf-surface-2)]"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-tf-text-muted">
                      Recommended size: 256x256px. Max 2MB.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-[var(--tf-border)]" />

              <div>
                <Label className="text-tf-text-primary font-medium block mb-4">
                  Brand Color
                </Label>
                <div className="flex gap-4">
                  {[
                    "#2563eb",
                    "#16a34a",
                    "#dc2626",
                    "#9333ea",
                    "#ea580c",
                    "#0f172a",
                  ].map((color, i) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-full border-2 ${i === 0 ? "border-[var(--tf-text-primary)]" : "border-transparent"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-0">
          <div className="bg-[var(--tf-surface)] rounded-xl border border-tf-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-tf-border bg-amber-50/30">
              <h2 className="tf-h3 text-tf-text-primary">
                Notification Preferences
              </h2>
              <p className="tf-body-sm text-tf-text-secondary mt-1">
                Choose what alerts you want to receive.
              </p>
            </div>
            <div className="p-0">
              <div className="p-6 border-b border-tf-border flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-tf-text-primary">
                    New Lead Alerts
                  </h4>
                  <p className="text-sm text-tf-text-secondary">
                    Get notified when a new lead is assigned to you.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="p-6 border-b border-tf-border flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-tf-text-primary">
                    Booking Confirmations
                  </h4>
                  <p className="text-sm text-tf-text-secondary">
                    Receive emails when a booking status changes to confirmed.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-tf-text-primary">
                    Daily Summary
                  </h4>
                  <p className="text-sm text-tf-text-secondary">
                    A daily email summarizing new leads and bookings.
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="sm:hidden flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[var(--tf-primary)] text-white w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
