This repository contains a simple TODO list application with an ASP.NET Core Web API backend and an Angular frontend.

Features


    - View TODOs
    - Add TODOs
    - Delete TODOs

Please have the Backend running first before running fortend applcation.
Input validated for character limit of 300 and patterns that contains executable code is rejected.

Backend

    Project: TODOApplication.Server
    Tech: .NET 10 Web API
    Data: In-memory repository (no database)

    Go to directory: backend\TodoApp.Api
    To Build project : dotnet build
    To Run the application: dotnet run

    Got to directory: backend\TodoApp.Tests
    To run backend test: dotnet test

Frontend

    Project: todoapplication.client
    Tech: Angular 22

    Go to directory: frontend
    To install package: npm install --ignore-scripts --legacy-peer-deps
    To build the application: ng build
    To run the application: ng serve

    Go to directory: frontend
    To run frontend test: ng test

