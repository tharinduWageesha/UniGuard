// =========================================================
// INCIDENT STATISTICS
// Charts + Search and Filter
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // INCIDENTS REPORTED - LINE CHART
    // =====================================================

    const trendCtx = document.getElementById("incidentTrendChart");

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
                        label: "Incidents",

                        data: [
                            4,
                            2,
                            3,
                            3,
                            2,
                            4
                        ],

                        // Main UniGuard Blue
                        borderColor: "#2563eb",

                        // Light blue background
                        backgroundColor: "rgba(37, 99, 235, 0.10)",

                        fill: true,

                        tension: 0.4,

                        borderWidth: 3,

                        pointBackgroundColor: "#2563eb",

                        pointBorderColor: "#ffffff",

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

                        ticks: {

                            stepSize: 1,

                            color: "#64748b"
                        },

                        grid: {

                            color: "rgba(148, 163, 184, 0.15)"
                        },

                        border: {

                            display: false
                        }
                    },

                    x: {

                        ticks: {

                            color: "#64748b"
                        },

                        grid: {

                            display: false
                        },

                        border: {

                            display: false
                        }
                    }
                }
            }
        });
    }


    // =====================================================
    // INCIDENTS BY CATEGORY - DOUGHNUT CHART
    // Blue Color Variations
    // =====================================================

    const categoryCtx =
        document.getElementById("incidentCategoryChart");

    if (categoryCtx) {

        new Chart(categoryCtx, {

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
                            8,
                            6,
                            4
                        ],

                        // UniGuard Blue Color Variations
                        backgroundColor: [

                            "#2563eb", // Security - Main Blue

                            "#5b8def", // Property - Medium Blue

                            "#93b4f4"  // Vehicle - Light Blue
                        ],

                        // White separation between chart sections
                        borderColor: "#ffffff",

                        borderWidth: 3,

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
                    },

                    tooltip: {

                        backgroundColor: "#1f2937",

                        padding: 10,

                        titleColor: "#ffffff",

                        bodyColor: "#ffffff"
                    }
                }
            }
        });
    }


    // =====================================================
    // TABLE SEARCH AND FILTER
    // =====================================================

    if (typeof initTableSearchFilter === "function") {

        initTableSearchFilter({

            searchInput:
                document.getElementById("incidentsSearch"),

            filterSelects: [

                document.getElementById(
                    "incidentsCategoryFilter"
                ),

                document.getElementById(
                    "incidentsStatusFilter"
                )
            ],

            tableBody:
                document.getElementById(
                    "incidentsTableBody"
                ),

            emptyStateEl:
                document.getElementById(
                    "incidentsEmptyState"
                )
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
