document.addEventListener("DOMContentLoaded", function () {

    // ================================
    // VISIT ACTIVITY LINE CHART
    // ================================

    const visitChartCanvas =
        document.getElementById("visitTrendChart");

    if (visitChartCanvas) {

        new Chart(visitChartCanvas, {

            type: "line",

            data: {

                labels: [
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug"
                ],

                datasets: [
                    {
                        label: "Visits",

                        data: [3, 5, 4, 6, 8, 7],

                        borderColor: "#2563eb",

                        backgroundColor:
                            "rgba(37, 99, 235, 0.12)",

                        borderWidth: 3,

                        fill: true,

                        tension: 0.4,

                        pointBackgroundColor: "#ffffff",

                        pointBorderColor: "#2563eb",

                        pointBorderWidth: 3,

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
                    },

                    tooltip: {

                        backgroundColor: "#1f2937",

                        titleColor: "#ffffff",

                        bodyColor: "#ffffff",

                        padding: 12,

                        cornerRadius: 8,

                        displayColors: false
                    }
                },

                scales: {

                    x: {

                        grid: {
                            display: false
                        },

                        border: {
                            display: false
                        },

                        ticks: {

                            color: "#64748b",

                            font: {
                                size: 12
                            }
                        }
                    },

                    y: {

                        beginAtZero: true,

                        suggestedMax: 10,

                        ticks: {

                            stepSize: 2,

                            color: "#64748b",

                            font: {
                                size: 12
                            }
                        },

                        grid: {
                            color: "#e2e8f0"
                        },

                        border: {
                            display: false
                        }
                    }
                }
            }
        });
    }


    // ================================
    // APPROVAL OUTCOMES DONUT CHART
    // ================================

    const approvalChartCanvas =
        document.getElementById("approvalDonutChart");

    if (approvalChartCanvas) {

        new Chart(approvalChartCanvas, {

            type: "doughnut",

            data: {

                labels: [
                    "Approved",
                    "Pending",
                    "Rejected"
                ],

                datasets: [
                    {

                        data: [8, 4, 2],

                        // Blue colour variations
                        backgroundColor: [
                            "#2563eb", // Approved - Dark Blue
                            "#5b8def", // Pending - Medium Blue
                            "#93b4f4"  // Rejected - Light Blue
                        ],

                        borderColor: "#ffffff",

                        borderWidth: 5,

                        hoverOffset: 10
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

                        titleColor: "#ffffff",

                        bodyColor: "#ffffff",

                        padding: 12,

                        cornerRadius: 8
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
