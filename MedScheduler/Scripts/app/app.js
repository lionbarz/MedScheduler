function add(a, b) {
    return a + b;
}

function sumValues(obj) {
    var total = 0;
    Object.keys(obj).forEach(function (key) {
        var val = obj[key];
        // use val
        total = total + val;
    });
    return total;
}

function Schedule() {
    this.maxConsecutiveRotationTypes = { "1": 1, "2": 1, "3": 1, "4": 1, "5": 1, "6": 2, "7": 2, "8": 2, "9": 1, "10": 1, "11": 1, "12": 1, "13": 6 };
    this.doctors = [];
    this.rotationTypes = [];
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
    this.unassignedRotations = [];
    // Doctor ID to object of type ID to num of rotations across all months.
    this.numRotationTypesByDoctor = {};
    this.initCachesForSolving = function () {
        // Unassigned rotations.
        this.unassignedRotations = [];
        for (var i = 0; i < this.months.length; i++) {
            for (var j = 0; j < this.months[i].rotations.length; j++) {
                if (!this.months[i].rotations[j].rotationTypeId) {
                    this.unassignedRotations.push(this.months[i].rotations[j]);
                }
            }
        }

        // Num rotations by type for doctors.
        this.numRotationTypesByDoctor = {};
        for (var i = 0; i < this.doctors.length; i++) {
            this.numRotationTypesByDoctor[this.doctors[i].id] = {};
            for (var j = 0; j < this.rotationTypes.length; j++) {
                this.numRotationTypesByDoctor[this.doctors[i].id][this.rotationTypes[j].id] = 0;
            }
        }
        for (var k = 0; k < this.months.length ; k++) {
            for (var l = 0; l < this.months[k].rotations ; l++) {
                var rotation = this.months[k].rotations[l];
                this.numRotationTypesByDoctor[rotation.doctor.id][rotation.rotationTypeId]++;
            }
        }

        // Num rotations by type per month.
        for (var i = 0; i < this.months.length; i++) {
            this.months[i].initNumRotationsByType(this.rotationTypes);
        }
    }
    this.removeDoctor = function (doctor) {
        for (var i = 0; i < this.months.length; i++) {
            this.months[i].removeDoctor(doctor);
        }
    };
    this.addDoctor = function (doctor) {
        for (var i = 0; i < this.months.length; i++) {
            this.months[i].rotations.push(new Rotation(this.months[i], doctor, null, false));
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
}

function ScheduleMonth(monthNumber, name) {
    this.name = name;
    this.monthNumber = monthNumber;
    this.rotations = [];
    this.rotationTypesNeeded = {};
    this.numRotationsByType = {};
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
    this.initNumRotationsByType = function (rotationTypes) {
        this.numRotationsByType = {};
        for (var i = 0; i < rotationTypes.length; i++) {
            this.numRotationsByType[rotationTypes[i].id] = 0;
        }
        for (var i = 0; i < rotationTypes.length; i++) {
            for (var j = 0; j < this.rotations.length; j++) {
                if (this.rotations[j].rotationTypeId && this.rotations[j].rotationTypeId === rotationTypes[i].id) {
                    this.numRotationsByType[rotationTypes[i].id]++;
                }
            }
        }
    }
}

function Rotation(month, doctor, rotationTypeId, isConstraint) {
    this.month = month;
    this.doctor = doctor;
    this.rotationTypeId = rotationTypeId;
    this.isConstraint = isConstraint;
}

function Doctor(id, name) {
    this.id = id;
    this.name = name;
    this.rotationTypesNeeded = {}
}

var numSolveAttempts = 0;

function Solve(schedule) {

    if (numSolveAttempts % 100000 == 0) {
        console.log("Solve attempts: " + numSolveAttempts);
    }

    numSolveAttempts++;

    var unassignedRotation = schedule.unassignedRotations.pop();

    // The schedule is complete -- no more unassigned rotations.
    if (!unassignedRotation) {
        return true;
    }

    for (var i = 0; i < schedule.rotationTypes.length; i++) {
        var rotationType = schedule.rotationTypes[i];
        var numExistingRotationsOfType = unassignedRotation.month.numRotationsByType[rotationType.id];
        if (!unassignedRotation.month.rotationTypesNeeded[rotationType.id] ||
            numExistingRotationsOfType >= unassignedRotation.month.rotationTypesNeeded[rotationType.id]) {
            continue;
        }

        // Check constraint on number of rotation types for this doctor.        
        var numRotationTypesForDoctor = schedule.numRotationTypesByDoctor[unassignedRotation.doctor.id][rotationType.id];
        if (!unassignedRotation.doctor.rotationTypesNeeded[rotationType.id] ||
            numRotationTypesForDoctor >= unassignedRotation.doctor.rotationTypesNeeded[rotationType.id])
        {
            continue;
        }
        
        /*
        // Check constraint on number of consecutive inpatient shifts.        
        if (rotationType.inpatient) {
            var numRotationsToTheLeft = 0;
            var j = unassignedRotation.month.monthNumber - 1;
            while (j >= 0 && schedule.months[j].doctorHasInpatientRotation(unassignedRotation.doctor, schedule.rotationTypes)) {
                numRotationsToTheLeft++;
                j--;
            }
            var numRotationsToTheRight = 0;
            j = unassignedRotation.month.monthNumber + 1;
            while (j < schedule.months.length && schedule.months[j].doctorHasInpatientRotation(unassignedRotation.doctor, schedule.rotationTypes)) {
                numRotationsToTheRight++;
                j++;
            }
            if ((numRotationsToTheLeft + numRotationsToTheRight + 1) > schedule.maxConsecutiveInpatientRotations) {
                continue;
            }
        }
        */
        /*
        // Check constraint on number of consecutive rotations by type.
        if (schedule.maxConsecutiveRotationTypes[rotationType.id] &&
            schedule.maxConsecutiveRotationTypes[rotationType.id] > 1) {
            var numRotationsToTheLeft = 0;
            var j = unassignedRotation.month.monthNumber - 1;
            while (j >= 0 && schedule.months[j].doctorHasRotation(unassignedRotation.doctor, rotationType.id)) {
                numRotationsToTheLeft++;
                j--;
            }
            var numRotationsToTheRight = 0;
            j = unassignedRotation.month.monthNumber + 1;
            while (j < schedule.months.length && schedule.months[j].doctorHasRotation(unassignedRotation.doctor, rotationType.id)) {
                numRotationsToTheRight++;
                j++;
            }
            if ((numRotationsToTheLeft + numRotationsToTheRight + 1) > schedule.maxConsecutiveRotationTypes[rotationType.id]) {
                continue;
            }
        }
        */

        unassignedRotation.rotationTypeId = rotationType.id;
        schedule.numRotationTypesByDoctor[unassignedRotation.doctor.id][rotationType.id]++;
        unassignedRotation.month.numRotationsByType[rotationType.id]++;
        var solved = Solve(schedule);
        if (solved) {
            return true;
        }
        unassignedRotation.rotationTypeId = null;
        schedule.numRotationTypesByDoctor[unassignedRotation.doctor.id][rotationType.id]--;
        unassignedRotation.month.numRotationsByType[rotationType.id]--;
    }

    schedule.unassignedRotations.push(unassignedRotation);
    return false;
}

angular.module('medScheduler', [])
  .controller('MedSchedulerController', function () {
      var medScheduler = this;

      medScheduler.schedule = new Schedule();
      medScheduler.schedule.maxConsecutiveInpatientRotations = 4;
      medScheduler.schedule.rotationTypes = [
          { id: "1", name: 'CCU', inpatient: true },
          { id: "2", name: 'Elective' },
          { id: "3", name: 'Neurology' },
          { id: "4", name: 'MCL' },
          { id: "5", name: 'MICU', inpatient: true },
          { id: "6", name: 'Vac/ER' },
          { id: "7", name: 'Wards', inpatient: true },
          { id: "8", name: 'ETS', inpatient: true },
          { id: "9", name: 'CRS', inpatient: true },
          { id: "10", name: 'Ortho', inpatient: true },
          { id: "11", name: 'Plastics', inpatient: true },
          { id: "12", name: 'ENT/UROL', inpatient: true },
          { id: "13", name: 'N/A' },
      ];
      medScheduler.rotationTypeId = 14;

      medScheduler.init = function () {
          medScheduler.addDoctor(new Doctor(1, 'Bryan Berry'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(2, 'Alexander Chehrazi-Raffle'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(3, 'Jenna Chorath'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(4, 'Jeremy Chuang'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(5, 'Pishoy Haroun'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(6, 'Xuan Hoang'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(7, 'Farhan Husain'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(8, 'Elizabeth Hutchins'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(9, 'Christopher Hwe'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(10, 'Benjamin Lidgard'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(11, 'Alexandra Ly'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(12, 'Dev Patel'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(13, 'Nisha Punter'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(14, 'Mohammad Shahshahan'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(15, 'Muhammad Shuaib'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(16, 'Christopher Swaim'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(17, 'Joel Tourtellotte'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(18, 'Kelly Wang'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 1, "3": 1, "4": 2, "5": 1, "6": 2, "7": 5, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(19, 'Xiao Bi'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 2, "3": 0, "4": 0, "5": 1, "6": 2, "7": 4, "8": 2, "9": 0, "10": 0, "11": 0, "12": 1, "13": 0 };
          medScheduler.addDoctor(new Doctor(20, 'Brandon Cohen'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 2, "3": 1, "4": 0, "5": 0, "6": 2, "7": 4, "8": 1, "9": 1, "10": 1, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(21, 'Nima Harandi'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 2, "3": 1, "4": 0, "5": 0, "6": 2, "7": 4, "8": 1, "9": 0, "10": 0, "11": 1, "12": 1, "13": 0 };
          medScheduler.addDoctor(new Doctor(22, 'Frank Hebroni'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 0, "3": 0, "4": 0, "5": 0, "6": 2, "7": 4, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 6 };
          medScheduler.addDoctor(new Doctor(23, 'Matin Khoshnevis'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 2, "3": 0, "4": 0, "5": 1, "6": 2, "7": 4, "8": 1, "9": 1, "10": 0, "11": 1, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(24, 'Jose Lopez'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 2, "3": 0, "4": 0, "5": 1, "6": 2, "7": 4, "8": 1, "9": 0, "10": 1, "11": 0, "12": 1, "13": 0 };
          medScheduler.addDoctor(new Doctor(25, 'Huy Ly'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 2, "3": 0, "4": 0, "5": 1, "6": 2, "7": 4, "8": 2, "9": 0, "10": 1, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(26, 'Tuyet Nguyen'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 2, "3": 1, "4": 0, "5": 0, "6": 2, "7": 4, "8": 2, "9": 0, "10": 0, "11": 0, "12": 1, "13": 0 };
          medScheduler.addDoctor(new Doctor(27, 'Kelsey Pomykala'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 2, "3": 0, "4": 0, "5": 1, "6": 2, "7": 4, "8": 2, "9": 0, "10": 1, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(28, 'Yasmin Qaseem'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 2, "3": 0, "4": 0, "5": 1, "6": 2, "7": 4, "8": 1, "9": 1, "10": 1, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(29, 'Ann Quan'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 2, "3": 0, "4": 0, "5": 1, "6": 2, "7": 4, "8": 2, "9": 0, "10": 1, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(30, 'Kevin Russo'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 2, "3": 1, "4": 0, "5": 0, "6": 2, "7": 4, "8": 2, "9": 0, "10": 1, "11": 0, "12": 0, "13": 0 };
          medScheduler.addDoctor(new Doctor(31, 'Ashley Sharp'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 2, "3": 0, "4": 0, "5": 1, "6": 2, "7": 4, "8": 2, "9": 0, "10": 0, "11": 0, "12": 1, "13": 0 };
          medScheduler.addDoctor(new Doctor(32, 'Megan Sue'));
          medScheduler.schedule.doctors[medScheduler.schedule.doctors.length - 1].rotationTypesNeeded = { "1": 1, "2": 2, "3": 0, "4": 0, "5": 1, "6": 2, "7": 4, "8": 1, "9": 1, "10": 0, "11": 1, "12": 0, "13": 0 };
          medScheduler.doctorId = 33;
          medScheduler.schedule.months[0].rotationTypesNeeded = { "1": 4, "2": 6, "3": 0, "4": 3, "5": 1, "6": 0, "7": 13, "8": 2, "9": 0, "10": 1, "11": 1, "12": 0, "13": 1 };
          medScheduler.schedule.months[1].rotationTypesNeeded = { "1": 2, "2": 8, "3": 3, "4": 4, "5": 1, "6": 0, "7": 10, "8": 1, "9": 0, "10": 1, "11": 1, "12": 0, "13": 1 };
          medScheduler.schedule.months[2].rotationTypesNeeded = { "1": 1, "2": 5, "3": 1, "4": 3, "5": 4, "6": 2, "7": 12, "8": 3, "9": 1, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.schedule.months[3].rotationTypesNeeded = { "1": 3, "2": 4, "3": 2, "4": 3, "5": 2, "6": 2, "7": 11, "8": 2, "9": 1, "10": 1, "11": 0, "12": 1, "13": 0 };
          medScheduler.schedule.months[4].rotationTypesNeeded = { "1": 3, "2": 1, "3": 3, "4": 3, "5": 2, "6": 5, "7": 10, "8": 3, "9": 0, "10": 1, "11": 0, "12": 0, "13": 1 };
          medScheduler.schedule.months[5].rotationTypesNeeded = { "1": 2, "2": 2, "3": 2, "4": 2, "5": 3, "6": 10, "7": 10, "8": 1, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.schedule.months[6].rotationTypesNeeded = { "1": 3, "2": 1, "3": 2, "4": 2, "5": 2, "6": 8, "7": 12, "8": 1, "9": 0, "10": 0, "11": 0, "12": 1, "13": 0 };
          medScheduler.schedule.months[7].rotationTypesNeeded = { "1": 3, "2": 4, "3": 2, "4": 3, "5": 4, "6": 4, "7": 12, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.schedule.months[8].rotationTypesNeeded = { "1": 1, "2": 6, "3": 1, "4": 3, "5": 2, "6": 2, "7": 12, "8": 1, "9": 0, "10": 2, "11": 0, "12": 1, "13": 1 };
          medScheduler.schedule.months[9].rotationTypesNeeded = { "1": 2, "2": 3, "3": 1, "4": 2, "5": 2, "6": 7, "7": 11, "8": 1, "9": 1, "10": 1, "11": 0, "12": 1, "13": 0 };
          medScheduler.schedule.months[10].rotationTypesNeeded = { "1": 3, "2": 1, "3": 1, "4": 3, "5": 2, "6": 7, "7": 12, "8": 1, "9": 0, "10": 0, "11": 0, "12": 1, "13": 1 };
          medScheduler.schedule.months[11].rotationTypesNeeded = { "1": 2, "2": 3, "3": 2, "4": 3, "5": 2, "6": 9, "7": 9, "8": 1, "9": 1, "10": 0, "11": 0, "12": 0, "13": 0 };
          medScheduler.schedule.months[12].rotationTypesNeeded = { "1": 3, "2": 0, "3": 2, "4": 2, "5": 0, "6": 8, "7": 12, "8": 3, "9": 0, "10": 0, "11": 1, "12": 0, "13": 1 };
      }

      medScheduler.solve = function () {
          numSolveAttempts = 0;
          medScheduler.schedule.initCachesForSolving();
          var solved = Solve(medScheduler.schedule);
          if (!solved) {
              alert("Could not fill the schedule in a way that satisfies all the requirements.");
          }
      }

      medScheduler.addDoctor = function (doctor) {
          medScheduler.schedule.doctors.push(doctor);
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
          for (var i=0; i < medScheduler.schedule.doctors.length; i++) {
              if (medScheduler.schedule.doctors[i].id == doctor.id) {
                  index = i;
                  break;
              }
          }
          medScheduler.schedule.doctors.splice(index, 1);
          medScheduler.schedule.removeDoctor(doctor);
      };

      medScheduler.addRotationType = function () {
          medScheduler.schedule.rotationTypes.push({ id: medScheduler.rotationTypeId.toString(), name: medScheduler.rotationTypeText, inpatient: medScheduler.inpatientCheckbox });
          medScheduler.rotationTypeText = '';
          medScheduler.inpatientCheckbox = false;
          medScheduler.rotationTypeId++;
      };

      medScheduler.removeRotationType = function (rotationType) {
          var index = -1;
          for (var i = 0; i < medScheduler.schedule.rotationTypes.length; i++) {
              if (medScheduler.schedule.rotationTypes[i].id == rotationType.id) {
                  index = i;
                  break;
              }
          }
          medScheduler.schedule.rotationTypes.splice(index, 1);
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