// =========================================================
// UNIVERSITY MANAGEMENT DASHBOARD
// Chart Initialization
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       VISITOR APPROVALS TREND - LINE CHART
    ===================================================== */

    const trendCtx =
        document.getElementById("approvalTrendChart");

    if (trendCtx) {

        new Chart(trendCtx, {

            type: "line",

            data: {

                labels: [
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul"
                ],

                datasets: [
                    {
                        label: "Visitor Approvals",

                        data: [
                            18,
                            22,
                            20,
                            27,
                            24,
                            30
                        ],

                        /* UniGuard Main Blue */
                        borderColor: "#2563eb",

                        /* Light Blue Area */
                        backgroundColor:
                            "rgba(37, 99, 235, 0.12)",

                        borderWidth: 3,

                        tension: 0.4,

                        fill: true,

                        pointBackgroundColor:
                            "#2563eb",

                        pointBorderColor:
                            "#ffffff",

                        pointBorderWidth: 2,

                        pointRadius: 5,

                        pointHoverRadius: 7
                    }
                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        grid: {
                            color: "#eef2f9"
                        }

                    },

                    x: {

                        grid: {
                            display: false
                        }

                    }

                }

            }

        });

    }


    /* =====================================================
       INCIDENTS BY CATEGORY - DOUGHNUT CHART
    ===================================================== */

    const donutCtx =
        document.getElementById("incidentDonutChart");

    if (donutCtx) {

        new Chart(donutCtx, {

            type: "doughnut",

            data: {

                labels: [
                    "Security",
                    "Property",
                    "Vehicle"
                ],

                datasets: [
                    {
                        data: [
                            5,
                            3,
                            2
                        ],

                        /*
                         * SAME BLUE COLOUR FAMILY
                         *
                         * Dark Blue
                         * Medium Blue
                         * Light Blue
                         */

                        backgroundColor: [
                            "#2563eb",
                            "#5b8def",
                            "#93b4f4"
                        ],

                        borderColor: [
                            "#ffffff",
                            "#ffffff",
                            "#ffffff"
                        ],

                        borderWidth: 2,

                        hoverOffset: 8
                    }
                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "68%",

                plugins: {

                    legend: {
                        display: false
                    }

                }

            }

        });

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
