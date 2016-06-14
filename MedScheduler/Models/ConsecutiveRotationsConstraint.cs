using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MedScheduler.Models
{
    public class ConsecutiveRotationsConstraint
    {
        public Doctor Doctor { get; set; }
        public int MaxRotations { get; set; }
    }
}