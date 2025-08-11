export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  durationInWeeks: number;
  coachId: string;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restSeconds: number;
  notes: string;
}
