import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useSetupSheets } from '../hooks';
import { 
  Camera, 
  Image, 
  CheckSquare, 
  ArrowLeft,
  Download,
  Edit,
  Smartphone,
  Video,
  Wrench
} from 'lucide-react';

interface SetupSheetPreviewProps {
  programId: string;
  onBack?: () => void;
  onEdit?: () => void;
}

export function SetupSheetPreview({ programId, onBack, onEdit }: SetupSheetPreviewProps) {
  const { setupSheets, loading, error } = useSetupSheets(programId);
  
  // Get the first (most recent) setup sheet, or null if none exist
  const setupSheet = setupSheets && setupSheets.length > 0 ? setupSheets[0] : null;

  if (loading) {
    return (
      <div className="space-y-6">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="text-center py-12">
          <p className="text-muted-foreground">Henter opsætningsark...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="text-center py-12">
          <p className="text-red-600">Fejl ved hentning: {error}</p>
        </div>
      </div>
    );
  }

  if (!setupSheet) {
    return (
      <div className="space-y-6">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="text-center py-12">
          <p className="text-muted-foreground">Ingen opsætningsark fundet for dette program</p>
        </div>
      </div>
    );
  }

  // Transform API response to match component expectations
  const transformedSheet = {
    ...setupSheet,
    createdBy: typeof setupSheet.createdBy === 'string' 
      ? setupSheet.createdBy 
      : (setupSheet.createdBy as any)?.name || '—',
    approvedBy: setupSheet.approvedBy 
      ? (typeof setupSheet.approvedBy === 'string' 
          ? setupSheet.approvedBy 
          : (setupSheet.approvedBy as any)?.name || '—')
      : undefined,
    createdAt: setupSheet.createdAt ? new Date(setupSheet.createdAt).toLocaleString('da-DK') : '—',
    approvedAt: setupSheet.approvedAt ? new Date(setupSheet.approvedAt).toLocaleString('da-DK') : undefined,
    safetyChecklist: Array.isArray(setupSheet.safetyChecklist) 
      ? setupSheet.safetyChecklist 
      : typeof setupSheet.safetyChecklist === 'string' 
        ? JSON.parse(setupSheet.safetyChecklist) 
        : [],
    tools: setupSheet.tools || [],
    originOffsets: setupSheet.originOffsets || [],
    fixtures: setupSheet.fixtures || [],
    media: (setupSheet.media || []).map((item: any) => ({
      ...item,
      annotations: Array.isArray(item.annotations) 
        ? item.annotations.map((a: any) => typeof a === 'string' ? a : a.text || a.position || '')
        : [],
    })),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">Opsætningsark</h2>
              {transformedSheet.approvedBy && <Badge variant="success">Godkendt</Badge>}
            </div>
            <p className="text-muted-foreground">
              Program {programId} • Oprettet på mobil enhed
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Eksporter PDF
          </Button>
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Rediger
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Machine & Fixture Info */}
          <Card>
            <CardHeader>
              <CardTitle>Maskine & Fikstur Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Maskine Type</label>
                <p className="font-medium text-lg">{transformedSheet.machineType}</p>
              </div>
              
              {transformedSheet.fixtures.map((fixture, idx) => (
                <div key={idx} className="border-t pt-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fikstur ID</label>
                      <p className="font-medium">{fixture.fixtureId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Antal</label>
                      <p className="font-medium">{fixture.quantity}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-sm font-medium text-muted-foreground">Opsætningsbeskrivelse</label>
                    <p className="text-sm mt-1">{fixture.setupDescription || '—'}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Origin Offsets */}
          <Card>
            <CardHeader>
              <CardTitle>Nulpunktsoffsets</CardTitle>
            </CardHeader>
            <CardContent>
              {transformedSheet.originOffsets.map((offset, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="font-semibold text-lg">{offset.name}</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-sm">
                    <div className="bg-muted p-3 rounded">
                      <label className="text-xs font-medium text-muted-foreground block mb-1">X</label>
                      <p className="font-mono font-bold">{offset.x.toFixed(4)}</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Y</label>
                      <p className="font-mono font-bold">{offset.y.toFixed(4)}</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Z</label>
                      <p className="font-mono font-bold">{offset.z.toFixed(4)}</p>
                    </div>
                    {offset.a !== undefined && offset.a !== 0 && (
                      <div className="bg-muted p-3 rounded">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">A</label>
                        <p className="font-mono font-bold">{offset.a.toFixed(4)}</p>
                      </div>
                    )}
                    {offset.b !== undefined && offset.b !== 0 && (
                      <div className="bg-muted p-3 rounded">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">B</label>
                        <p className="font-mono font-bold">{offset.b.toFixed(4)}</p>
                      </div>
                    )}
                    {offset.c !== undefined && offset.c !== 0 && (
                      <div className="bg-muted p-3 rounded">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">C</label>
                        <p className="font-mono font-bold">{offset.c.toFixed(4)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tool List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Værktøjsliste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-sm">
                      <th className="text-left py-2 px-3">T#</th>
                      <th className="text-left py-2 px-3">Værktøjsnavn</th>
                      <th className="text-right py-2 px-3">Længde (mm)</th>
                      <th className="text-right py-2 px-3">H Offset</th>
                      <th className="text-right py-2 px-3">D Offset</th>
                      <th className="text-left py-2 px-3">Kommentar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transformedSheet.tools.map((tool, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-3 font-bold">{tool.toolNumber}</td>
                        <td className="py-3 px-3 font-medium">{tool.toolName}</td>
                        <td className="py-3 px-3 text-right font-mono">{tool.length.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right font-mono">{tool.offsetH.toFixed(4)}</td>
                        <td className="py-3 px-3 text-right font-mono">{tool.offsetD.toFixed(3)}</td>
                        <td className="py-3 px-3 text-sm text-muted-foreground">{tool.comment || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Media (5 required) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Opsætningsfotos & Videoer ({transformedSheet.media.length} {transformedSheet.media.length === 1 ? 'fil' : 'filer'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transformedSheet.media.length > 0 ? (
                  transformedSheet.media.map((item, idx) => (
                    <div key={item.id || idx} className="border rounded-lg overflow-hidden">
                      <div className={`${
                        item.type === 'image' 
                          ? 'bg-gradient-to-br from-blue-50 to-blue-100' 
                          : 'bg-gradient-to-br from-purple-50 to-purple-100'
                      } aspect-video flex items-center justify-center relative`}>
                        {item.type === 'image' ? (
                          <Image className="h-16 w-16 text-blue-300" />
                        ) : (
                          <Video className="h-16 w-16 text-purple-300" />
                        )}
                        {item.annotations && item.annotations.length > 0 && (
                          <>
                            {item.annotations.map((annotation, aIdx) => (
                              <div 
                                key={aIdx} 
                                className="absolute bg-red-500 text-white px-2 py-1 rounded text-xs font-bold"
                                style={{
                                  top: `${20 + aIdx * 30}%`,
                                  left: `${10 + aIdx * 20}%`
                                }}
                              >
                                {annotation}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                      <div className="p-3 bg-white">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {idx + 1}/{transformedSheet.media.length}
                          </Badge>
                          {item.type === 'video' && (
                            <Badge variant="default" className="text-xs">Video</Badge>
                          )}
                        </div>
                        <p className="font-medium text-sm">{item.caption || 'Ingen beskrivelse'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">Ingen medier uploadet endnu</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Safety Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Sikkerheds- & Tjekliste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transformedSheet.safetyChecklist.length > 0 ? (
                  transformedSheet.safetyChecklist.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 rounded hover:bg-accent">
                      <CheckSquare className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">Ingen sikkerhedspunkter angivet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mobile App Info */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Smartphone className="h-5 w-5" />
                Mobil Optagelse
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-blue-800">
                Dette opsætningsark blev oprettet via mobilappen med:
              </p>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Realtids fotofangst</li>
                <li>Billedannotationer</li>
                <li>Digital tjekliste</li>
                <li>Stemmenotater (valgfrit)</li>
                <li>Offline-først synkronisering</li>
              </ul>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Detaljer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <label className="text-muted-foreground">Oprettet</label>
                <p className="font-medium">{transformedSheet.createdAt}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Oprettet Af</label>
                <p className="font-medium">{transformedSheet.createdBy}</p>
              </div>
              {transformedSheet.approvedBy && (
                <>
                  <div>
                    <label className="text-muted-foreground">Godkendt Af</label>
                    <p className="font-medium">{transformedSheet.approvedBy}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Godkendt</label>
                    <p className="font-medium">{transformedSheet.approvedAt}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
