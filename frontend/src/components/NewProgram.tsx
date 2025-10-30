import { useEffect, useState } from 'react';
import { machinesApi, programsApi } from '../api';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface NewProgramProps {
  onBack: () => void;
  onCreated: (programId: string) => void;
}

export function NewProgram({ onBack, onCreated }: NewProgramProps) {
  const [machines, setMachines] = useState<any[]>([]);
  const [machineId, setMachineId] = useState<string>('');
  const [nextNumber, setNextNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [operation, setOperation] = useState('');
  const [material, setMaterial] = useState('');
  const [customer, setCustomer] = useState('');
  const [customerList, setCustomerList] = useState<string[]>([]);
  const [addingCustomer, setAddingCustomer] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await machinesApi.getAll();
      if (res.success && res.data && (res.data as any[]).length) {
        setMachines(res.data as any[]);
        const first = (res.data as any[])[0].id;
        setMachineId(first);
      }
      // Try to fetch customers from existing programs (best-effort)
      try {
        const p = await programsApi.getAll({ limit: 200 } as any);
        if (p.success && p.data) {
          const set = new Set<string>();
          (p.data as any[]).forEach(pr => { if (pr.customer) set.add(pr.customer); });
          setCustomerList(Array.from(set).sort());
        }
      } catch {
        // Ignore; user can add a new customer via input
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!machineId) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/machines/${machineId}/next-program-number`);
        const json = await res.json();
        if (json.success) setNextNumber(json.data.formatted);
      } catch {}
    })();
  }, [machineId]);

  const canSubmit = !!machineId && !!name && !!operation && !!material && !!customer;

  const handleCreate = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const payload: any = {
        name,
        revision: 'A',
        machineId,
        operation,
        material,
        customer,
        status: 'Draft' as any,
      };
      // Do NOT send partNumber to trigger auto-numbering on server
      const res = await programsApi.create(payload);
      if (res.success && res.data) {
        onCreated((res.data as any).id);
      } else {
        alert('Kunne ikke oprette program');
      }
    } catch (e:any) {
      alert('Fejl: ' + (e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Nyt Program</h2>
        <Button variant="ghost" onClick={onBack}>Tilbage</Button>
      </div>

      <Card className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Maskine</label>
            <select
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              {machines.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {nextNumber && (
              <p className="text-xs text-muted-foreground mt-1">Næste programnummer: <span className="font-medium">{nextNumber}</span></p>
            )}
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Programnavn</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="F.eks. Flange_Face_Mill" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Operation</label>
            <Input value={operation} onChange={(e) => setOperation(e.target.value)} placeholder="F.eks. Froning af flange" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Materiale</label>
            <Input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="F.eks. Aluminium 6061" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Kunde</label>
            {!addingCustomer ? (
              <div className="flex gap-2">
                <select
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">Vælg kunde...</option>
                  {customerList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Button variant="outline" onClick={() => setAddingCustomer(true)}>Ny</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="F.eks. Vestas" />
                <Button variant="outline" onClick={() => setAddingCustomer(false)}>Tilbage</Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onBack}>Annuller</Button>
          <Button disabled={!canSubmit || loading} onClick={handleCreate}>{loading ? 'Opretter...' : 'Opret Program'}</Button>
        </div>
      </Card>
    </div>
  );
}
