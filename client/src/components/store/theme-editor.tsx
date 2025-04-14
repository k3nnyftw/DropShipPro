import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { 
  Palette, 
  Type, 
  Layout, 
  Image, 
  Save,
  RotateCcw
} from 'lucide-react';

export type ThemeOptions = {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseSize: number;
  };
  layout: {
    contentWidth: number;
    spacing: number;
    borderRadius: number;
  };
  header: {
    style: 'minimal' | 'centered' | 'modern';
    showSearch: boolean;
  };
  footer: {
    columns: number;
    showSocial: boolean;
  };
}

interface StoreThemeEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTheme?: Partial<ThemeOptions>;
  onSave: (theme: ThemeOptions) => void;
}

const defaultTheme: ThemeOptions = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6366f1',
    accent: '#f43f5e',
    background: '#ffffff',
    text: '#374151',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    baseSize: 16,
  },
  layout: {
    contentWidth: 1200,
    spacing: 16,
    borderRadius: 8,
  },
  header: {
    style: 'modern',
    showSearch: true,
  },
  footer: {
    columns: 3,
    showSocial: true,
  },
};

export function StoreThemeEditor({
  open,
  onOpenChange,
  initialTheme,
  onSave,
}: StoreThemeEditorProps) {
  const { toast } = useToast();
  const [theme, setTheme] = useState<ThemeOptions>({
    ...defaultTheme,
    ...initialTheme,
  });
  const [activeTab, setActiveTab] = useState('colors');

  const handleReset = () => {
    setTheme(defaultTheme);
    toast({
      title: 'Theme reset',
      description: 'All theme settings have been reset to default values',
    });
  };

  const handleSave = () => {
    onSave(theme);
    toast({
      title: 'Theme saved',
      description: 'Your theme changes have been applied to your store',
    });
    onOpenChange(false);
  };

  const updateTheme = (category: keyof ThemeOptions, key: string, value: any) => {
    setTheme((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Store Theme</DialogTitle>
          <DialogDescription>
            Customize how your online store looks to customers
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="colors" className="flex items-center">
              <Palette className="h-4 w-4 mr-2" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center">
              <Type className="h-4 w-4 mr-2" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center">
              <Layout className="h-4 w-4 mr-2" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="header-footer" className="flex items-center">
              <Image className="h-4 w-4 mr-2" />
              Header & Footer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <div 
                    className="w-8 h-8 rounded border border-gray-200" 
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <Input 
                    id="primary-color" 
                    type="text" 
                    value={theme.colors.primary}
                    onChange={(e) => updateTheme('colors', 'primary', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <div 
                    className="w-8 h-8 rounded border border-gray-200" 
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <Input 
                    id="secondary-color" 
                    type="text" 
                    value={theme.colors.secondary}
                    onChange={(e) => updateTheme('colors', 'secondary', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accent-color">Accent Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <div 
                    className="w-8 h-8 rounded border border-gray-200" 
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                  <Input 
                    id="accent-color" 
                    type="text" 
                    value={theme.colors.accent}
                    onChange={(e) => updateTheme('colors', 'accent', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="background-color">Background Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <div 
                    className="w-8 h-8 rounded border border-gray-200" 
                    style={{ backgroundColor: theme.colors.background }}
                  />
                  <Input 
                    id="background-color" 
                    type="text" 
                    value={theme.colors.background}
                    onChange={(e) => updateTheme('colors', 'background', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="text-color">Text Color</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <div 
                    className="w-8 h-8 rounded border border-gray-200" 
                    style={{ backgroundColor: theme.colors.text }}
                  />
                  <Input 
                    id="text-color" 
                    type="text" 
                    value={theme.colors.text}
                    onChange={(e) => updateTheme('colors', 'text', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h3 className="font-medium text-sm mb-2">Preview</h3>
              <div className="p-4 rounded-lg shadow-sm" style={{ backgroundColor: theme.colors.background }}>
                <h4 className="text-lg font-bold" style={{ color: theme.colors.primary }}>Color Scheme Preview</h4>
                <p className="text-sm" style={{ color: theme.colors.text }}>This is how your text will appear on your site.</p>
                <div className="flex space-x-2 mt-2">
                  <Button 
                    className="text-white" 
                    style={{ backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }}
                  >
                    Primary Button
                  </Button>
                  <Button 
                    variant="outline" 
                    style={{ color: theme.colors.secondary, borderColor: theme.colors.secondary }}
                  >
                    Secondary
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="heading-font">Heading Font</Label>
                <select 
                  id="heading-font"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={theme.typography.headingFont}
                  onChange={(e) => updateTheme('typography', 'headingFont', e.target.value)}
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Oswald">Oswald</option>
                  <option value="Playfair Display">Playfair Display</option>
                </select>
              </div>

              <div>
                <Label htmlFor="body-font">Body Font</Label>
                <select 
                  id="body-font"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={theme.typography.bodyFont}
                  onChange={(e) => updateTheme('typography', 'bodyFont', e.target.value)}
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                </select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="base-size">Base Font Size: {theme.typography.baseSize}px</Label>
                <Slider
                  id="base-size"
                  defaultValue={[theme.typography.baseSize]}
                  min={12}
                  max={20}
                  step={1}
                  onValueChange={(value) => updateTheme('typography', 'baseSize', value[0])}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h3 className="font-medium text-sm mb-2">Typography Preview</h3>
              <div 
                className="p-4 rounded-lg shadow-sm bg-white"
                style={{ fontFamily: theme.typography.bodyFont, fontSize: `${theme.typography.baseSize}px` }}
              >
                <h1 
                  className="text-2xl font-bold mb-2" 
                  style={{ fontFamily: theme.typography.headingFont }}
                >
                  Heading Example
                </h1>
                <p className="mb-2">This is an example of how your body text will look. Proper typography is crucial for readability and user experience.</p>
                <p className="text-sm">This is a smaller text example, such as captions or notes.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="content-width">Content Width: {theme.layout.contentWidth}px</Label>
                <Slider
                  id="content-width"
                  defaultValue={[theme.layout.contentWidth]}
                  min={800}
                  max={1600}
                  step={50}
                  onValueChange={(value) => updateTheme('layout', 'contentWidth', value[0])}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="spacing">Element Spacing: {theme.layout.spacing}px</Label>
                <Slider
                  id="spacing"
                  defaultValue={[theme.layout.spacing]}
                  min={8}
                  max={32}
                  step={2}
                  onValueChange={(value) => updateTheme('layout', 'spacing', value[0])}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="border-radius">Border Radius: {theme.layout.borderRadius}px</Label>
                <Slider
                  id="border-radius"
                  defaultValue={[theme.layout.borderRadius]}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={(value) => updateTheme('layout', 'borderRadius', value[0])}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h3 className="font-medium text-sm mb-2">Layout Preview</h3>
              <div 
                className="mx-auto bg-white p-4 shadow-sm"
                style={{ 
                  maxWidth: `${Math.min(theme.layout.contentWidth, 600)}px`,
                  padding: `${theme.layout.spacing}px`,
                  borderRadius: `${theme.layout.borderRadius}px`
                }}
              >
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((item) => (
                    <div 
                      key={item}
                      className="bg-gray-100 aspect-square flex items-center justify-center"
                      style={{ borderRadius: `${theme.layout.borderRadius}px` }}
                    >
                      Box {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="header-footer" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Header Style</Label>
                <RadioGroup 
                  value={theme.header.style} 
                  onValueChange={(value) => updateTheme('header', 'style', value)}
                  className="grid grid-cols-3 gap-4 mt-2"
                >
                  <div>
                    <RadioGroupItem 
                      value="minimal" 
                      id="header-minimal" 
                      className="sr-only" 
                    />
                    <Label
                      htmlFor="header-minimal"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      data-state={theme.header.style === 'minimal' ? "checked" : "unchecked"}
                    >
                      <div className="w-full h-6 bg-gray-200 mb-2 flex items-center px-2">
                        <div className="w-8 h-2 bg-gray-400 rounded-full mr-auto"></div>
                        <div className="w-16 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                      <span className="block w-full text-center">Minimal</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="centered" 
                      id="header-centered" 
                      className="sr-only" 
                    />
                    <Label
                      htmlFor="header-centered"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      data-state={theme.header.style === 'centered' ? "checked" : "unchecked"}
                    >
                      <div className="w-full flex flex-col items-center mb-2">
                        <div className="w-12 h-2 bg-gray-400 rounded-full mb-2"></div>
                        <div className="w-24 h-2 bg-gray-200 rounded-full"></div>
                      </div>
                      <span className="block w-full text-center">Centered</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="modern" 
                      id="header-modern" 
                      className="sr-only" 
                    />
                    <Label
                      htmlFor="header-modern"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      data-state={theme.header.style === 'modern' ? "checked" : "unchecked"}
                    >
                      <div className="w-full h-10 bg-gray-200 mb-2 flex flex-col justify-center px-2">
                        <div className="w-full flex justify-between items-center">
                          <div className="w-8 h-2 bg-gray-400 rounded-full"></div>
                          <div className="w-16 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <div className="w-full flex justify-center mt-2">
                          <div className="w-24 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                      </div>
                      <span className="block w-full text-center">Modern</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-search"
                  checked={theme.header.showSearch}
                  onChange={(e) => updateTheme('header', 'showSearch', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="show-search" className="text-sm">Show Search Bar in Header</Label>
              </div>

              <Separator className="my-4" />

              <div>
                <Label htmlFor="footer-columns" className="text-base font-medium">Footer Columns: {theme.footer.columns}</Label>
                <Slider
                  id="footer-columns"
                  defaultValue={[theme.footer.columns]}
                  min={1}
                  max={4}
                  step={1}
                  onValueChange={(value) => updateTheme('footer', 'columns', value[0])}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-social"
                  checked={theme.footer.showSocial}
                  onChange={(e) => updateTheme('footer', 'showSocial', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="show-social" className="text-sm">Show Social Media Icons in Footer</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center mt-6 pt-6 border-t">
          <div>
            <Button variant="outline" onClick={handleReset} className="mr-2" type="button">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
          <div>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2" type="button">
              Cancel
            </Button>
            <Button onClick={handleSave} type="button">
              <Save className="h-4 w-4 mr-2" />
              Save Theme
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}