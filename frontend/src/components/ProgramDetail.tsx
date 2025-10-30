import { useState } from 'react';
import Editor from '@monaco-editor/react';
import type { NCProgram } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { NCCodeEditor } from './NCCodeEditor';
import { registerGCodeLanguage } from '../utils/gcode-language';
import { useSetupSheets } from '../hooks';
import {
  ArrowLeft,
  Download,
  Send,
  Edit,
  Clock,
  User,
  Box,
  FileText,
  ClipboardList,
  GitCompare,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Wrench,
  Camera,
  Plus,
} from 'lucide-react';

interface ProgramDetailProps {
  program: NCProgram;
  onBack: () => void;
  onViewSetupSheet?: () => void;
  onEditSetupSheet?: () => void;
}

export function ProgramDetail({ program, onBack, onViewSetupSheet, onEditSetupSheet }: ProgramDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch setup sheet data
  const { setupSheets, loading: loadingSetupSheet } = useSetupSheets(program.id);
  const setupSheet = setupSheets && setupSheets.length > 0 ? setupSheets[0] : null;
  
  // Debug: Log setup sheet data
  if (setupSheet) {
    console.log('Setup sheet found:', setupSheet);
  } else if (!loadingSetupSheet) {
    console.log('No setup sheet found for program:', program.id);
  }
  
  // Handle loading state
  if (!program) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <p className="text-muted-foreground">Henter programdetaljer...</p>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Released': return 'success';
      case 'Approved': return 'success';
      case 'In Review': return 'warning';
      case 'Draft': return 'default';
      case 'Obsolete': return 'secondary';
      default: return 'default';
    }
  };

  // Handle API response structure where machine and author are objects
  const machineName = typeof program.machine === 'string' 
    ? program.machine 
    : (program as any).machine?.name || '—';
  const authorName = typeof program.author === 'string' 
    ? program.author 
    : (program as any).author?.name || '—';

  // Get NC code from program or generate default
  const getDefaultNCCode = () => `%
O${program.id.slice(1)} (${program.name})
(DEL: ${program.partNumber} REV ${program.revision})
(OPERATION: ${program.operation})
(MASKINE: ${machineName})
(MATERIALE: ${program.material})
(PROGRAMMØR: ${authorName})

G54 G90 G17 G20 G40 G49 G80
G0 G91 G28 Z0.
G28 X0. Y0.

(VÆRKTØJ 1 - 1" PLANFRÆSER)
T1 M6
G0 G90 G54 X0. Y0. S1200 M3
G43 H1 Z0.1 M8
G1 Z-0.05 F10.
G1 X4. F30.
G1 Y4.
G1 X0.
G1 Y0.
G0 Z0.1
G0 G91 G28 Z0.
M5
M9
M30
%`;

  const ncCode = (program as any).ncCode || getDefaultNCCode();

  // Detect G-code variant for preview
  const detectVariant = (): 'fanuc' | 'heidenhain' | 'plaintext' => {
    const machineType = (program as any).machine?.type || machineName;
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
    if (ncCode.includes('DEF ') || ncCode.includes('LBL ') || ncCode.includes('CALL ') || /\bR\d+\b/.test(ncCode)) {
      return 'heidenhain';
    }
    if (ncCode.includes('N') && /\bG\d+/.test(ncCode)) {
      return 'fanuc';
    }
    
    return 'plaintext';
  };

  const gCodeVariant = detectVariant();
  const language = gCodeVariant === 'fanuc' ? 'fanuc-gcode' : gCodeVariant === 'heidenhain' ? 'heidenhain-gcode' : 'plaintext';
  const theme = gCodeVariant === 'fanuc' ? 'gcode-fanuc' : gCodeVariant === 'heidenhain' ? 'gcode-heidenhain' : 'vs-dark';

  const handleEditorWillMount = (monaco: any) => {
    registerGCodeLanguage(monaco);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{program.name}</h2>
            <p className="text-muted-foreground">
              {program.partNumber} Rev {program.revision} • {program.operation}
            </p>
          </div>
          <Badge variant={getStatusVariant(program.status) as any}>
            {program.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? 'Vis' : 'Rediger'}
          </Button>
          {program.status === 'Released' && (
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Send til Maskine
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* NC Program Code */}
          {isEditing ? (
            <NCCodeEditor
              programId={program.id}
              initialCode={ncCode}
              machineType={(program as any).machine?.type || machineName}
              onSave={(code) => {
                setIsEditing(false);
                // Optionally refresh the program data
              }}
              onClose={() => setIsEditing(false)}
              readOnly={program.status === 'Released' || program.status === 'Approved'}
            />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>NC Program Kode</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <GitCompare className="mr-2 h-4 w-4" />
                      Sammenlign
                    </Button>
                    <Button variant="outline" size="sm">
                      Vis Historik
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px] border-t">
                  <Editor
                    height="100%"
                    language={language}
                    value={ncCode}
                    beforeMount={handleEditorWillMount}
                    options={{
                      readOnly: true,
                      fontSize: 14,
                      minimap: { enabled: true },
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: 'on',
                      tabSize: 2,
                      lineHeight: 20,
                      fontFamily: 'Consolas, "Courier New", monospace',
                      cursorStyle: 'line',
                    }}
                    theme={theme}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Associated Files */}
          <Card>
            <CardHeader>
              <CardTitle>Tilknyttede Filer & Fremvisere</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {program.hasCAD && (
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center">
                        <Box className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">3D CAD Model (STEP)</p>
                        <p className="text-sm text-muted-foreground">{program.partNumber}_Rev{program.revision}.step</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Åbn Fremviser
                    </Button>
                  </div>
                )}
                
                {program.hasDXF && (
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Tegning (DXF)</p>
                        <p className="text-sm text-muted-foreground">{program.partNumber}_Tegning.dxf</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Åbn Fremviser
                    </Button>
                  </div>
                )}

                {/* Show setup sheet link if setup sheet exists */}
                {setupSheet && onViewSetupSheet && (
                  <div 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    onClick={onViewSetupSheet}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-purple-100 flex items-center justify-center">
                        <ClipboardList className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Opsætningsark</p>
                        <p className="text-sm text-muted-foreground">Mobil optagelse med fotos & annotationer</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Vis
                    </Button>
                  </div>
                )}

                {/* Show button to create setup sheet if none exists */}
                {!setupSheet && !loadingSetupSheet && (
                  <div className="flex items-center justify-between p-3 border rounded-lg border-dashed">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-purple-100 flex items-center justify-center">
                        <ClipboardList className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Opsætningsark</p>
                        <p className="text-sm text-muted-foreground">Ingen opsætningsark oprettet endnu</p>
                      </div>
                    </div>
                    {onEditSetupSheet && (
                      <Button variant="outline" size="sm" onClick={onEditSetupSheet}>
                        <Plus className="mr-2 h-4 w-4" />
                        Opret
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-orange-100 flex items-center justify-center">
                      <ExternalLink className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Fusion 360 CAM</p>
                      <p className="text-sm text-muted-foreground">Åbn kilde-design i Fusion 360</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Åbn i Fusion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Kommentarer & Samarbejde
                </CardTitle>
                <Button size="sm">Tilføj Kommentar</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">Kvalitetsteam</span>
                      <span className="text-xs text-muted-foreground">For 2 timer siden</span>
                    </div>
                    <p className="text-sm">Godkendt til udgivelse. Værktøjsoffsets verificeret og stemmer overens med opsætningsark.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{authorName}</span>
                      <span className="text-xs text-muted-foreground">For 1 dag siden</span>
                    </div>
                    <p className="text-sm">Opdateret fremdriftshastighed på grovfræsningspassage for at forbedre overfladebehandling. Klar til gennemgang.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Program Details */}
          <Card>
            <CardHeader>
              <CardTitle>Program Detaljer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kunde</label>
                <p className="font-medium">{program.customer}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Maskine</label>
                <p className="font-medium">{machineName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Operation</label>
                <p className="font-medium">{program.operation}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Materiale</label>
                <p className="font-medium">{program.material}</p>
              </div>
              {program.workOrder && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Arbejdsordre</label>
                  <p className="font-medium">{program.workOrder}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Forfatter</label>
                <p className="font-medium">{authorName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sidst Ændret</label>
                <p className="text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {program.lastModified}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Approval Status */}
          {program.status === 'Released' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Godkendelsesstatus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Programmør Gennemgang - J. Miller</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Kvalitetsgodkendelse - QA Team</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Udgivet til Produktion</span>
                </div>
              </CardContent>
            </Card>
          )}

          {program.status === 'In Review' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Afventer Gennemgang
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Dette program afventer kvalitetsgodkendelse før udgivelse.
                </p>
                <Button className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Godkend Program
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Setup Sheet Info */}
          {setupSheet && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Opsætningsark Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tools Summary */}
                {setupSheet.tools && setupSheet.tools.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                      <Wrench className="h-4 w-4" />
                      Værktøjer ({setupSheet.tools.length})
                    </label>
                    <div className="space-y-1 text-sm">
                      {setupSheet.tools.slice(0, 3).map((tool: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-muted-foreground">T{tool.toolNumber}:</span>
                          <span className="font-medium">{tool.toolName}</span>
                        </div>
                      ))}
                      {setupSheet.tools.length > 3 && (
                        <p className="text-xs text-muted-foreground pt-1">
                          +{setupSheet.tools.length - 3} flere...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Origin Offsets Summary */}
                {setupSheet.originOffsets && setupSheet.originOffsets.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Nulpunktsoffsets ({setupSheet.originOffsets.length})
                    </label>
                    <div className="space-y-1 text-sm">
                      {setupSheet.originOffsets.map((offset: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-muted-foreground">{offset.name}:</span>
                          <span className="font-mono text-xs">
                            X:{offset.x.toFixed(2)} Y:{offset.y.toFixed(2)} Z:{offset.z.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media Summary */}
                {setupSheet.media && setupSheet.media.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                      <Camera className="h-4 w-4" />
                      Medier ({setupSheet.media.length})
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {setupSheet.media.filter((m: any) => m.type === 'image').length} billeder,{' '}
                      {setupSheet.media.filter((m: any) => m.type === 'video').length} videoer
                    </p>
                  </div>
                )}

                {/* Fixtures */}
                {setupSheet.fixtures && setupSheet.fixtures.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Fiksturer ({setupSheet.fixtures.length})
                    </label>
                    <div className="space-y-1 text-sm">
                      {setupSheet.fixtures.map((fixture: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-muted-foreground">{fixture.fixtureId}:</span>
                          <span className="font-medium">{fixture.quantity}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Full Setup Sheet Button */}
                {onViewSetupSheet && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4" 
                    onClick={onViewSetupSheet}
                  >
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Se Fuldstændigt Opsætningsark
                  </Button>
                )}
                {/* Edit Setup Sheet Button */}
                {onEditSetupSheet && (
                  <Button 
                    variant="default" 
                    className="w-full mt-2" 
                    onClick={onEditSetupSheet}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {setupSheet ? 'Rediger Opsætningsark' : 'Opret Opsætningsark'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Version History */}
          <Card>
            <CardHeader>
              <CardTitle>Versionshistorik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start pb-2 border-b">
                  <div>
                    <p className="font-medium">Rev {program.revision} (Aktuel)</p>
                    <p className="text-xs text-muted-foreground">{program.lastModified}</p>
                  </div>
                  <Badge variant="success" className="text-xs">Aktuel</Badge>
                </div>
                <div className="flex justify-between items-start pb-2 border-b">
                  <div>
                    <p className="font-medium">Rev B</p>
                    <p className="text-xs text-muted-foreground">2025-10-25 10:15</p>
                  </div>
                  <Button variant="ghost" size="sm">Vis</Button>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Rev A</p>
                    <p className="text-xs text-muted-foreground">2025-10-20 08:30</p>
                  </div>
                  <Button variant="ghost" size="sm">Vis</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

