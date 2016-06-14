using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MedScheduler.Models
{
    public class ScheduleMonth
    {
        public int MonthNumber { get; set; }
        public List<Rotation> Rotations { get; set; }

        /// <summary>
        /// How many of each rotation type is needed.
        /// It can exceed the number of rotations.
        /// </summary>
        public Dictionary<RotationType, int> RotationTypesNeeded { get; set; }

        public bool DoctorHasRotation(Doctor doctor, RotationType rotationType)
        {
            return Rotations.Any(r => r.Doctor.Equals(doctor) && r.RotationType == rotationType);
        }

        public override string ToString()
        {
            return string.Format("Month {0}: {1}", MonthNumber, string.Join(", ", Rotations));
        }
    }
}