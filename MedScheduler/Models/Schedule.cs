using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MedScheduler.Models
{
    public class Schedule
    {
        public ScheduleMonth[] Months = new ScheduleMonth[12];
        public List<ConsecutiveRotationsConstraint> ConsecutiveRotationsConstraints = 
            new List<ConsecutiveRotationsConstraint>();

        /// <summary>
        /// Checks if Schedule is filled out.
        /// Does not check validity! That is the job of whoever filled it out.
        /// </summary>
        /// <returns>
        /// True if all rotations have a type assigned.
        /// </returns>
        public bool IsComplete()
        {
            return Months.All(m => (m == null) || m.Rotations.All(r => r.RotationType.HasValue));
        }

        public override string ToString()
        {
            return string.Join<ScheduleMonth>(" / ", Months);
        }
    }
}