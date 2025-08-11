// src/app/models/client-update.model.ts
export interface ClientUpdateRequestDTO {
  gender: string;
  goal: string;
  height: string;
  weight: string;
  coachId?: string;
}
