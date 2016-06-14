using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MedScheduler.Models
{
    public class Staff
    {
        static Staff()
        {
            Doctors = new List<Doctor>()
            {
                new Doctor("Ali Fakhreddine"),
                new Doctor("Ehssan Bodheimer"),
                new Doctor("Mark Ruffalo")
            };
        }

        public static List<Doctor> Doctors { get; set; }
    }
}