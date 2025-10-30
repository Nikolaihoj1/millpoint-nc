/**
 * NC Code Editor Component
 * Uses Monaco Editor (VS Code editor) for editing G-code
 */

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Save, X, RotateCcw } from 'lucide-react';
import { programsApi } from '../api';
import { registerGCodeLanguage } from '../utils/gcode-language';

type GCodeVariant = 'auto' | 'fanuc' | 'heidenhain';

interface NCCodeEditorProps {
  programId: string;
  initialCode?: string;
  onSave?: (code: string) => void;
  onClose?: () => void;
  readOnly?: boolean;
  machineType?: string;
}

export function NCCodeEditor({ 
  programId, 
  initialCode = '', 
  onSave, 
  onClose,
  readOnly = false,
  machineType
}: NCCodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Detect G-code variant from machine type or code content
  const detectVariant = (): GCodeVariant => {
    if (machineType) {
      const lower = machineType.toLowerCase();
      if (lower.includes('heidenhain') || lower.includes('heiden')) {
        return 'heidenhain';
      }
      if (lower.includes('fanuc')) {
        return 'fanuc';
      }
    }
    
    // Auto-detect from code content
    if (code.includes('DEF ') || code.includes('LBL ') || code.includes('CALL ') || /\bR\d+\b/.test(code)) {
      return 'heidenhain';
    }
    if (code.includes('N') && /\bG\d+/.test(code)) {
      return 'fanuc';
    }
    
    return 'auto';
  };
  
  const [gCodeVariant, setGCodeVariant] = useState<GCodeVariant>(() => detectVariant());

  // Register G-code language when editor loads
  const handleEditorWillMount = (monaco: any) => {
    registerGCodeLanguage(monaco);
  };

  useEffect(() => {
    setGCodeVariant(detectVariant());
  }, [machineType, code]);

  useEffect(() => {
    setCode(initialCode);
    setHasChanges(false);
  }, [initialCode]);

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      setHasChanges(value !== initialCode);
    }
  };

  const handleSave = async () => {
    if (readOnly) return;
    
    setSaving(true);
    setError(null);

    try {
      // Save NC code via API
      const response = await programsApi.update(programId, {
        ncCode: code,
      } as any);

      if (response.success) {
        setHasChanges(false);
        onSave?.(code);
        // Show success message
      } else {
        setError(response.error || 'Kunne ikke gemme ændringer');
      }
    } catch (err: any) {
      setError(err.message || 'Fejl ved gemning');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setHasChanges(false);
    setError(null);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>NC Program Kode Editor</CardTitle>
            <select
              value={gCodeVariant}
              onChange={(e) => setGCodeVariant(e.target.value as GCodeVariant)}
              className="h-8 px-2 text-sm rounded-md border border-input bg-background"
              disabled={readOnly}
            >
              <option value="auto">Auto-detect</option>
              <option value="fanuc">Fanuc</option>
              <option value="heidenhain">Heidenhain</option>
            </select>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                disabled={saving}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Fortryd
              </Button>
            )}
            {!readOnly && (
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={saving || !hasChanges}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Gemmer...' : 'Gem'}
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        {hasChanges && !error && (
          <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
            Ugemte ændringer
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="h-[600px] border-t">
          <Editor
            height="100%"
            language={gCodeVariant === 'fanuc' ? 'fanuc-gcode' : gCodeVariant === 'heidenhain' ? 'heidenhain-gcode' : 'plaintext'}
            value={code}
            onChange={handleCodeChange}
            beforeMount={handleEditorWillMount}
            loading={
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Indlæser Monaco Editor...
              </div>
            }
            options={{
              readOnly,
              fontSize: 14,
              minimap: { enabled: true },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              tabSize: 2,
              formatOnPaste: true,
              formatOnType: true,
              lineHeight: 20,
              fontFamily: 'Consolas, "Courier New", monospace',
            }}
            theme={gCodeVariant === 'fanuc' ? 'gcode-fanuc' : gCodeVariant === 'heidenhain' ? 'gcode-heidenhain' : 'vs-dark'}
          />
        </div>
      </CardContent>
    </Card>
  );
}
