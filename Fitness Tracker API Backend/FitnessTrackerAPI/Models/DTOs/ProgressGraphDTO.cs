public class ProgressGraphDTO
{
    public List<PlanProgressDTO> Assignments { get; set; }
}

public class PlanProgressDTO
{
    public List<DateCaloriesDTO> SubmittedOn { get; set; } // ✅ Change type
    public Guid PlanAssignmentId { get; set; }
    public string PlanName { get; set; }
    public double ProgressPercentage { get; set; }
    public int CaloriesBurnt { get; set; }
    public int caloriesIntake { get; set; }
    public DateTime AssignedOn { get; set; }
    public DateTime? DueDate { get; set; }
}

public class DateCaloriesDTO
{
    public DateTime Date { get; set; }
    public int CaloriesBurnt { get; set; }
    public int CaloriesIntake { get; set; }
}
