using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MedScheduler.Models;

namespace MedScheduler.Services
{
    public class ScheduleSolver
    {
        public static bool Solve(Schedule schedule)
        {
            if (schedule.IsComplete())
            {
                return true;
            }

            ScheduleMonth month;
            Rotation unassignedRotation = FindUnassignedRotation(schedule, out month);

            foreach (RotationType rotationType in Enum.GetValues(typeof(RotationType)))
            {
                // Check constraint on allowable rotation types.
                int existingRotationsOfType = month.Rotations.Where(r => r.RotationType == rotationType).Count();                
                if (!month.RotationTypesNeeded.ContainsKey(rotationType) ||
                    existingRotationsOfType == month.RotationTypesNeeded[rotationType])
                {
                    continue;
                }

                // Check constraint on number of consecutive shifts.
                ConsecutiveRotationsConstraint consecutiveRotationsConstraint =
                    schedule.ConsecutiveRotationsConstraints.Where(x => x.Doctor.Equals(unassignedRotation.Doctor)).FirstOrDefault();
                if (consecutiveRotationsConstraint != null)
                {
                    int shiftsToTheLeft = 0;
                    int i = month.MonthNumber - 1;
                    while (i >= 0 && schedule.Months[i].DoctorHasRotation(unassignedRotation.Doctor, rotationType))
                    {
                        shiftsToTheLeft++;
                        i--;
                    }
                    int shiftsToTheRight = 0;
                    i = month.MonthNumber + 1;
                    while (i < schedule.Months.Count() && schedule.Months[i] != null && schedule.Months[i].DoctorHasRotation(unassignedRotation.Doctor, rotationType))
                    {
                        shiftsToTheRight++;
                        i++;
                    }
                    if ((shiftsToTheLeft + shiftsToTheRight + 1) > consecutiveRotationsConstraint.MaxRotations)
                    {
                        continue;
                    }
                }

                unassignedRotation.RotationType = rotationType;
                bool solved = Solve(schedule);
                
                if (solved)
                {
                    return true;
                }

                unassignedRotation.RotationType = null;
            }

            return false;
        }

        private static Rotation FindUnassignedRotation(Schedule schedule, out ScheduleMonth monthOut)
        {
            foreach (ScheduleMonth month in schedule.Months)
            {
                foreach (Rotation rotation in month.Rotations)
                {
                    if (!rotation.RotationType.HasValue)
                    {
                        monthOut = month;
                        return rotation;
                    }
                }
            }

            throw new Exception("No unassigned rotations to be found.");
        }
    }
}