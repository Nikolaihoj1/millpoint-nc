/**
 * Setup Sheet Editor Component
 * Allows creating and editing setup sheets
 * Following Cursor Clause 4.5 Rules
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { setupSheetsApi } from '../api';
import { useSetupSheets } from '../hooks';
import type { SetupSheet, Tool, OriginOffset, Fixture, SetupSheetMedia } from '../types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  X,
  Wrench,
  Camera,
  Video,
  CheckSquare,
  AlertCircle,
} from 'lucide-react';

interface SetupSheetEditorProps {
  programId: string;
  machineId: string;
  machineType: string;
  existingSetupSheet?: SetupSheet | null;
  onSave?: (setupSheet: SetupSheet) => void;
  onCancel?: () => void;
}

export function SetupSheetEditor({
  programId,
  machineId,
  machineType,
  existingSetupSheet,
  onSave,
  onCancel,
}: SetupSheetEditorProps) {
  // Fetch existing setup sheet if not provided
  const { setupSheets } = useSetupSheets(programId);
  const currentSetupSheet = existingSetupSheet || (setupSheets && setupSheets.length > 0 ? setupSheets[0] : null);
  const [savedSetupSheetId, setSavedSetupSheetId] = useState<string | null>(currentSetupSheet?.id || null);

  const [tools, setTools] = useState<Tool[]>(currentSetupSheet?.tools || [
    { toolNumber: 1, toolName: '', length: 0, offsetH: 0, offsetD: 0, comment: '' },
  ]);
  const [originOffsets, setOriginOffsets] = useState<OriginOffset[]>(
    currentSetupSheet?.originOffsets || [
      { name: '', x: 0, y: 0, z: 0, a: 0, b: 0, c: 0 },
    ]
  );
  const [fixtures, setFixtures] = useState<Fixture[]>(
    currentSetupSheet?.fixtures || [
      { fixtureId: '', quantity: 1, setupDescription: '' },
    ]
  );
  const [media, setMedia] = useState<SetupSheetMedia[]>(
    currentSetupSheet?.media || []
  );
  const [safetyChecklist, setSafetyChecklist] = useState<string[]>(
    currentSetupSheet?.safetyChecklist || [
      'Kontroller sikkerhedsbriller',
      'Verificer spindelhastighed',
      'Check kølevæskeniveau',
      'Inspicer værktøjer for skader',
      'Bekræft nødstop funktion',
    ]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const addTool = () => {
    const nextToolNumber = tools.length > 0 
      ? Math.max(...tools.map(t => t.toolNumber)) + 1 
      : 1;
    setTools([...tools, {
      toolNumber: nextToolNumber,
      toolName: '',
      length: 0,
      offsetH: 0,
      offsetD: 0,
      comment: '',
    }]);
  };

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const updateTool = (index: number, field: keyof Tool, value: any) => {
    const updated = [...tools];
    updated[index] = { ...updated[index], [field]: value };
    setTools(updated);
  };

  const addOriginOffset = () => {
    setOriginOffsets([...originOffsets, {
      name: '',
      x: 0,
      y: 0,
      z: 0,
      a: 0,
      b: 0,
      c: 0,
    }]);
  };

  const removeOriginOffset = (index: number) => {
    setOriginOffsets(originOffsets.filter((_, i) => i !== index));
  };

  const updateOriginOffset = (index: number, field: keyof OriginOffset, value: any) => {
    const updated = [...originOffsets];
    updated[index] = { ...updated[index], [field]: value };
    setOriginOffsets(updated);
  };

  const addFixture = () => {
    setFixtures([...fixtures, { fixtureId: '', quantity: 1, setupDescription: '' }]);
  };

  const removeFixture = (index: number) => {
    setFixtures(fixtures.filter((_, i) => i !== index));
  };

  const updateFixture = (index: number, field: keyof Fixture, value: any) => {
    const updated = [...fixtures];
    updated[index] = { ...updated[index], [field]: value };
    setFixtures(updated);
  };

  const addSafetyChecklistItem = () => {
    setSafetyChecklist([...safetyChecklist, '']);
  };

  const removeSafetyChecklistItem = (index: number) => {
    setSafetyChecklist(safetyChecklist.filter((_, i) => i !== index));
  };

  const updateSafetyChecklistItem = (index: number, value: string) => {
    const updated = [...safetyChecklist];
    updated[index] = value;
    setSafetyChecklist(updated);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Need setup sheet ID - use savedSetupSheetId if available
    const setupSheetId = savedSetupSheetId || currentSetupSheet?.id;
    if (!setupSheetId) {
      setError('Du skal gemme opsætningsarket først, før du kan uploade filer');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fileArray = Array.from(files);
      const response = await setupSheetsApi.uploadMedia(setupSheetId, fileArray);

      if (response.success && response.data) {
        // Add uploaded media to local state
        const newMedia = response.data.map((item) => ({
          id: item.id,
          type: item.type,
          url: item.url,
          caption: item.caption || '',
          annotations: [],
          order: media.length,
        }));
        setMedia([...media, ...newMedia]);
      } else {
        throw new Error(response.error || 'Kunne ikke uploade filer');
      }
    } catch (err: any) {
      console.error('Error uploading files:', err);
      setError(err.message || 'Fejl ved upload af filer');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    const setupSheetId = savedSetupSheetId || currentSetupSheet?.id;
    if (!setupSheetId) return;

    try {
      const response = await setupSheetsApi.deleteMedia(setupSheetId, mediaId);
      if (response.success) {
        setMedia(media.filter((m) => m.id !== mediaId));
      } else {
        throw new Error(response.error || 'Kunne ikke slette fil');
      }
    } catch (err: any) {
      console.error('Error deleting media:', err);
      setError(err.message || 'Fejl ved sletning af fil');
    }
  };

  const handleSave = async () => {
    // Validation
    if (!machineId || machineId.trim() === '' || machineId.length < 36) {
      setError('Machine ID er ikke korrekt. Kontroller at programmet har en maskine tildelt.');
      return;
    }
    if (tools.length === 0) {
      setError('Mindst ét værktøj er påkrævet');
      return;
    }
    if (originOffsets.length === 0) {
      setError('Mindst ét nulpunktsoffset er påkrævet');
      return;
    }
    if (originOffsets.some(o => !o.name || o.name.trim() === '')) {
      setError('Alle nulpunktsoffsets skal have et navn');
      return;
    }
    if (tools.some(t => !t.toolName || t.toolName.trim() === '')) {
      setError('Alle værktøjer skal have et navn');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const setupSheetData = {
        programId,
        machineId,
        machineType,
        tools: tools.filter(t => t.toolName.trim() !== ''),
        originOffsets: originOffsets.filter(o => o.name.trim() !== ''),
        fixtures: fixtures.filter(f => f.fixtureId.trim() !== ''),
        media: media
          .filter(m => m.url && m.url.trim() !== '') // Filter out media without URLs
          .map((m, idx) => ({
            type: m.type,
            url: m.url,
            caption: m.caption || '',
            annotations: m.annotations || [],
            order: idx,
          })),
        safetyChecklist: safetyChecklist.filter(s => s.trim() !== ''),
      };

      console.log('Creating setup sheet with data:', JSON.stringify(setupSheetData, null, 2));

      let result;
      if (currentSetupSheet) {
        // Update existing
        const response = await setupSheetsApi.update(currentSetupSheet.id, setupSheetData);
        if (!response.success) {
          throw new Error(response.error || 'Kunne ikke opdatere opsætningsark');
        }
        result = response.data;
      } else {
        // Create new
        const response = await setupSheetsApi.create(setupSheetData);
        if (!response.success) {
          throw new Error(response.error || 'Kunne ikke oprette opsætningsark');
        }
        result = response.data;
      }

      onSave?.(result as SetupSheet);
      
      // Store setup sheet ID for file uploads
      if (result && (result as any).id) {
        setSavedSetupSheetId((result as any).id);
      }
    } catch (err: any) {
      console.error('Error saving setup sheet:', err);
      setError(err.message || 'Fejl ved gemning');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {currentSetupSheet ? 'Rediger Opsætningsark' : 'Opret Opsætningsark'}
            </h2>
            <p className="text-muted-foreground">
              Maskine: {machineType}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Annuller
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Gemmer...' : 'Gem Opsætningsark'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Fejl</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Tools */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Værktøjer
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addTool}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tilføj Værktøj
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tools.map((tool, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Værktøj {tool.toolNumber}</h4>
                    {tools.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTool(idx)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Værktøjsnavn *</label>
                      <Input
                        value={tool.toolName}
                        onChange={(e) => updateTool(idx, 'toolName', e.target.value)}
                        placeholder="F.eks. Face Mill Ø100mm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Længde (mm)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={tool.length}
                        onChange={(e) => updateTool(idx, 'length', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">H Offset</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={tool.offsetH}
                        onChange={(e) => updateTool(idx, 'offsetH', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">D Offset</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={tool.offsetD}
                        onChange={(e) => updateTool(idx, 'offsetD', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Kommentar</label>
                      <Input
                        value={tool.comment || ''}
                        onChange={(e) => updateTool(idx, 'comment', e.target.value)}
                        placeholder="F.eks. TiAlN coated"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Origin Offsets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nulpunktsoffsets</CardTitle>
                <Button variant="outline" size="sm" onClick={addOriginOffset}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tilføj Offset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {originOffsets.map((offset, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Offset Navn</label>
                      <Input
                        value={offset.name}
                        onChange={(e) => updateOriginOffset(idx, 'name', e.target.value)}
                        placeholder="F.eks. G54, G55, Preset, etc."
                        className="max-w-xs"
                      />
                    </div>
                    {originOffsets.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOriginOffset(idx)}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">X</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={offset.x}
                        onChange={(e) => updateOriginOffset(idx, 'x', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Y</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={offset.y}
                        onChange={(e) => updateOriginOffset(idx, 'y', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Z</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={offset.z}
                        onChange={(e) => updateOriginOffset(idx, 'z', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">A</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={offset.a || 0}
                        onChange={(e) => updateOriginOffset(idx, 'a', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">B</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={offset.b || 0}
                        onChange={(e) => updateOriginOffset(idx, 'b', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">C</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={offset.c || 0}
                        onChange={(e) => updateOriginOffset(idx, 'c', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fixtures */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fiksturer</CardTitle>
                <Button variant="outline" size="sm" onClick={addFixture}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tilføj Fikstur
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fixtures.map((fixture, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Fikstur {idx + 1}</h4>
                    {fixtures.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFixture(idx)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fikstur ID</label>
                      <Input
                        value={fixture.fixtureId}
                        onChange={(e) => updateFixture(idx, 'fixtureId', e.target.value)}
                        placeholder="F.eks. FIX-001"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Antal</label>
                      <Input
                        type="number"
                        min="1"
                        value={fixture.quantity}
                        onChange={(e) => updateFixture(idx, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Opsætningsbeskrivelse</label>
                      <Input
                        value={fixture.setupDescription || ''}
                        onChange={(e) => updateFixture(idx, 'setupDescription', e.target.value)}
                        placeholder="F.eks. Montér emne i maskinklemme med 4 kæber"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Safety Checklist */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Sikkerheds- & Tjekliste
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addSafetyChecklistItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tilføj Punkt
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {safetyChecklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateSafetyChecklistItem(idx, e.target.value)}
                    placeholder="F.eks. Kontroller sikkerhedsbriller"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSafetyChecklistItem(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Opsætningsfotos & Videoer ({media.length} filer)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="media-upload"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  disabled={uploading || (!savedSetupSheetId && !currentSetupSheet)}
                />
                <label
                  htmlFor="media-upload"
                    className={`cursor-pointer flex flex-col items-center gap-2 ${
                      uploading || (!savedSetupSheetId && !currentSetupSheet)
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:text-primary'
                    }`}
                >
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {uploading ? 'Uploader...' : 'Klik for at uploade'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {!savedSetupSheetId && !currentSetupSheet
                        ? 'Gem først opsætningsarket'
                        : 'Billeder eller videoer (max 50MB pr. fil)'}
                    </p>
                  </div>
                </label>
              </div>

              {media.length > 0 && (
                <div className="space-y-2 mt-4">
                  {media.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="flex items-center gap-3 p-2 border rounded-lg group hover:bg-accent transition-colors"
                    >
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        {item.type === 'image' ? (
                          <Camera className="h-5 w-5" />
                        ) : (
                          <Video className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.caption || `Medie ${idx + 1}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.type === 'image' ? 'Billede' : 'Video'}
                        </p>
                      </div>
                      {(savedSetupSheetId || currentSetupSheet) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => item.id && handleDeleteMedia(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <label className="text-muted-foreground">Program ID</label>
                <p className="font-mono text-xs break-all">{programId}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Maskine</label>
                <p className="font-medium">{machineType}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Værktøjer</label>
                <p className="font-medium">{tools.filter(t => t.toolName.trim() !== '').length}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Nulpunktsoffsets</label>
                <p className="font-medium">{originOffsets.length}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Fiksturer</label>
                <p className="font-medium">{fixtures.filter(f => f.fixtureId.trim() !== '').length}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Sikkerhedspunkter</label>
                <p className="font-medium">{safetyChecklist.filter(s => s.trim() !== '').length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

