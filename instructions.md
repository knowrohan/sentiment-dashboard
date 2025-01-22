I have a SQLite database (./final_db.db) with the following schema:

Tables:

wordclouds
id (INTEGER, PRIMARY KEY, AUTOINCREMENT)
video_url (TEXT, NOT NULL) – References videos.video_url
topic_name (TEXT, NOT NULL) – Denormalized for fast filtering
word_freqs (TEXT, NOT NULL)
last_updated (TEXT)
videos
video_url (TEXT, PRIMARY KEY) – Unique identifier for each video
topic_name (TEXT, NOT NULL)
comments
id (INTEGER, PRIMARY KEY, AUTOINCREMENT)
video_url (TEXT, NOT NULL) – References videos.video_url
topic_name (TEXT, NOT NULL) – Denormalized for fast filtering
original_comment (TEXT, NOT NULL)
cleaned_comment (TEXT, Nullable) – For manual or automated cleaning
sentiment_label (TEXT)
sentiment_score (REAL)
comment_date (TEXT)

Design Requirement:
Create a sentiment analysis dashboard with the following functionality:

User Interface:
A drop-down menu for selecting one or more topics (topic_name).
Views (Users can choose from the following):
Stats View: Displays the total number of comments for the selected topics and a pie chart showing the distribution of sentiment labels (Positive, Negative, Neutral).
Trends View: Displays a graph showing sentiment scores over time for the selected topics.
Wordclouds View: Displays word clouds based on the word_freqs column for the selected topics.
Comparison Support:
Enable users to select multiple topics and compare the views (Stats, Trends, and Wordclouds) side-by-side.
Design this dashboard in a way that is intuitive and facilitates easy comparison of sentiment data for multiple topics.
