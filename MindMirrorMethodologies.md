MindMirror Methodology: The Science of Digital Nutrition

1. The Core Thesis

Neuroplasticity is the brain's ability to reorganize itself by forming new neural connections throughout life. While often discussed in the context of skill acquisition (learning to play piano), neuroplasticity is equally active in shaping personality and worldview.

MindMirror operates on the "Digital Nutrition" Hypothesis:

If food inputs determine physical health, information inputs determine psychological health. By tracking and visualizing the semantic weight of media consumption, we can model and influence short-term character fluidity.

2. Psychological Frameworks

We utilize two validated psychometric models to map unstructured media data to structured human traits.

A. The OCEAN Model (The Big Five)

We measure personality on five sliding scales. Unlike static tests, MindMirror treats these as fluid states that fluctuate based on recent "diet."

Openness (O): Driven by Sci-Fi, Philosophy, Documentaries, Avant-Garde Art.

Conscientiousness (C): Driven by Productivity content, Strategy Games, "How-To" guides.

Extraversion (E): Driven by Social Media, Party Games, Vlogs, Interview Podcasts.

Agreeableness (A): Driven by Romance, Community Stories, "Wholesome" content.

Neuroticism (N): Driven by Horror, Dystopian News, High-Stress Competitive Gaming.

B. Jungian Archetypes (The Identity Layer)

While OCEAN provides the coordinates, Archetypes provide the identity. We cluster users based on their dominant trait combination:

The Explorer: High Openness + Low Neuroticism.

The Sentinel: High Conscientiousness + High Agreeableness.

The Analyst: High Openness + High Conscientiousness.
(Note: We use K-Nearest Neighbors logic to map the user's current vector to the nearest centroid of 12 classic archetypes).

3. The Mathematics of "Mind Mapping"

A. The Scoring Algorithm (Weighted Moving Average)

MindMirror does not "add" points (which would lead to infinite scores). Instead, it calculates a Fluid Average.

$$S_{new} = \frac{(S_{current} \times M_{decay}) + (I_{media} \times W_{impact})}{M_{decay} + W_{impact}}$$

$S_{new}$: The updated Trait Score (0-100).

$S_{current}$: The user's previous baseline.

$M_{decay}$: The "Mass" of the user's history (Total items logged * Time Decay Factor).

$I_{media}$: The semantic score of the new item (e.g., Dune = 90 Openness).

$W_{impact}$: The user-defined "Psychological Intensity" (1-5 stars).

Why this works: A single book won't change your life if you have a 10-year history of reading (High Mass). But a "Life Changing" (5-star) event has higher leverage to shift the average.

B. The Time Decay Function (Modeling Memory)

Neuroplasticity requires reinforcement. Without repetition, neural pathways fade. We model this using a Half-Life Decay function.

$$W_{t} = 0.5^{(\frac{t}{90})}$$

$W_t$: Weight of the item today (0.0 to 1.0).

$t$: Days since the item was consumed.

Half-Life: Set to 90 Days.

Implication: A book read 3 months ago exerts 50% of its original influence on your current score. A book read 1 year ago exerts <6%. This ensures the profile represents "Who you are today," not "Who you were in high school."

C. The Recommendation Engine (Cosine Similarity)

To prescribe content ("I want to feel Focused"), we use Vector Similarity Search.

User Target: $\vec{V}_{target}$ (e.g., "Focus" maps to [C=0.8, O=0.4, N=0.1]).

Candidate Item: $\vec{V}_{item}$ (derived from Gemini analysis of tags).

Similarity Score:

$$\text{Similarity} = \cos(\theta) = \frac{\vec{V}_{target} \cdot \vec{V}_{item}}{\|\vec{V}_{target}\| \|\vec{V}_{item}\|}$$

We filter results by the user's History, prioritizing items that have historically produced the target state for this specific user (Personalized Reinforcement).

4. Data Confidence & Privacy

Probabilistic, Not Diagnostic: MindMirror provides insights, not medical diagnoses. All AI analysis is probabilistic.

Local-First Privacy: User data is stored in isolated Firestore documents. No data is sold to third-party brokers.

The "Cold Start" Protocol: New users are initialized with a baseline via the IPIP-NEO calibration quiz. This prevents the "Empty Graph" problem by seeding the algorithm with a preliminary vector.