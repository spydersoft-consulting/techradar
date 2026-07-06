# Technology Radar Front End

> React UI Application and .NET API which serve as the frontend for the Technology Radar

## Structure

The application is a standard Create React App template, however, the **public** folder currently holds some non-React pages that handle the rendering of the view page (which renders the actual radar).

Eventually, these pages should be migrated to view components in the React app.

## Development Setup

### Configuration

TODO: Need detail on BFF implementation

### API Library generation

The client has two sets of generated code for API interaction:  one for the backend for frontend API (`Spydersoft.TechRadar.Frontend`, located in this repository) and one for the Data API (location tbd).

The files in **src/api** are generated using the OpenAPI Generator, specifically, the **typescript-axios** generator.  If you need to update those files because the API has changed, perform the following steps:

1. Install the [OpenAPI Generator CLI](https://openapi-generator.tech/docs/installation) if you do not have it. 
2. Download the latest OpenAPI specification from the API.  Each API uses swagger to generate a JSON specification, hosted at `/swagger/v1/swagger.json`.

3. Generate the new files with the following command:

   ```powershell
    openapi-generator generate -g typescript-axios -o tempbff -i c:\path\to\swagger.json
   ```

4. From the temp folder, copy the following files into the appropriate subdirectory in **src/api**
   * api.ts
   * base.ts
   * common.ts
   * configuration.ts
   * index.ts
