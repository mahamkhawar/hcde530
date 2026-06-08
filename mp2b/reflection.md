## What did you build? Describe it as if explaining to a potential collaborator who doesn't know the course.

I built a browser-based usability testing tool called Wallflower. I work as a UX researcher, and part of that job involves backroom observation during moderated studies — manually counting misclicks, navigational errors, and deviations from the expected user flow, known as the golden path. I wanted to automate that work so a moderator can run a session without needing a separate person tracking errors by hand.

A researcher uploads screenshots of the prototype and defines the golden path — the sequence of steps a user is expected to take. The tool generates a participant link, logs every click, identifies which ones stray from the golden path, and surfaces those as errors in a structured report.

## What decisions did you make? Platform choice, data source, scope decisions, things you changed from your MP2a declaration. What made you choose this over the alternatives?

I chose Bolt because it was recommended for UX research output tools, and Claude confirmed it would be better suited than Lovable for this type of project.

The biggest scope shift was how prototype input works. My original plan was to embed a Figma link directly, but Figma restricts embedding in third-party apps. I also considered a recording-based approach, but session timing differences made meaningful comparison unworkable — if a golden path takes 10 seconds but a struggling participant takes 2 minutes, there's no clean way to align them.

The solution was screenshots. The researcher uploads images of each screen and defines the golden path by marking clickable hotspots. This gave direct control over what counts as a correct click, avoided the embedding problems, and produced something that worked end to end.

## What would you do differently? One or two things — be specific. Not "I would start earlier" — what would you actually change about the tool itself?

The first thing I'd change is the Figma integration. When I hit the embedding restrictions, there were more technical workarounds I didn't have time to explore. Giving researchers the option to use a live prototype link — not just screenshots — would make the tool useful for a wider range of studies, including high-fidelity prototypes where uploading individual screens isn't practical.

The second thing is metrics. Right now the tool tracks misclicks and time on task. I'd expand that to include task completion rate, first-click accuracy, hesitation time per screen, and a post-task satisfaction rating — so the report captures both what the participant did and how they felt, without needing a separate survey tool.

## What does this work demonstrate? Which competency domains does this project show, and how? Connect to specific parts of the code, the interface, or the analysis.

This project demonstrates C1 — Vibecoding and Rapid Prototyping. My prompting approach evolved from when I first learned Bolt. For this project, I dictated instructions verbally to Claude, who translated them into structured prompts that I fed into Bolt. That layered workflow — verbal to Claude, Claude to Bolt — kept iterations focused and is what made rapid prototyping possible across 10+ rounds of refinement.

It also demonstrates C8 — Building and Deploying a Complete Tool. The tool was designed around the actual workflow of qualitative coding in usability research. It accounts for the different people in a study: the researcher setting up the golden path, the participant clicking through screens, and observers in the backroom. Each role has a different view, and the tool was tested across all three perspectives to make sure it held up end to end.
