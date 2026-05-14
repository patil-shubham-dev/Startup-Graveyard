import { supabase } from './config';

interface Question {
  id: string;
  text: string;
}

export interface PremortemReport {
  risk_score: number;
  verdict: string;
  primary_risks: Array<{
    category: string;
    description: string;
    mitigation: string;
  }>;
  similar_cases: Array<{
    name: string;
    correlation: string;
  }>;
}

export interface PremortemSession {
  id: string;
  user_id: string;
  pitch: string;
  questions: Question[];
  answers: Record<string, string>;
  report: PremortemReport | null;
  risk_score: number | null;
  share_token: string | null;
  created_at: string;
}

export async function createPremortemSession(userId: string, pitch: string): Promise<PremortemSession> {
  const { data, error } = await supabase
    .from('premortem_sessions')
    .insert({ user_id: userId, pitch, answers: {}, questions: [] })
    .select()
    .single();

  if (error) throw error;
  return data as PremortemSession;
}

export async function getPremortemSession(id: string): Promise<PremortemSession | null> {
  const { data, error } = await supabase
    .from('premortem_sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as PremortemSession;
}

export async function updateSessionAnswers(id: string, answers: Record<string, string>): Promise<void> {
  const { error } = await supabase
    .from('premortem_sessions')
    .update({ answers })
    .eq('id', id);

  if (error) throw error;
}

export async function savePremortemReport(id: string, report: PremortemReport, riskScore: number): Promise<void> {
  const { error } = await supabase
    .from('premortem_sessions')
    .update({ 
      report, 
      risk_score: riskScore,
      share_token: crypto.randomUUID().split('-')[0] // Simple share token
    })
    .eq('id', id);

  if (error) throw error;
}
