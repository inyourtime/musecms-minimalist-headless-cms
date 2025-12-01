import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Key, Trash2, Download, Upload } from 'lucide-react';
import { Toaster, toast } from '@/components/ui/sonner';
export function Settings() {
  const [siteTitle, setSiteTitle] = useState('MuseCMS');
  const [apiKeys, setApiKeys] = useState([{ key: 'mock-key-xxxx-xxxx-xxxx', label: 'Default Key' }]);
  const generateApiKey = () => {
    const newKey = `mock-key-${Math.random().toString(36).substring(2, 15)}`;
    setApiKeys([...apiKeys, { key: newKey, label: 'New Key' }]);
    toast.success('New API Key generated!');
  };
  const handleExport = () => {
    const data = { message: "This is a mock export." };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'musecms-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.info('Exporting mock data...');
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          <div className="space-y-8">
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
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage API keys for accessing your content.</CardDescription>
              </CardHeader>
              <CardContent>
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
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4" onClick={generateApiKey}>
                  Generate New Key
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Export or import your site's content.</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" /> Export Content
                </Button>
                <Button variant="outline" disabled>
                  <Upload className="mr-2 h-4 w-4" /> Import Content
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster richColors />
    </AppLayout>
  );
}