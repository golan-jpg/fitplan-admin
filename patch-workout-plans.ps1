$filePath = "C:\Users\User\projects\fitplan-admin\src\app\workout-plans\page.tsx"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Verify key strings
Write-Host "createWorkoutPlan found: $($content.Contains('createWorkoutPlan(formState)'))"
Write-Host "updateWorkoutPlan found: $($content.Contains('await updateWorkoutPlan(editingPlanId, formState)'))"
Write-Host "confirmArchive found: $($content.Contains('function confirmArchive'))"

# Replacement 1: updateWorkoutPlan call -> add audit log after
$old1 = "        await updateWorkoutPlan(editingPlanId, formState);"
$new1 = @"
        const updatedWp = await updateWorkoutPlan(editingPlanId, formState);
        if (updatedWp && session) {
          addAuditLog({
            actorName: session.name,
            actorRole: session.role,
            action: "updated",
            entityType: "workout_plan",
            entityName: formState.title,
            entityId: editingPlanId,
            severity: "info",
            description: `u05e2u05d5u05d3u05dbu05e0u05d4 u05eau05d5u05dbu05e0u05d9u05ea u05d0u05d9u05deu05d5u05df: ` + '${formState.title}.',
          });
        }
"@

$content = $content.Replace($old1, $new1.TrimEnd())

# Replacement 2: createWorkoutPlan call -> add audit log after
$old2 = @"
        await createWorkoutPlan(formState);
"@

$new2 = @"
        const createdWp = await createWorkoutPlan(formState);
        if (session) {
          addAuditLog({
            actorName: session.name,
            actorRole: session.role,
            action: "created",
            entityType: "workout_plan",
            entityName: formState.title,
            entityId: createdWp.id,
            severity: "success",
            description: `u05e0u05d5u05e6u05e8u05d4 u05eau05d5u05dbu05e0u05d9u05ea u05d0u05d9u05deu05d5u05df u05d7u05d3u05e9u05d4: ` + '${formState.title}.',
          });
        }
"@

$content = $content.Replace($old2, $new2)

# Replacement 3: confirmArchive -> add audit log
$old3 = @"
    setTimeout(async () => {
      await updateWorkoutPlanStatus(archiveTargetId, "archived");
      setIsArchiving(false);
      setArchiveTargetId(null);
"@

$new3 = @"
    const archivePlan = workoutPlans.find((p) => p.id === archiveTargetId);
    setTimeout(async () => {
      await updateWorkoutPlanStatus(archiveTargetId, "archived");
      if (session && archivePlan) {
        addAuditLog({
          actorName: session.name,
          actorRole: session.role,
          action: "archived",
          entityType: "workout_plan",
          entityName: archivePlan.title,
          entityId: archiveTargetId,
          severity: "warning",
          description: `u05eau05d5u05dbu05e0u05d9u05ea u05d0u05d9u05deu05d5u05df u05d4u05d5u05e2u05d1u05e8u05d4 u05dcu05d0u05e8u05dbu05d9u05d5u05df: ` + '${archivePlan.title}.',
        });
      }
      setIsArchiving(false);
      setArchiveTargetId(null);
"@

$content = $content.Replace($old3, $new3)

Write-Host "Writing file..."
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done. Length: $($content.Length)"
