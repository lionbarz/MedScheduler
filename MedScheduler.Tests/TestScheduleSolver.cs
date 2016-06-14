using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MedScheduler.Models;
using MedScheduler.Services;

namespace MedScheduler.Tests
{
    [TestClass]
    public class TestScheduleSolver
    {
        [TestMethod]
        public void TestSolveSchedule()
        {
            Schedule schedule = new Schedule();
            schedule.Months[0] = new ScheduleMonth()
            {
                MonthNumber = 0,
                Rotations = new List<Rotation>()
                {
                    new Rotation()
                    {
                        Doctor = Staff.Doctors[0],
                        IsConstraint = true,
                        RotationType = RotationType.RotationType1
                    },
                    new Rotation()
                    {
                        Doctor = Staff.Doctors[1],
                        IsConstraint = false,
                        RotationType = null
                    },
                    new Rotation()
                    {
                        Doctor = Staff.Doctors[2],
                        IsConstraint = false,
                        RotationType = null
                    }
                },
                RotationTypesNeeded = new Dictionary<RotationType, int>()
                {
                    { RotationType.RotationType1, 3 }
                }
            };
            schedule.Months[1] = new ScheduleMonth()
            {
                MonthNumber = 1,
                Rotations = new List<Rotation>()
                {
                    new Rotation()
                    {
                        Doctor = Staff.Doctors[0],
                        IsConstraint = true,
                        RotationType = RotationType.RotationType1
                    },
                    new Rotation()
                    {
                        Doctor = Staff.Doctors[1],
                        IsConstraint = false,
                        RotationType = null
                    },
                    new Rotation()
                    {
                        Doctor = Staff.Doctors[2],
                        IsConstraint = false,
                        RotationType = null
                    }
                },
                RotationTypesNeeded = new Dictionary<RotationType, int>()
                {
                    { RotationType.RotationType1, 1 },
                    { RotationType.RotationType2, 1 },
                    { RotationType.RotationType3, 1 }
                }
            };
            schedule.Months[2] = new ScheduleMonth()
            {
                MonthNumber = 2,
                Rotations = new List<Rotation>()
                {
                    new Rotation()
                    {
                        Doctor = Staff.Doctors[0],
                        IsConstraint = false,
                        RotationType = null
                    },
                    new Rotation()
                    {
                        Doctor = Staff.Doctors[1],
                        IsConstraint = false,
                        RotationType = null
                    },
                    new Rotation()
                    {
                        Doctor = Staff.Doctors[2],
                        IsConstraint = false,
                        RotationType = null
                    }
                },
                RotationTypesNeeded = new Dictionary<RotationType, int>()
                {
                    { RotationType.RotationType1, 2 },
                    { RotationType.RotationType3, 1 }
                }
            };
            schedule.ConsecutiveRotationsConstraints = new List<ConsecutiveRotationsConstraint>()
            {
                new ConsecutiveRotationsConstraint()
                {
                    Doctor = Staff.Doctors[0],
                    MaxRotations = 2
                }
            };

            bool solved = ScheduleSolver.Solve(schedule);
            Console.Write(solved);
        }
    }
}
