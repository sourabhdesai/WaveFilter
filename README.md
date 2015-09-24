# Final Project Proposal
- svdesai2

## Notes
- This project was done as a part of the final project of CS 242 - Programming Studio. Emphasis was on code cleanliness and project structure.
- End product was able to recursively search through local filesystem, and list MP3 Files based on various filters.
- Song Filters included filters for Sentiment Analysis, Artist Similarity, and Song Key match
- Also had ability to AND/OR queries (i.e. Get all songs with a Happy Sentiment in the key of F#)

## Abstract

### Project Purpose
- I want to create a tool to efficiently create music playlists using various filters based on intelligent music APIs, NLP technologies, and web scraped info. Music will be sourced from local file system.

### Motivation
- I have always wanted to apply my programming skills to music in some way. On top of that, having an app like this can enable music discovery in a very expressive and quick manner.

## Technical Specifications
- Platform: Node.js Desktop App
- Programming Languages: Javascript, HTML/CSS
- Stylistic Conventions:
	- Comments: Comments for module methods & endpoints
	- Naming Conventions: emphasis on idiomatic code
	- Casing: camelCase
- SDK/Frameworks/Middleware:
	- Backend: NW.js (node-webkit)
	- Frontend: Bootstrap
- Tools/Interfaces:
	- Google Chrome
- Target Audience:
	- Music Listeners, DJs

## Functional Specifications

### Features
- Search
	- Should be able to search for songs by multiple parameters
- Filter
	- Should be able to filter based on multiple parameters
- Search/Filter parameters
	- Genre
	- Song Key
	- Artist
	- Time period
	- Band Members
	- Lyric Attributes
		- Sentiment Analysis
		- Word usage
	- Instrument Use
- Many filters to one search
- Should be able to and/or filters and searches

### Scope of Project
- Limitations will be highly dependent on API availibility for required information
- Performance highly dependent on performance of dependent APIs
- Focus of project will be backend. Frontend will be minimal and will rely heavily on pre-built UI components.

## Timeline

### Week 1
- Should have basic API functions to query for songs, and filter results
- Backend should respond with at least some dummy data for various requests. 
- Should have frontend that connects with backend to conduct search/filter queries.
- Frontend should be able to dynamically display query content in a basic layout.
- Should be able to read through local file system to search for mp3 files.

### Week 2
- Should integrate APIs for to retrieve info for queries and filters
- Should also integrate NLP technologies into search/filters
- Should be able to reorder, delete songs from playlist

### Week 3
- Should add ability to and/or queries
- Should be have user interface that allows for efficient composition of search/filter queries
- Look into adding useful query parameters