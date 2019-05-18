---
title: How to make Firebase Authentication via Google API in Angular
ampSettings:
  titleImage:
    path: null
tags:
  - firebase
  - google api
  - angular
thumbnail:
date: 2019-05-16
---

This article is a simple guide on how to implement google api in angular and how to integrate a user session with a firebase service.

# Step 1: Firebase project

1. Go to https://console.firebase.google.com/
2. Create new project
   
|||
| - | - | 
| ![Firebase console: Projects dashboard view](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-projects-dashboard.png) | ![Firebase console: Add a project view](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-add-a-project.png) |
| ![Firebase console: Add a project view](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-add-a-project-2.png) |  ![Firebase console: Add a project view - creating spinner](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-add-a-project-3.png) |
   
3. Add a web app ![Firebase console: Project overview - Add a web app button](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-project-overview-create-web-app-button.png)

||||
| - | - | - |
| ![Firebase console: Add web app - step 1](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-project-overview.png) | ![Firebase console: Add web app - step 1](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-add-a-web-app.png) | ![Firebase console: Add web app - step 2](How-to-make-Firebase-Authentication-via-Google-API-in-Angular/firebase-console-add-a-web-app-2.png) |

# Step 2: Create Angular project

1. Install angular cli
   `npm install @angular/cli` 
2. Create new angular project
   `ng new firebase-auth-via-google-api-example`
3. Add firebase 
4. Go to https://console.developers.google.com
5. 