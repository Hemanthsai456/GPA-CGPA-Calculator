const gradePoints = {
    S: 10,
    A: 9,
    B: 8,
    C: 7,
    D: 6,
    E: 5,
    F: 0
};

// DOM Elements

const semesterSelect = document.getElementById("semester");

const subjectName = document.getElementById("subjectName");
const credits = document.getElementById("credits");
const grade = document.getElementById("grade");

const addBtn = document.getElementById("addBtn");

const tableBody = document.getElementById("tableBody");

const gpaText = document.getElementById("gpa");
const cgpaText = document.getElementById("cgpa");

const totalCreditsText = document.getElementById("totalCredits");
const totalSubjectsText = document.getElementById("totalSubjects");

const manualSemester = document.getElementById("manualSemester");
const manualGPA = document.getElementById("manualGPA");
const manualCredits = document.getElementById("manualCredits");
const saveManualBtn = document.getElementById("saveManualBtn");

const futureSemester = document.getElementById("futureSemester");
const futureGpa = document.getElementById("futureGpa");
const simulateBtn = document.getElementById("simulateBtn");
const projectedCgpa = document.getElementById("projectedCgpa");

let editIndex = -1;

// Local Storage

function getData() {

    const data = JSON.parse(localStorage.getItem("cgpaData"));

    if (data) return data;

    return {
        subjects: {},
        manualGPA: {}
    };

}

function saveData(data) {

    localStorage.setItem(
        "cgpaData",
        JSON.stringify(data)
    );

}

function currentSemester() {

    return semesterSelect.value;

}

// Subject CRUD

function addSubject() {

    const name = subjectName.value.trim();
    const credit = Number(credits.value);
    const gradeValue = grade.value;

    if (!name || !credit || !gradeValue) {
        alert("Fill all fields");
        return;
    }

    if (credit <= 0) {
        alert("Invalid Credits");
        return;
    }

    const data = getData();

    const sem = currentSemester();

    if (!data.subjects[sem]) {

        data.subjects[sem] = [];

    }

    const duplicate = data.subjects[sem].find((sub, index) => {

        if (editIndex === index) return false;

        return sub.name.toLowerCase() === name.toLowerCase();

    });

    if (duplicate) {

        alert("Subject already exists");
        return;

    }

    const subject = {

        name,
        credits: credit,
        grade: gradeValue

    };

    if (editIndex === -1) {

        data.subjects[sem].push(subject);

    }

    else {

        data.subjects[sem][editIndex] = subject;

        editIndex = -1;

        addBtn.innerText = "Add Subject";

    }

    saveData(data);

    clearInputs();

    loadSubjects();

}

function editSubject(index) {

    const data = getData();

    const sem = currentSemester();

    const subject = data.subjects[sem][index];

    subjectName.value = subject.name;
    credits.value = subject.credits;
    grade.value = subject.grade;

    editIndex = index;

    addBtn.innerText = "Update Subject";

}

function deleteSubject(index) {

    const data = getData();

    const sem = currentSemester();

    data.subjects[sem].splice(index, 1);

    saveData(data);

    loadSubjects();

}

// Helpers

function clearInputs() {

    subjectName.value = "";
    credits.value = "";
    grade.value = "";

}

function renderTable(subjects) {

    tableBody.innerHTML = "";

    subjects.forEach((sub, index) => {

        tableBody.innerHTML += `

        <tr>

            <td>${index + 1}</td>

            <td>${sub.name}</td>

            <td>${sub.credits}</td>

            <td>${sub.grade}</td>

            <td>${gradePoints[sub.grade]}</td>

            <td>

                <button class="edit-btn"
                    onclick="editSubject(${index})">

                    Edit

                </button>

                <button class="delete-btn"
                    onclick="deleteSubject(${index})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

function loadSubjects() {

    const data = getData();

    const sem = currentSemester();

    const subjects = data.subjects[sem] || [];

    renderTable(subjects);

    calculateSemesterGPA();

    calculateCGPA();

    updateStats();

}

// Semester GPA

function calculateSemesterGPA() {

    const data = getData();

    const sem = currentSemester();

    const subjects = data.subjects[sem] || [];

    let totalCredits = 0;
    let totalPoints = 0;

    subjects.forEach(sub => {

        totalCredits += sub.credits;

        totalPoints += sub.credits * gradePoints[sub.grade];

    });

    const gpa = totalCredits
        ? totalPoints / totalCredits
        : 0;

    gpaText.innerText = gpa.toFixed(2);

}

// CGPA

function calculateCGPA() {

    const data = getData();

    let totalCredits = 0;
    let totalPoints = 0;

    // Subject based semesters

    Object.values(data.subjects).forEach(subjects => {

        subjects.forEach(sub => {

            totalCredits += sub.credits;

            totalPoints += sub.credits * gradePoints[sub.grade];

        });

    });

    // Manual GPA semesters

    Object.values(data.manualGPA).forEach(semester => {

        totalCredits += semester.credits;

        totalPoints += semester.gpa * semester.credits;

    });

    const cgpa = totalCredits
        ? totalPoints / totalCredits
        : 0;

    cgpaText.innerText = cgpa.toFixed(2);

}

// Statistics

function updateStats() {

    const data = getData();

    const sem = currentSemester();

    const subjects = data.subjects[sem] || [];

    let credits = 0;

    subjects.forEach(sub => {

        credits += sub.credits;

    });

    totalCreditsText.innerText = credits;

    totalSubjectsText.innerText = subjects.length;

}

// Manual GPA

function saveManualSemester() {

    const sem = manualSemester.value;

    const gpa = Number(manualGPA.value);

    const credits = Number(manualCredits.value);

    if (!gpa || !credits) {

        alert("Fill all fields");

        return;

    }

    if (gpa < 0 || gpa > 10) {

        alert("GPA must be between 0 and 10");

        return;

    }

    if (credits <= 0) {

        alert("Invalid Credits");

        return;

    }

    const data = getData();

    // Ignore if subject data already exists

    if (
        data.subjects[sem] &&
        data.subjects[sem].length > 0
    ) {

        alert("This semester already has subjects.");

        return;

    }

    data.manualGPA[sem] = {

        gpa,
        credits

    };

    saveData(data);

    manualGPA.value = "";

    manualCredits.value = "";

    calculateCGPA();

    alert("Semester GPA Saved");

}

// What If Mode

function simulateCGPA() {

    const expectedGPA = Number(futureGpa.value);

    if (!expectedGPA) {

        alert("Enter Expected GPA");

        return;

    }

    if (expectedGPA < 0 || expectedGPA > 10) {

        alert("Invalid GPA");

        return;

    }

    const data = getData();

    let totalCredits = 0;

    let totalPoints = 0;

    // Existing subject semesters

    Object.values(data.subjects).forEach(subjects => {

        subjects.forEach(sub => {

            totalCredits += sub.credits;

            totalPoints += sub.credits * gradePoints[sub.grade];

        });

    });

    // Existing manual semesters

    Object.values(data.manualGPA).forEach(semester => {

        totalCredits += semester.credits;

        totalPoints += semester.gpa * semester.credits;

    });

    // Future semester credits

    const assumedCredits = 20;

    totalCredits += assumedCredits;

    totalPoints += expectedGPA * assumedCredits;

    const projected = totalPoints / totalCredits;

    projectedCgpa.innerText = projected.toFixed(2);

}

// Event Listeners

addBtn.addEventListener("click", addSubject);

saveManualBtn.addEventListener("click", saveManualSemester);

simulateBtn.addEventListener("click", simulateCGPA);

semesterSelect.addEventListener("change", () => {

    editIndex = -1;

    addBtn.innerText = "Add Subject";

    loadSubjects();

});

// Initialize

(function initialize() {

    const data = getData();

    // Ensure structure exists

    if (!data.subjects) {

        data.subjects = {};

    }

    if (!data.manualGPA) {

        data.manualGPA = {};

    }

    saveData(data);

    loadSubjects();

})();

// Enter Key Support

subjectName.addEventListener("keypress", e => {

    if (e.key === "Enter") {

        addSubject();

    }

});

credits.addEventListener("keypress", e => {

    if (e.key === "Enter") {

        addSubject();

    }

});

grade.addEventListener("keypress", e => {

    if (e.key === "Enter") {

        addSubject();

    }

});

manualGPA.addEventListener("keypress", e => {

    if (e.key === "Enter") {

        saveManualSemester();

    }

});

manualCredits.addEventListener("keypress", e => {

    if (e.key === "Enter") {

        saveManualSemester();

    }

});

futureGpa.addEventListener("keypress", e => {

    if (e.key === "Enter") {

        simulateCGPA();

    }

});

// Clear All Data

function clearAllData() {

    const confirmDelete = confirm(
        "Delete all GPA and CGPA data?"
    );

    if (!confirmDelete) return;

    localStorage.removeItem("cgpaData");

    location.reload();

}