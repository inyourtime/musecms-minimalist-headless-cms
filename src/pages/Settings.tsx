import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Key, Trash2, Download, Upload, Send } from 'lucide-react';
import { Toaster, toast } from '@/components/ui/sonner';
import { useUser } from '@/stores/auth';
import { api } from '@/lib/api-client';
export function Settings() {
  const user = useUser();
  const [siteTitle, setSiteTitle] = useState('MuseCMS');
  const [apiKeys, setApiKeys] = useState([{ key: 'mock-key-xxxx-xxxx-xxxx', label: 'Default Key' }]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateApiKey = () => {
    const newKey = `mock-key-${Math.random().toString(36).substring(2, 15)}`;
    setApiKeys([...apiKeys, { key: newKey, label: 'New Key' }]);
    toast.success('New API Key generated!');
  };
  const handleExport = async () => {
    try {
      toast.info('Exporting data...');
      const data = await api('/api/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `musecms-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Export successful!');
    } catch (error) {
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') throw new Error('Invalid file content');
        const data = JSON.parse(content);
        toast.info('Importing data...');
        await api('/api/import', { method: 'POST', body: JSON.stringify(data) });
        toast.success('Import successful! Data will be available shortly.');
      } catch (error) {
        toast.error(`Import failed: ${error instanceof Error ? error.message : 'Invalid JSON file'}`);
      }
    };
    reader.readAsText(file);
  };
  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast.warning('Please enter a webhook URL.');
      return;
    }
    try {
      toast.info('Sending test webhook...');
      await api('/api/webhooks', { method: 'POST', body: JSON.stringify({ event: 'test', from: 'MuseCMS' }) });
      toast.success('Test webhook sent successfully!');
    } catch (error) {
      toast.error(`Webhook test failed: ${error instanceof Error ? error.message : 'Could not send'}`);
    }
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>Manage your project's general settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteTitle">Site Title</Label>
                  <Input id="siteTitle" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} />
                </div>
                <Button onClick={() => toast.success('Settings saved (mock)!')}>Save Changes</Button>
              </CardContent>
            </Card>
            <Accordion type="single" collapsible className="w-full">
              <Card>
                <AccordionItem value="api-keys" className="border-b-0">
                  <AccordionTrigger className="px-6">
                    <CardHeader className="p-0 text-left">
                      <CardTitle>API Keys</CardTitle>
                      <CardDescription>Manage API keys for accessing your content.</CardDescription>
                    </CardHeader>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-4">
                      {apiKeys.map((apiKey, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                          <div className="flex items-center gap-3">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-mono text-sm">{apiKey.key}</p>
                              <p className="text-xs text-muted-foreground">{apiKey.label}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="mt-4" onClick={generateApiKey}>Generate New Key</Button>
                  </AccordionContent>
                </AccordionItem>
              </Card>
              <Card>
                <AccordionItem value="webhooks" className="border-b-0">
                  <AccordionTrigger className="px-6">
                     <CardHeader className="p-0 text-left">
                      <CardTitle>Webhooks</CardTitle>
                      <CardDescription>Configure webhooks to receive event notifications.</CardDescription>
                    </CardHeader>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 space-y-4">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input id="webhookUrl" placeholder="https://example.com/webhook" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
                      <Button variant="secondary" onClick={handleTestWebhook}><Send className="mr-2 h-4 w-4" /> Test</Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
              <Card>
                <AccordionItem value="data-management" className="border-b-0">
                  <AccordionTrigger className="px-6">
                     <CardHeader className="p-0 text-left">
                      <CardTitle>Data Management</CardTitle>
                      <CardDescription>Export or import your site's content.</CardDescription>
                    </CardHeader>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export Content</Button>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Import Content</Button>
                      <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            </Accordion>
          </motion.div>
        </div>
      </div>
      <Toaster richColors />
    </AppLayout>
  );
}