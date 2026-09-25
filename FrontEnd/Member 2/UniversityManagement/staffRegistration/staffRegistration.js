document.addEventListener("DOMContentLoaded", function () {


    /* =========================================
       GET FORM ELEMENTS
    ========================================= */

    const form =
        document.getElementById(
            "staffRegistrationForm"
        );

    const clearFormBtn =
        document.getElementById(
            "clearFormBtn"
        );


    if (!form) {

        console.error(
            "Staff registration form was not found."
        );

        return;
    }



    /* =========================================
       FORM VALIDATION
    ========================================= */

    function validateField(field) {

        const formGroup =
            field.closest(".form-group");


        if (!formGroup) {

            return true;

        }


        const value =
            field.value.trim();


        let isValid = true;



        /* Required field */

        if (
            field.hasAttribute("required") &&
            value === ""
        ) {

            isValid = false;

        }



        /* Email validation */

        if (
            isValid &&
            field.type === "email" &&
            value !== ""
        ) {

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(value)
            ) {

                isValid = false;

            }

        }



        /* Sri Lankan phone validation */

        if (
            isValid &&
            field.type === "tel" &&
            value !== ""
        ) {

            const phone =
                value.replace(
                    /[\s-]/g,
                    ""
                );


            const phonePattern =
                /^(?:\+94|94|0)?7[0-9]{8}$/;


            if (
                !phonePattern.test(phone)
            ) {

                isValid = false;

            }

        }



        /* Show / remove error */

        if (isValid) {

            formGroup.classList.remove(
                "invalid"
            );

        }
        else {

            formGroup.classList.add(
                "invalid"
            );

        }


        return isValid;

    }



    /* =========================================
       VALIDATE ALL REQUIRED FIELDS
    ========================================= */

    function validateForm() {

        const fields =
            form.querySelectorAll(
                "input[required], " +
                "select[required], " +
                "textarea[required]"
            );


        let formIsValid = true;


        fields.forEach(
            function (field) {

                const fieldIsValid =
                    validateField(field);


                if (!fieldIsValid) {

                    formIsValid = false;

                }

            }
        );


        return formIsValid;

    }



    /* =========================================
       REAL-TIME VALIDATION
    ========================================= */

    const formFields =
        form.querySelectorAll(
            "input, select, textarea"
        );


    formFields.forEach(
        function (field) {


            const eventType =
                field.tagName === "SELECT"
                    ? "change"
                    : "input";


            field.addEventListener(
                eventType,
                function () {

                    if (
                        field.value.trim() !== ""
                    ) {

                        validateField(field);

                    }

                }
            );

        }
    );



    /* =========================================
       FORM SUBMIT
    ========================================= */

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const isValid =
                validateForm();



            if (!isValid) {


                /* First invalid field */

                const firstInvalidField =
                    form.querySelector(
                        ".form-group.invalid"
                    );


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
                    "Please correct the highlighted fields before registering the staff member."
                );


                return;

            }



            /* =========================================
               GET STAFF DATA
            ========================================= */

            const staffData = {


                staffId:
                    document.getElementById(
                        "staffId"
                    ).value.trim(),


                nic:
                    document.getElementById(
                        "nic"
                    ).value.trim(),


                firstName:
                    document.getElementById(
                        "firstName"
                    ).value.trim(),


                lastName:
                    document.getElementById(
                        "lastName"
                    ).value.trim(),


                dob:
                    document.getElementById(
                        "dob"
                    ).value,


                gender:
                    document.getElementById(
                        "gender"
                    ).value,


                email:
                    document.getElementById(
                        "email"
                    ).value.trim(),


                phone:
                    document.getElementById(
                        "phone"
                    ).value.trim(),


                employeeType:
                    document.getElementById(
                        "employeeType"
                    ).value,


                designation:
                    document.getElementById(
                        "designation"
                    ).value.trim(),


                faculty:
                    document.getElementById(
                        "faculty"
                    ).value,


                department:
                    document.getElementById(
                        "department"
                    ).value.trim(),


                joiningDate:
                    document.getElementById(
                        "joiningDate"
                    ).value,


                employmentStatus:
                    document.getElementById(
                        "employmentStatus"
                    ).value,


                address:
                    document.getElementById(
                        "address"
                    ).value.trim(),


                city:
                    document.getElementById(
                        "city"
                    ).value.trim(),


                district:
                    document.getElementById(
                        "district"
                    ).value.trim(),


                emergencyName:
                    document.getElementById(
                        "emergencyName"
                    ).value.trim(),


                relationship:
                    document.getElementById(
                        "relationship"
                    ).value.trim(),


                emergencyPhone:
                    document.getElementById(
                        "emergencyPhone"
                    ).value.trim(),


                registeredAt:
                    new Date().toISOString()

            };



            /* =========================================
               SAVE TO LOCAL STORAGE
            ========================================= */

            let registeredStaff = [];


            try {


                const savedStaff =
                    localStorage.getItem(
                        "registeredStaff"
                    );


                if (savedStaff) {

                    registeredStaff =
                        JSON.parse(
                            savedStaff
                        );

                }


            }
            catch (error) {

                console.error(
                    "Error reading staff data:",
                    error
                );


                registeredStaff = [];

            }



            /* =========================================
               CHECK DUPLICATE STAFF ID
            ========================================= */

            const duplicateStaff =
                registeredStaff.find(
                    function (staff) {

                        return (
                            String(
                                staff.staffId
                            ).toLowerCase() ===

                            staffData.staffId
                                .toLowerCase()
                        );

                    }
                );



            if (duplicateStaff) {


                const staffIdField =
                    document.getElementById(
                        "staffId"
                    );


                const staffIdGroup =
                    staffIdField.closest(
                        ".form-group"
                    );


                if (staffIdGroup) {

                    staffIdGroup.classList.add(
                        "invalid"
                    );

                }


                staffIdField.focus();


                alert(
                    "This Staff ID is already registered. Please use a different Staff ID."
                );


                return;

            }



            /* =========================================
               SAVE NEW STAFF
            ========================================= */

            registeredStaff.push(
                staffData
            );


            localStorage.setItem(
                "registeredStaff",
                JSON.stringify(
                    registeredStaff
                )
            );



            /* =========================================
               SUCCESS MESSAGE
            ========================================= */

            alert(

                "Staff registered successfully!\n\n" +

                "Staff: " +

                staffData.firstName +

                " " +

                staffData.lastName +

                "\nStaff ID: " +

                staffData.staffId

            );



            console.log(
                "Staff Registration Successful:",
                staffData
            );



            /* =========================================
               RESET FORM
            ========================================= */

            form.reset();



            /* Remove validation errors */

            form.querySelectorAll(
                ".form-group.invalid"
            ).forEach(
                function (group) {

                    group.classList.remove(
                        "invalid"
                    );

                }
            );


        }
    );



    /* =========================================
       CLEAR FORM BUTTON
    ========================================= */

    if (clearFormBtn) {


        clearFormBtn.addEventListener(
            "click",
            function () {


                setTimeout(
                    function () {


                        form.querySelectorAll(
                            ".form-group.invalid"
                        ).forEach(
                            function (group) {

                                group.classList.remove(
                                    "invalid"
                                );

                            }
                        );


                    },
                    0
                );

            }
        );

    }



    /* =========================================
       SIDEBAR NAVIGATION
    ========================================= */

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const navItems =
        document.querySelectorAll(
            ".sidebar-nav .nav-item"
        );


    navItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function () {


                    if (
                        sidebar &&
                        window.innerWidth <= 768
                    ) {

                        sidebar.classList.remove(
                            "open"
                        );

                    }

                }
            );

        }
    );



    /* =========================================
       NOTIFICATION DROPDOWN
    ========================================= */

    const notificationButton =
        document.querySelector(
            "[data-notif-btn]"
        );


    const notificationDropdown =
        document.querySelector(
            "[data-notif-dropdown]"
        );


    if (notificationButton) {


        notificationButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                if (notificationDropdown) {

                    notificationDropdown.classList.toggle(
                        "show"
                    );

                }

            }
        );

    }


    document.addEventListener(
        "click",
        function (event) {


            if (
                notificationDropdown &&
                notificationButton &&
                !notificationDropdown.contains(
                    event.target
                ) &&
                !notificationButton.contains(
                    event.target
                )
            ) {

                notificationDropdown.classList.remove(
                    "show"
                );

            }

        }
    );



    /* =========================================
       STAFF REGISTRATION PAGE READY
    ========================================= */

    console.log(
        "Staff Registration page loaded successfully."
    );
    /* =========================================
   BULK IMPORT STAFF
   No external library required
========================================= */

const bulkImportBtn =
    document.getElementById("bulkImportBtn");

const bulkImportFile =
    document.getElementById("bulkImportFile");


/* =========================================
   OPEN FILE SELECTOR
========================================= */

if (bulkImportBtn && bulkImportFile) {

    bulkImportBtn.addEventListener(
        "click",
        function () {

            bulkImportFile.click();

        }
    );

}


/* =========================================
   CSV FILE SELECTED
========================================= */

if (bulkImportFile) {

    bulkImportFile.addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            /* Check CSV */

            if (
                !file.name
                    .toLowerCase()
                    .endsWith(".csv")
            ) {

                alert(
                    "Please select a CSV file."
                );

                bulkImportFile.value = "";

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const csvText =
                        event.target.result;

                    importStaffFromCSV(
                        csvText
                    );

                };


            reader.onerror =
                function () {

                    alert(
                        "Unable to read the selected CSV file."
                    );

                };


            reader.readAsText(file);


            /* Allow selecting same file again */

            bulkImportFile.value = "";

        }
    );

}


/* =========================================
   IMPORT STAFF FROM CSV
========================================= */

function importStaffFromCSV(csvText) {

    if (
        !csvText ||
        csvText.trim() === ""
    ) {

        alert(
            "The CSV file is empty."
        );

        return;
    }


    const rows =
        parseCSV(csvText);


    if (rows.length < 2) {

        alert(
            "The CSV file must contain a header row and at least one staff member."
        );

        return;
    }


    /* =========================================
       REQUIRED COLUMNS
    ========================================= */

    const requiredColumns = [

        "staffId",
        "nic",
        "firstName",
        "lastName",
        "dob",
        "gender",
        "email",
        "phone",
        "employeeType",
        "designation",
        "faculty",
        "department",
        "joiningDate",
        "employmentStatus",
        "address",
        "city",
        "district",
        "emergencyName",
        "relationship",
        "emergencyPhone"

    ];


    /* =========================================
       GET HEADERS
    ========================================= */

    const headers =
        rows[0].map(
            function (header) {

                return header
                    .trim()
                    .replace(
                        /^"|"$/g,
                        ""
                    );

            }
        );


    /* =========================================
       CHECK HEADERS
    ========================================= */

    const missingColumns =
        requiredColumns.filter(
            function (column) {

                return !headers.includes(
                    column
                );

            }
        );


    if (missingColumns.length > 0) {

        alert(
            "Invalid CSV file.\n\n" +
            "Missing columns:\n" +
            missingColumns.join(", ")
        );

        return;
    }


    /* =========================================
       GET EXISTING STAFF
    ========================================= */

    let registeredStaff = [];


    try {

        const savedStaff =
            localStorage.getItem(
                "registeredStaff"
            );


        if (savedStaff) {

            registeredStaff =
                JSON.parse(
                    savedStaff
                );

        }

    }
    catch (error) {

        console.error(
            "Error reading staff data:",
            error
        );

        registeredStaff = [];

    }


    /* =========================================
       COUNTERS
    ========================================= */

    let importedCount = 0;

    let duplicateCount = 0;

    let invalidCount = 0;


    const duplicateRows = [];

    const invalidRows = [];


    /* =========================================
       PROCESS CSV ROWS
    ========================================= */

    for (
        let i = 1;
        i < rows.length;
        i++
    ) {

        const row = rows[i];


        /* Skip empty rows */

        if (
            row.length === 0 ||
            row.every(
                function (value) {

                    return value.trim() === "";

                }
            )
        ) {

            continue;
        }


        const staff = {};


        /* =========================================
           MAP CSV VALUES
        ========================================= */

        headers.forEach(
            function (header, index) {

                staff[header] =
                    row[index] !== undefined
                        ? row[index].trim()
                        : "";

            }
        );


        /* =========================================
           REQUIRED VALUE VALIDATION
        ========================================= */

        const missingValue =
            requiredColumns.some(
                function (column) {

                    return !staff[column];

                }
            );


        if (missingValue) {

            invalidCount++;

            invalidRows.push(
                i + 1
            );

            continue;
        }


        /* =========================================
           EMAIL VALIDATION
        ========================================= */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                staff.email
            )
        ) {

            invalidCount++;

            invalidRows.push(
                i + 1
            );

            continue;
        }


        /* =========================================
           PHONE VALIDATION
        ========================================= */

        const phone =
            staff.phone.replace(
                /[\s-]/g,
                ""
            );


        const phonePattern =
            /^(?:\+94|94|0)?7[0-9]{8}$/;


        if (
            !phonePattern.test(phone)
        ) {

            invalidCount++;

            invalidRows.push(
                i + 1
            );

            continue;
        }


        /* =========================================
           EMERGENCY PHONE VALIDATION
        ========================================= */

        const emergencyPhone =
            staff.emergencyPhone.replace(
                /[\s-]/g,
                ""
            );


        if (
            !phonePattern.test(
                emergencyPhone
            )
        ) {

            invalidCount++;

            invalidRows.push(
                i + 1
            );

            continue;
        }


        /* =========================================
           CHECK DUPLICATE STAFF ID
        ========================================= */

        const duplicateStaff =
            registeredStaff.find(
                function (existingStaff) {

                    return (
                        existingStaff.staffId &&
                        String(
                            existingStaff.staffId
                        ).toLowerCase() ===
                        String(
                            staff.staffId
                        ).toLowerCase()
                    );

                }
            );


        if (duplicateStaff) {

            duplicateCount++;

            duplicateRows.push(
                i + 1
            );

            continue;
        }


        /* =========================================
           ADD REGISTRATION DATE
        ========================================= */

        staff.registeredAt =
            new Date().toISOString();


        /* =========================================
           ADD STAFF
        ========================================= */

        registeredStaff.push(
            staff
        );


        importedCount++;

    }


    /* =========================================
       SAVE TO LOCAL STORAGE
    ========================================= */

    if (importedCount > 0) {

        localStorage.setItem(
            "registeredStaff",
            JSON.stringify(
                registeredStaff
            )
        );

    }


    /* =========================================
       IMPORT RESULT
    ========================================= */

    let resultMessage =

        "Bulk Import Completed!\n\n" +

        "Successfully imported: " +
        importedCount +

        "\nDuplicate Staff IDs: " +
        duplicateCount +

        "\nInvalid rows: " +
        invalidCount;


    if (
        duplicateRows.length > 0
    ) {

        resultMessage +=
            "\n\nDuplicate rows: " +
            duplicateRows.join(", ");

    }


    if (
        invalidRows.length > 0
    ) {

        resultMessage +=
            "\nInvalid rows: " +
            invalidRows.join(", ");

    }


    alert(
        resultMessage
    );

}


/* =========================================
   SIMPLE CSV PARSER
   No library
========================================= */

function parseCSV(csvText) {

    const rows = [];

    let currentRow = [];

    let currentValue = "";

    let insideQuotes = false;


    for (
        let i = 0;
        i < csvText.length;
        i++
    ) {

        const char =
            csvText[i];

        const nextChar =
            csvText[i + 1];


        /* =========================================
           QUOTES
        ========================================= */

        if (char === '"') {

            if (
                insideQuotes &&
                nextChar === '"'
            ) {

                currentValue += '"';

                i++;

            }
            else {

                insideQuotes =
                    !insideQuotes;

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

            currentRow.push(
                currentValue
            );

            currentValue = "";

            continue;
        }


        /* =========================================
           NEW LINE
        ========================================= */

        if (
            (
                char === "\n" ||
                char === "\r"
            ) &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                nextChar === "\n"
            ) {

                i++;

            }


            currentRow.push(
                currentValue
            );


            rows.push(
                currentRow
            );


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
       LAST ROW
    ========================================= */

    if (
        currentValue !== "" ||
        currentRow.length > 0
    ) {

        currentRow.push(
            currentValue
        );


        rows.push(
            currentRow
        );

    }


    return rows;

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
