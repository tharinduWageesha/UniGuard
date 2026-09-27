document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       GET FORM ELEMENTS
    ========================================= */
/* =========================================
   SIMPLE CSV PARSER
   No external library required
========================================= */

function parseCSV(csvText) {

    const rows = [];

    let currentRow = [];
    let currentValue = "";

    let insideQuotes = false;


    for (let i = 0; i < csvText.length; i++) {

        const char = csvText[i];
        const nextChar = csvText[i + 1];


        /* =========================================
           QUOTATION MARK
        ========================================= */

        if (char === '"') {

            if (
                insideQuotes &&
                nextChar === '"'
            ) {

                currentValue += '"';

                i++;

            } else {

                insideQuotes = !insideQuotes;

            }

            continue;
        }


        /* =========================================
           COMMA
        ========================================= */

        if (
            char === "," &&
            !insideQuotes
        ) {

            currentRow.push(currentValue);

            currentValue = "";

            continue;
        }


        /* =========================================
           NEW LINE
        ========================================= */

        if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                nextChar === "\n"
            ) {

                i++;

            }

            currentRow.push(currentValue);

            rows.push(currentRow);

            currentRow = [];

            currentValue = "";

            continue;
        }


        /* =========================================
           NORMAL CHARACTER
        ========================================= */

        currentValue += char;

    }


    /* =========================================
       LAST VALUE / ROW
    ========================================= */

    if (
        currentValue !== "" ||
        currentRow.length > 0
    ) {

        currentRow.push(currentValue);

        rows.push(currentRow);

    }


    return rows;

}
    const form = document.getElementById("studentRegistrationForm");
    const clearFormBtn = document.getElementById("clearFormBtn");

    if (!form) {
        console.error("Student registration form was not found.");
        return;
    }

    

    /* =========================================
       FORM VALIDATION
    ========================================= */

    function validateField(field) {

        const formGroup = field.closest(".form-group");

        if (!formGroup) {
            return true;
        }

        const value = field.value.trim();

        let isValid = true;


        /* Required field validation */
        if (field.hasAttribute("required") && value === "") {
            isValid = false;
        }


        /* Email validation */
        if (
            field.type === "email" &&
            value !== ""
        ) {

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(value)) {
                isValid = false;
            }
        }


        /* Sri Lankan phone number validation */
        if (
            field.type === "tel" &&
            value !== ""
        ) {

            const phonePattern =
                /^(?:\+94|94|0)?7[0-9]{8}$/;

            if (!phonePattern.test(value)) {
                isValid = false;
            }
        }


        /* Show or remove error */
        if (isValid) {
            formGroup.classList.remove("invalid");
        } else {
            formGroup.classList.add("invalid");
        }

        return isValid;
    }


    /* =========================================
       VALIDATE ALL REQUIRED FIELDS
    ========================================= */

    function validateForm() {

        const fields = form.querySelectorAll(
            "input[required], select[required], textarea[required]"
        );

        let formIsValid = true;

        fields.forEach(function (field) {

            const fieldIsValid = validateField(field);

            if (!fieldIsValid) {
                formIsValid = false;
            }

        });

        return formIsValid;
    }


    /* =========================================
       REAL-TIME VALIDATION
    ========================================= */

    const formFields = form.querySelectorAll(
        "input, select, textarea"
    );

    formFields.forEach(function (field) {

        const eventType =
            field.tagName === "SELECT"
                ? "change"
                : "input";

        field.addEventListener(eventType, function () {

            if (field.value.trim() !== "") {
                validateField(field);
            }

        });

    });


    /* =========================================
       FORM SUBMIT
    ========================================= */

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const isValid = validateForm();

        if (!isValid) {

            /* Scroll to first invalid field */
            const firstInvalidField =
                form.querySelector(".form-group.invalid");

            if (firstInvalidField) {

                firstInvalidField.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                const input =
                    firstInvalidField.querySelector(
                        "input, select, textarea"
                    );

                if (input) {
                    input.focus();
                }

            }

            alert(
                "Please correct the highlighted fields before registering the student."
            );

            return;
        }


        /* =========================================
           GET STUDENT DATA
        ========================================= */

        const studentData = {

            studentId:
                document.getElementById("studentId").value.trim(),

            nic:
                document.getElementById("nic").value.trim(),

            firstName:
                document.getElementById("firstName").value.trim(),

            lastName:
                document.getElementById("lastName").value.trim(),

            dob:
                document.getElementById("dob").value,

            gender:
                document.getElementById("gender").value,

            email:
                document.getElementById("email").value.trim(),

            phone:
                document.getElementById("phone").value.trim(),

            faculty:
                document.getElementById("faculty").value,

            department:
                document.getElementById("department").value.trim(),

            programme:
                document.getElementById("programme").value.trim(),

            academicYear:
                document.getElementById("academicYear").value,

            address:
                document.getElementById("address").value.trim(),

            city:
                document.getElementById("city").value.trim(),

            district:
                document.getElementById("district").value.trim(),

            emergencyName:
                document.getElementById("emergencyName").value.trim(),

            relationship:
                document.getElementById("relationship").value.trim(),

            emergencyPhone:
                document.getElementById("emergencyPhone").value.trim(),

            registeredAt:
                new Date().toISOString()

        };


        /* =========================================
           SAVE TO LOCAL STORAGE
           Temporary frontend storage
        ========================================= */

        let registeredStudents = [];

        try {

            const savedStudents =
                localStorage.getItem("registeredStudents");

            if (savedStudents) {
                registeredStudents =
                    JSON.parse(savedStudents);
            }

        } catch (error) {

            console.error(
                "Error reading student data:",
                error
            );

            registeredStudents = [];

        }


        /* Check duplicate Student ID */
        const duplicateStudent =
            registeredStudents.find(function (student) {

                return (
                    student.studentId.toLowerCase() ===
                    studentData.studentId.toLowerCase()
                );

            });


        if (duplicateStudent) {

            const studentIdField =
                document.getElementById("studentId");

            const studentIdGroup =
                studentIdField.closest(".form-group");

            if (studentIdGroup) {
                studentIdGroup.classList.add("invalid");
            }

            studentIdField.focus();

            alert(
                "This Student ID is already registered. Please use a different Student ID."
            );

            return;
        }


        /* Save new student */
        registeredStudents.push(studentData);

        localStorage.setItem(
            "registeredStudents",
            JSON.stringify(registeredStudents)
        );


        /* =========================================
           SUCCESS MESSAGE
        ========================================= */

        alert(
            "Student registered successfully!\n\n" +
            "Student: " +
            studentData.firstName +
            " " +
            studentData.lastName +
            "\nStudent ID: " +
            studentData.studentId
        );


        console.log(
            "Student Registration Successful:",
            studentData
        );


        /* Reset form */
        form.reset();


        /* Remove validation errors */
        form.querySelectorAll(".form-group.invalid")
            .forEach(function (group) {

                group.classList.remove("invalid");

            });

    });


    /* =========================================
       CLEAR FORM BUTTON
    ========================================= */

    if (clearFormBtn) {

        clearFormBtn.addEventListener(
            "click",
            function () {

                /* Small delay because button type="reset" */
                setTimeout(function () {

                    form.querySelectorAll(
                        ".form-group.invalid"
                    ).forEach(function (group) {

                        group.classList.remove("invalid");

                    });

                }, 0);

            }
        );

    }


    /* =========================================
       SIDEBAR NAVIGATION
       Closes mobile sidebar after clicking
    ========================================= */

    const sidebar = document.getElementById("sidebar");

    const navItems = document.querySelectorAll(
        ".sidebar-nav .nav-item"
    );

    navItems.forEach(function (item) {

        item.addEventListener("click", function () {

            if (
                sidebar &&
                window.innerWidth <= 768
            ) {

                sidebar.classList.remove("open");

            }

        });

    });


    /* =========================================
       STUDENT REGISTRATION PAGE READY
    ========================================= */

    console.log(
        "Student Registration page loaded successfully."
    );


    /* =========================================
   BULK IMPORT STUDENTS
========================================= */

const bulkImportBtn = document.getElementById("bulkImportBtn");
const bulkImportFile = document.getElementById("bulkImportFile");


/* =========================================
   OPEN FILE SELECTOR
========================================= */

if (bulkImportBtn && bulkImportFile) {

    bulkImportBtn.addEventListener("click", function () {

        bulkImportFile.click();

    });

}


/* =========================================
   CSV FILE SELECTED
========================================= */

if (bulkImportFile) {

    bulkImportFile.addEventListener("change", function (event) {

        const file = event.target.files[0];

        if (!file) {
            return;
        }

        if (!file.name.toLowerCase().endsWith(".csv")) {

            alert("Please select a CSV file.");

            bulkImportFile.value = "";

            return;
        }

        const reader = new FileReader();


        reader.onload = function (event) {

            const csvText = event.target.result;

            importStudentsFromCSV(csvText);

        };


        reader.onerror = function () {

            alert("Unable to read the selected CSV file.");

        };


        reader.readAsText(file);

        /* Allow selecting same file again */
        bulkImportFile.value = "";

    });

}


/* =========================================
   CSV IMPORT FUNCTION
========================================= */

function importStudentsFromCSV(csvText) {

    if (!csvText || csvText.trim() === "") {

        alert("The CSV file is empty.");

        return;
    }


    const rows = parseCSV(csvText);


    if (rows.length < 2) {

        alert(
            "The CSV file must contain a header row and at least one student."
        );

        return;
    }


    /* =========================================
       REQUIRED CSV COLUMNS
    ========================================= */

    const requiredColumns = [
        "studentId",
        "nic",
        "firstName",
        "lastName",
        "dob",
        "gender",
        "email",
        "phone",
        "faculty",
        "department",
        "programme",
        "academicYear",
        "address",
        "city",
        "district",
        "emergencyName",
        "relationship",
        "emergencyPhone"
    ];


    const headers = rows[0].map(function (header) {

        return header
            .trim()
            .replace(/^"|"$/g, "");

    });


    /* =========================================
       CHECK CSV HEADERS
    ========================================= */

    const missingColumns = requiredColumns.filter(function (column) {

        return !headers.includes(column);

    });


    if (missingColumns.length > 0) {

        alert(
            "Invalid CSV file.\n\n" +
            "Missing columns:\n" +
            missingColumns.join(", ")
        );

        return;
    }


    /* =========================================
       GET EXISTING STUDENTS
    ========================================= */

    let registeredStudents = [];

    try {

        const savedStudents =
            localStorage.getItem("registeredStudents");

        if (savedStudents) {

            registeredStudents =
                JSON.parse(savedStudents);

        }

    } catch (error) {

        console.error(
            "Error reading registered students:",
            error
        );

        registeredStudents = [];

    }


    /* =========================================
       IMPORT COUNTERS
    ========================================= */

    let importedCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    const invalidRows = [];
    const duplicateRows = [];


    /* =========================================
       PROCESS EACH CSV ROW
    ========================================= */

    for (let i = 1; i < rows.length; i++) {

        const row = rows[i];


        /* Skip empty rows */

        if (
            row.length === 0 ||
            row.every(function (value) {
                return value.trim() === "";
            })
        ) {

            continue;
        }


        const student = {};


        headers.forEach(function (header, index) {

            student[header] =
                row[index] !== undefined
                    ? row[index].trim()
                    : "";

        });


        /* =========================================
           CHECK REQUIRED VALUES
        ========================================= */

        const missingValue =
            requiredColumns.some(function (column) {

                return !student[column];

            });


        if (missingValue) {

            invalidCount++;

            invalidRows.push(i + 1);

            continue;
        }


        /* =========================================
           CHECK EMAIL
        ========================================= */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(student.email)) {

            invalidCount++;

            invalidRows.push(i + 1);

            continue;
        }


        /* =========================================
           CHECK PHONE
        ========================================= */

        const phonePattern =
            /^(?:\+94|94|0)?7[0-9]{8}$/;


        if (!phonePattern.test(student.phone)) {

            invalidCount++;

            invalidRows.push(i + 1);

            continue;
        }


        /* =========================================
           CHECK EMERGENCY PHONE
        ========================================= */

        if (
            !phonePattern.test(
                student.emergencyPhone
            )
        ) {

            invalidCount++;

            invalidRows.push(i + 1);

            continue;
        }


        /* =========================================
           CHECK DUPLICATE STUDENT ID
        ========================================= */

        const duplicateStudent =
            registeredStudents.find(function (existingStudent) {

                return (
                    existingStudent.studentId &&
                    existingStudent.studentId.toLowerCase() ===
                    student.studentId.toLowerCase()
                );

            });


        if (duplicateStudent) {

            duplicateCount++;

            duplicateRows.push(i + 1);

            continue;
        }


        /* =========================================
           ADD REGISTRATION DATE
        ========================================= */

        student.registeredAt =
            new Date().toISOString();


        /* =========================================
           SAVE STUDENT
        ========================================= */

        registeredStudents.push(student);

        importedCount++;

    }


    /* =========================================
       SAVE TO LOCAL STORAGE
    ========================================= */

    if (importedCount > 0) {

        localStorage.setItem(
            "registeredStudents",
            JSON.stringify(registeredStudents)
        );

    }


    /* =========================================
       IMPORT RESULT
    ========================================= */

    let resultMessage =
        "Bulk Import Completed!\n\n" +

        "Successfully imported: " +
        importedCount + "\n" +

        "Duplicate Student IDs: " +
        duplicateCount + "\n" +

        "Invalid rows: " +
        invalidCount;


    if (duplicateRows.length > 0) {

        resultMessage +=
            "\n\nDuplicate rows: " +
            duplicateRows.join(", ");

    }


    if (invalidRows.length > 0) {

        resultMessage +=
            "\nInvalid rows: " +
            invalidRows.join(", ");

    }


    alert(resultMessage);

}
});

function updateGreeting() {
  const elements = document.querySelectorAll(".welcome-hi");
  if (!elements.length) return;
  const hour = new Date().getHours();
  let greetingText = "Good morning";
  if (hour >= 12 && hour < 17) {
    greetingText = "Good afternoon";
  } else if (hour >= 17) {
    greetingText = "Good evening";
  }
  elements.forEach((el) => {
    const text = el.textContent || "";
    const hasComma = text.trim().endsWith(",");
    el.textContent = greetingText + (hasComma ? "," : "");
  });
}

(function() { if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", updateGreeting); } else { updateGreeting(); } })();
