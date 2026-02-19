# Sprint 1 Report

## Overview
Sprint 1 focused on establishing the foundational infrastructure for our game review platform (similar to Letterboxd but for games). This included backend API setup, database configuration, frontend boilerplate, and initial schema design.

---

## User Stories

### Backend
1. **As a user**, I want to add a game to the database
2. **As a user**, I want to get all games in the database
3. **As a user**, I want to get a specific game in the database by id
4. **As a user**, I want to add a user to the database
5. **As a user**, I want to get all users in the database
6. **As a user**, I want to get a specific user in the database by id

### Frontend
1. **As a new visitor**, I want an engaging Landing Page (/) that explains the app's features so I know why I should sign up.
2. **As a user**, I want a Home Dashboard (/home) that acts as my daily gaming feed, highlighting currently trending games, breaking news, and entertaining community reviews so I stay connected to the culture.
3. **As a completionist**, I want a Backlog Page (/backlog) where I can track, sort, and manage all the games I own or want to play.
4. **As a user**, I want an interactive Games Directory (/games) featuring a dynamic top-rated carousel and paginated leaderboards so I can deeply explore the highest-scoring games of all time.
5. **As a user**, I want to be able to sign up or login, and also open my account page where I can see my profile and relevant information such as game activity, my reviews, wishlists, game lists etc.

---

## Planned Issues

### Backend
- **#8** - Create config for SQLite Server connection with Go backend
- **#4** - Create basic REST setup
- **#16** - Get all games and get by id api backend
- **#17** - Create Game API
- **#7** - Organize APIs into different files
- **#6** - Create SQL schema for Games Table
- **#5** - Create SQL schema for User Tables

### Frontend
- **#9** - Design and iterate on logo
- **#10** - Setup frontend UI boilerplate
- **#11** - Create landing page
- **#12** - Implement separate Games page
- **#19** - Create login, signup pages
- **#20** - Create /account page
- **#21** - Create /backlog page

---

## Completed Issues 

### Backend
- **#8** - Create config for SQLite Server connection with Go backend
- **#4** - Create basic REST setup
- **#7** - Organize APIs into different files
- **#16** - Get all games and get by id api backend
- **#17** - Create Game API
- **#7** - Organize APIs into different files

**Time Invested:** Significant research on GORM best practices, SQLite data types, and design patterns

### Frontend
- **#9** - Design and iterate on logo
- **#10** - Setup frontend UI boilerplate 
- **#11** - Create landing page 
- **#12** - Implement separate Games page 
- **#21** - Create /backlog page

---

## Incomplete Issues (Work in Progress) 

### Backend - 

### #6 - Create SQL schema for Games Table, #5 - Create SQL schema for User Tables  
**Status:** In Progress  
**Reason:** Team members could not reach consensus on the final schema structure.


**Next Steps:** - Finalize schema after more discussions
- Complete implementation in Sprint 2

### Frontend -

### #19 - Create login, signup pages
**Status:** Open

**Reason:** Issue scope for the other pages was larger than expected, need more time to complete this particular page

### #20 - Create /account page
**Status:** Open

**Reason:** Issue scope for the other pages was larger than expected, need more time to complete this particular page

---
