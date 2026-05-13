# Week 6 — Competency Claim

## C6 — Data Visualization

I created two charts in `week6.ipynb` using Plotly Express to answer my MP1 research questions about PurpleAir sensor data.

The first chart is a grouped bar chart comparing median PM2.5 between indoor and outdoor Seattle sensors, showing both the current reading and the 24-hour average side by side. I used medians instead of means because a small number of malfunctioning sensors reported physically implausible values (up to 6,666 µg/m³) that would have inflated the means — medians give a more honest picture of typical sensor behavior.

The second chart is a horizontal bar chart ranking eight major U.S. cities by median PM2.5, with a dashed reference line marking the EPA "Good" threshold at 12 µg/m³. I chose a horizontal orientation because city names are long enough to crowd a vertical x-axis, and I used a red-yellow-green color scale so the air quality ranking reads visually without the viewer having to interpret numbers first. Both charts make a clear argument: Seattle ranks among the cleanest of the eight cities, and its indoor air is meaningfully cleaner than its outdoor air under normal conditions.

Both charts are saved as `.png` files and committed alongside the notebook, which includes markdown cells explaining the findings and the reasoning behind each design choice.
