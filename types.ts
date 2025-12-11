export enum AgentId {
  NAVIGATOR = 'NAVIGATOR',
  APPOINTMENT = 'APPOINTMENT',
  PATIENT_INFO = 'PATIENT_INFO',
  BILLING = 'BILLING',
  MEDICAL_RECORDS = 'MEDICAL_RECORDS'
}

export interface AgentConfig {
  id: AgentId;
  name: string;
  description: string;
  icon: string; // Icon name from lucide-react
  color: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  agentId?: AgentId; // The agent that responded
  timestamp: Date;
}

export interface GeminiResponseSchema {
  active_agent_id: string; // Corresponds to AgentId enum
  response_text: string;
}