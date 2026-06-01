export type Trend = "up" | "down";

export type UserRole = "admin" | "coach" | "nutritionist" | "user";
export type UserStatus = "active" | "inactive" | "at_risk";
export type PlanStatus = "active" | "draft" | "archived";
export type EntityStatus = "active" | "inactive";
export type ProgressStatus = "on_track" | "needs_attention";
export type PlanType = "workout" | "nutrition";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  primaryPlanType: PlanType;
  lastActive: string;
  assignedPlans: number;
  adherenceScore: number;
};

export type WorkoutPlan = {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  status: PlanStatus;
  assignedUsers: number;
  durationWeeks: number;
  updatedAt: string;
  planGoal?: string;
  workoutsPerWeek?: number;
  description?: string;
};

export type NutritionPlan = {
  id: string;
  title: string;
  goal: "fat_loss" | "muscle_gain" | "maintenance";
  status: PlanStatus;
  assignedUsers: number;
  caloriesTarget: number;
  updatedAt: string;
  proteinTarget?: number;
  mealsPerDay?: number;
  dietaryNotes?: string;
  description?: string;
};

export type Exercise = {
  id: string;
  name: string;
  category: "strength" | "cardio" | "mobility" | "core";
  level: "beginner" | "intermediate" | "advanced";
  equipment: string;
  status: EntityStatus;
  muscleGroup?: string;
  description?: string;
  instructions?: string;
  safetyNotes?: string;
};

export type Recipe = {
  id: string;
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  status: EntityStatus;
  carbs?: number;
  fat?: number;
  prepTime?: number;
  tags?: string[];
  ingredients?: string;
  instructions?: string;
};

export type ProgressReport = {
  id: string;
  userId: string;
  userName: string;
  weekLabel: string;
  workoutsCompleted: number;
  workoutsPlanned: number;
  nutritionAdherence: number;
  weightChangeKg: number;
  status: ProgressStatus;
};

export type AnalyticsKpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: Trend;
};
