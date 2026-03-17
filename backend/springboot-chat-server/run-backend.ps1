# setup-maven.ps1
# This script downloads a portable Maven version and runs the backend project.

$mavenVersion = "3.9.6"
$mavenUrl = "https://archive.apache.org/dist/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip"
$installDir = Join-Path $PSScriptRoot "maven-portable"
$zipFile = Join-Path $PSScriptRoot "maven.zip"

if (-not (Test-Path $installDir)) {
    Write-Host "Maven not found. Downloading Maven $mavenVersion..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $mavenUrl -OutFile $zipFile
    
    Write-Host "Extracting Maven..." -ForegroundColor Cyan
    Expand-Archive -Path $zipFile -DestinationPath $installDir
    
    Remove-Item $zipFile
    Write-Host "Maven set up successfully in $installDir" -ForegroundColor Green
}

$mvnBin = Get-ChildItem -Path $installDir -Filter "mvn.cmd" -Recurse | Select-Object -First 1 -ExpandProperty FullName

if ($mvnBin) {
    Write-Host "Running Backend..." -ForegroundColor Green
    & $mvnBin spring-boot:run
} else {
    Write-Error "Failed to find mvn.cmd in extracted files."
}
