import { exercises as exercisesMock } from "@/data/mockData";
import { Exercise } from "@/types";
import {
  CreateExerciseRequest,
  CreateExerciseResponse,
  GetExercisesRequest,
  GetExercisesResponse,
  UpdateExerciseRequest,
  UpdateExerciseResponse,
} from "@/contracts";

export type CreateExercisePayload = CreateExerciseRequest;
export type UpdateExercisePayload = UpdateExerciseRequest["payload"];

export async function getExercises(_params?: GetExercisesRequest): Promise<GetExercisesResponse["data"]> {
  void _params;
  return exercisesMock.map((exercise) => ({ ...exercise }));
}

export async function createExercise(
  currentExercises: Exercise[],
  payload: CreateExercisePayload
): Promise<CreateExerciseResponse["data"]> {
  const createdExercise: Exercise = {
    id: `ex-${Math.floor(Math.random() * 900 + 100)}`,
    ...payload,
  };

  void currentExercises;
  return createdExercise;
}

export async function updateExercise(
  currentExercises: Exercise[],
  exerciseId: string,
  payload: UpdateExercisePayload
): Promise<UpdateExerciseResponse["data"]> {
  const target = currentExercises.find((exercise) => exercise.id === exerciseId);
  if (!target) {
    return null;
  }

  return { ...target, ...payload };
}
