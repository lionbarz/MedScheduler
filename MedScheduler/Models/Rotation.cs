using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MedScheduler.Models
{
    public class Rotation
    {
        public Doctor Doctor { get; set; }
        public RotationType? RotationType { get; set; }
        public bool IsConstraint { get; set; }

        public override string ToString()
        {
            if (!RotationType.HasValue)
            {
                return string.Format("{0} is unassigned.", Doctor);
            }

            return string.Format("'{0}' is doing '{1}'", Doctor, RotationType);
        }
    }
}