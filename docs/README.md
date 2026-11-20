# Project Documentation

## Guides

- [Software Requirements Specification](SRS.md)
- [Gap Analysis Against the SRS](Gap_Analysis.md)
- [API Documentation](API_Documentation.md)
- [Logical Database Schema](Database_Schema.md)
- [Data Dictionary](Data_Dictionary.md)
- [Test Plan](Test_Plan.md) and [Test Cases](Test_Cases.md)
- [User Manual](User_Manual.md)
- [Installation Guide](Installation_Guide.md)
- [Deployment Guide](Deployment_Guide.md)

## Diagrams

- [Use case](diagrams/use-case.png) - commuter searches and reviews a route.
- [Logical data model](diagrams/er-diagram.png) - JSON route data and derived journey result (there is no SQL database).
- [System architecture](diagrams/system-architecture.png) - React client, helper, route JSON, and separately runnable API.
- [Search activity](diagrams/activity-diagram.png) - input validation through displaying matches.

The diagrams describe the current release. The frontend uses the API for journey planning and falls back to its bundled dataset for direct search if the API is unavailable.

The source inspection summary is in [data_quality_report.json](../dataset/data_quality_report.json). Candidate semantic stop merges are in [stop_alias_suggestions.json](../dataset/stop_alias_suggestions.json) and remain pending until an administrator reviews them.
