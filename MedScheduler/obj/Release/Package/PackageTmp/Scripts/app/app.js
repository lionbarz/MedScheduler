function Schedule() {
    this.maxConsecutiveRotationTypes = {};
    this.months = [];
    this.months.push(new ScheduleMonth(0, "January"));
    this.months.push(new ScheduleMonth(1, "February"));
    this.months.push(new ScheduleMonth(2, "March"));
    this.months.push(new ScheduleMonth(3, "April"));
    this.months.push(new ScheduleMonth(4, "May"));
    this.months.push(new ScheduleMonth(5, "June"));
    this.months.push(new ScheduleMonth(6, "July"));
    this.months.push(new ScheduleMonth(7, "August"));
    this.months.push(new ScheduleMonth(8, "September"));
    this.months.push(new ScheduleMonth(9, "October"));
    this.months.push(new ScheduleMonth(10, "November"));
    this.months.push(new ScheduleMonth(11, "December"));
    this.months.push(new ScheduleMonth(12, "January"));
    this.removeDoctor = function (doctor) {
        for (var i = 0; i < this.months.length; i++) {
            this.months[i].removeDoctor(doctor);
        }
    };
    this.addDoctor = function (doctor) {
        for (var i = 0; i < this.months.length; i++) {
            this.months[i].rotations.push(new Rotation(doctor, null, false));
        }
    };
    this.getRotationsForDoctor = function (doctor) {
        var rotations = [];
        for (var i = 0; i < this.months.length; i++) {
            rotations.push(this.months[i].getRotationForDoctor(doctor));
        }
        return rotations;
    }
    this.isComplete = function () {
        for (var i = 0; i < this.months.length; i++) {
            if (!this.months[i].isComplete()) {
                return false;
            }
        }
        return true;
    }
    this.findUnassignedRotation = function () {
        var rotationAndMonth = null;
        for (var i = 0; i < this.months.length; i++) {
            rotationAndMonth = this.months[i].findUnassignedRotation();
            if (rotationAndMonth) {
                return rotationAndMonth;
            }
        }
        return null;
    }
    this.getNumRotationTypesForDoctor = function (doctor, rotationTypeId) {
        var num = 0;
        for (var i = 0; i < this.months.length; i++) {
            var rotation = this.months[i].getRotationForDoctor(doctor);
            if (rotation && rotation.rotationTypeId === rotationTypeId) {
                num++;
            }
        }
        return num;
    }
}

function ScheduleMonth(monthNumber, name) {
    this.name = name;
    this.monthNumber = monthNumber;
    this.rotations = [];
    this.rotationTypesNeeded = {};
    this.getRotationForDoctor = function (doctor) {
        for (var i = 0; i < this.rotations.length; i++) {
            if (this.rotations[i].doctor.id == doctor.id) {
                return this.rotations[i];
            }
        }
        return null;
    }
    this.doctorHasRotation = function (doctor, rotationTypeId) {
        for (var i = 0; i < this.rotations.length; i++) {
            if (this.rotations[i].doctor.id == doctor.id && this.rotations[i].rotationTypeId === rotationTypeId) {
                return true;
            }
        }
        return false;
    }
    this.doctorHasInpatientRotation = function (doctor, rotationTypes) {
        for (var i = 0; i < this.rotations.length; i++) {
            if (this.rotations[i].doctor.id == doctor.id) {
                if (!this.rotations[i].rotationTypeId) {
                    return false;
                }
                for (var j = 0; j < rotationTypes.length; j++) {
                    if (this.rotations[i].rotationTypeId == rotationTypes[j].id) {
                        return rotationTypes[j].inpatient;
                    }
                }
            }
        }
        throw "Didn't find doctor in rotations.";
    }
    this.removeDoctor = function (doctor) {
        var index = -1;
        for (var i = 0; i < this.rotations.length; i++) {
            if (this.rotations[i].doctor.id == doctor.id) {
                index = i;
                break;
            }
        }
        this.rotations.splice(index, 1);
    };
    this.isComplete = function () {
        for (var i = 0; i < this.rotations.length; i++) {
            if (!this.rotations[i].rotationTypeId) {
                return false;
            }
        }
        return true;
    }
    this.findUnassignedRotation = function () {
        var rotationAndMonth = null;
        for (var i = 0; i < this.rotations.length; i++) {
            if (!this.rotations[i].rotationTypeId) {
                return { rotation: this.rotations[i], month: this };
            }
        }
        return null;
    }
    this.numRotationsOfType = function (rotationType) {
        var num = 0;
        for (var i = 0; i < this.rotations.length; i++) {
            if (this.rotations[i].rotationTypeId && this.rotations[i].rotationTypeId === rotationType.id) {
                num++;
            }
        }
        return num;
    }
}

function Rotation(doctor, rotationTypeId, isConstraint) {
    this.doctor = doctor;
    this.rotationTypeId = rotationTypeId;
    this.isConstraint = isConstraint;
}

function Doctor(id, name) {
    this.id = id;
    this.name = name;
    this.rotationTypesNeeded = {}
}

function Solve(schedule, rotationTypes) {
    if (schedule.isComplete()) {
        return true;
    }

    var rotationAndMonth = schedule.findUnassignedRotation();

    if (!rotationAndMonth) {
        throw "Schedule is not complete but couldn't find unassigned rotation.";
    }

    var month = rotationAndMonth.month;
    var rotation = rotationAndMonth.rotation;

    for (var i = 0; i < rotationTypes.length; i++) {
        var rotationType = rotationTypes[i];
        var numExistingRotationsOfType = month.numRotationsOfType(rotationType);
        if (!month.rotationTypesNeeded[rotationType.id] ||
            numExistingRotationsOfType >= month.rotationTypesNeeded[rotationType.id]) {
            continue;
        }

        // Check constraint on number of rotation types for this doctor.
        var numRotationTypesForDoctor = schedule.getNumRotationTypesForDoctor(rotation.doctor, rotationType.id);
        if (!rotation.doctor.rotationTypesNeeded[rotationType.id] ||
            numRotationTypesForDoctor >= rotation.doctor.rotationTypesNeeded[rotationType.id])
        {
            continue;
        }

        // Check constraint on number of consecutive inpatient shifts.
        if (rotationType.inpatient) {
            var numRotationsToTheLeft = 0;
            var j = month.monthNumber - 1;
            while (j >= 0 && schedule.months[j].doctorHasInpatientRotation(rotation.doctor, rotationTypes)) {
                numRotationsToTheLeft++;
                j--;
            }
            var numRotationsToTheRight = 0;
            j = month.monthNumber + 1;
            while (j < schedule.months.length && schedule.months[j].doctorHasInpatientRotation(rotation.doctor, rotationTypes)) {
                numRotationsToTheRight++;
                j++;
            }
            if ((numRotationsToTheLeft + numRotationsToTheRight + 1) > schedule.maxConsecutiveInpatientRotations) {
                continue;
            }
        }

        // Check constraint on number of consecutive rotations by type.
        if (schedule.maxConsecutiveRotationTypes[rotationType.id] &&
            schedule.maxConsecutiveRotationTypes[rotationType.id] > 1) {
            var numRotationsToTheLeft = 0;
            var j = month.monthNumber - 1;
            while (j >= 0 && schedule.months[j].doctorHasRotation(rotation.doctor, rotationType.id)) {
                numRotationsToTheLeft++;
                j--;
            }
            var numRotationsToTheRight = 0;
            j = month.monthNumber + 1;
            while (j < schedule.months.length && schedule.months[j].doctorHasRotation(rotation.doctor, rotationType.id)) {
                numRotationsToTheRight++;
                j++;
            }
            if ((numRotationsToTheLeft + numRotationsToTheRight + 1) > schedule.maxConsecutiveRotationTypes[rotationType.id]) {
                continue;
            }
        }

        rotation.rotationTypeId = rotationType.id;
        var solved = Solve(schedule, rotationTypes);
        if (solved) {
            return true;
        }
        rotation.rotationTypeId = null;
    }

    return false;
}

angular.module('medScheduler', [])
  .controller('MedSchedulerController', function () {
      var medScheduler = this;

      medScheduler.schedule = new Schedule();
      medScheduler.schedule.maxConsecutiveInpatientRotations = 3;
      medScheduler.rotationTypeId = 8;
      medScheduler.rotationTypes = [
          { id: "1", name: 'CCU', inpatient: true },
          { id: "2", name: 'Elective' },
          { id: "3", name: 'Neurology' },          
          { id: "4", name: 'MCL' },
          { id: "5", name: 'MICU', inpatient: true },
          { id: "6", name: 'Vac/ER' },
          { id: "7", name: 'Wards', inpatient: true },          
      ];

      medScheduler.init = function () {
          medScheduler.doctors = [];
          medScheduler.addDoctor(new Doctor(1, 'Ali Fakhreddine'));
          medScheduler.addDoctor(new Doctor(2, 'Ehssan Bodingheimer'));
          medScheduler.doctorId = 3;
          medScheduler.schedule.months[0].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 1 };
          medScheduler.schedule.months[1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 1 };
          medScheduler.schedule.months[2].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 1 };
          medScheduler.schedule.months[3].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 1 };
          medScheduler.schedule.months[4].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 1 };
          medScheduler.schedule.months[5].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 1 };
          medScheduler.schedule.months[6].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 1 };
          medScheduler.schedule.months[7].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 1 };
          medScheduler.schedule.months[8].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 1 };
          medScheduler.schedule.months[9].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 1 };
          medScheduler.schedule.months[10].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 1 };
          medScheduler.schedule.months[11].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 1 };
          medScheduler.schedule.months[12].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 1 };
      }

      medScheduler.solve = function () {
          var solved = Solve(medScheduler.schedule, medScheduler.rotationTypes);
          if (!solved) {
              alert("Could not fill the schedule in a way that satisfies all the requirements.");
          }
      }

      medScheduler.addDoctor = function (doctor) {
          medScheduler.doctors.push(doctor);
          medScheduler.schedule.addDoctor(doctor);
      }

      medScheduler.addDoctorSubmit = function () {
          var doctor = new Doctor(medScheduler.doctorId, medScheduler.doctorText);
          medScheduler.doctorId++;
          medScheduler.doctorText = '';
          medScheduler.addDoctor(doctor);                           
      };

      medScheduler.removeDoctor = function (doctor) {
          var index = -1;
          for (var i=0; i < medScheduler.doctors.length; i++) {
              if (medScheduler.doctors[i].id == doctor.id) {
                  index = i;
                  break;
              }
          }
          medScheduler.doctors.splice(index, 1);
          medScheduler.schedule.removeDoctor(doctor);
      };

      medScheduler.addRotationType = function () {
          medScheduler.rotationTypes.push({ id: medScheduler.rotationTypeId.toString(), name: medScheduler.rotationTypeText, inpatient: medScheduler.inpatientCheckbox });
          medScheduler.rotationTypeText = '';
          medScheduler.inpatientCheckbox = false;
          medScheduler.rotationTypeId++;
      };

      medScheduler.removeRotationType = function (rotationType) {
          var index = -1;
          for (var i = 0; i < medScheduler.rotationTypes.length; i++) {
              if (medScheduler.rotationTypes[i].id == rotationType.id) {
                  index = i;
                  break;
              }
          }
          medScheduler.rotationTypes.splice(index, 1);
      };

      medScheduler.tableValueChanged = function (rotation) {
          if (rotation.rotationTypeId) {
              rotation.isConstraint = true;
          } else {
              rotation.isConstraint = false;
          }
      }

      medScheduler.clearSchedule = function () {
          for (var i = 0; i < medScheduler.schedule.months.length; i++) {
              for (var j = 0; j < medScheduler.schedule.months[i].rotations.length; j++) {
                  medScheduler.schedule.months[i].rotations[j].rotationTypeId = null;
              }
          }
      }

      medScheduler.init();
  });