# build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0-noble AS runtime

LABEL org.opencontainers.image.source=https://github.com/spydersoft-consulting/techradar-data-api
LABEL org.opencontainers.image.description="Spydersoft TechRadar Data API"
LABEL org.opencontainers.image.licenses=MIT

WORKDIR /app
COPY . /app

# Serve on port 8080, we cannot serve on port 80 with a custom user that is not root.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

USER $APP_UID

ENTRYPOINT ["dotnet", "Spydersoft.TechRadar.Data.Api.dll"]
