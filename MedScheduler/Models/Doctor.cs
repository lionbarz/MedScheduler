using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MedScheduler.Models
{
    public class Doctor
    {
        public Doctor(string name)
        {
            Name = name;
        }

        public string Name { get; private set; }

        public override bool Equals(object obj)
        {
            Doctor d = obj as Doctor;
            return d != null && d.Name.Equals(Name);
        }

        public override int GetHashCode()
        {
            return Name.GetHashCode();
        }

        public override string ToString()
        {
            return Name;
        }
    }
}