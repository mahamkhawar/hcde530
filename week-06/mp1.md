# MP1 Competency Claims

## C3 — Data Cleaning and File Handling
I pulled live data from the PurpleAir API and converted the JSON responses into a pandas DataFrame. During the neighborhood analysis the chart looked wrong, so I investigated, found a sensor reporting over 300 µg/m³, and filtered out any reading above 200 µg/m³ before continuing the analysis.

## C5 — Data Analysis with Pandas
I used pandas to answer three research questions: comparing PM2.5 across Seattle neighborhoods, comparing indoor vs. outdoor sensors, and ranking eight U.S. cities by air quality. The most surprising finding was that indoor sensors had a lower median PM2.5 (1.1 µg/m³) than outdoor sensors (3.2 µg/m³), meaning Seattle buildings filter out particulates under normal conditions.

## C6 — Data Visualization
I created a horizontal bar chart using Plotly Express to compare mean PM2.5 across Seattle neighborhoods, sorted from cleanest to worst. I chose a bar chart because it is well-suited for comparing categories side by side, and titled it to state the finding rather than just describe the data.

## C7 — Critical Evaluation and Professional Judgment
The biggest limitation of this analysis is that the data is a single snapshot and does not capture seasonal changes — wildfire smoke in summer and fall would likely shift every finding significantly. I noted this throughout the notebook alongside the problem of faulty sensors inflating means, which meant medians were the more reliable measure across all three questions.
