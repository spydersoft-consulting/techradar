#  Technology Radar API
> API project for the Spydersoft Technology Radar

This project contains the .NET Core project which is the API for the Spydersoft Technology Radar application.

## Development setup

The project is a .Net 8 web application.  Visual Studio 2022 or the .NET 8 SDK are required.


### Configuration
The **appsettings.json** file contains the configuration for the application.  There are two important sections

#### Database
The database connection string is defined by the **TechRadarDatabase** value in the **ConnectionStrings** object.  **Do not commit your database connection string to the appsettings.json file!**  

You can setup your database connection in the project's **User Secrets**

1. Open **Spydersoft.TechRadar.Data.Api** in Visual Studio
2. Right click on the **Spydersoft.TechRadar.Data.Api** project and select **Manage User Secrets**
3. In the **secrets.json** file, add your override value:
```json
{
  "ConnectionStrings:TechRadarDatabase": "Server=yourServerName;Database=yourDatabaseName;Trusted_Connection=True;ConnectRetryCount=0"
}
```

#### Authentication Configuration


### Build
```powershell
dotnet build
```

### Run from command line
```powershell
dotnet run
```

### Run from command line - recompile on source changes
```powershell
dotnet watch run
```

## Owner

Matt Gerega – gerega@gmail.com

## Contributing

1. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
