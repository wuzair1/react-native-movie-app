param([ValidateSet("Bundle", "Preview", "Debug")][string]$Mode = "Bundle")
$ErrorActionPreference = "Stop"
$projectPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$buildDrive = $null
Push-Location $projectPath
try {
    if (!$env:JAVA_HOME) {
        $javaExecutable = (Get-Command java -ErrorAction Stop).Source
        $env:JAVA_HOME = Split-Path (Split-Path $javaExecutable -Parent) -Parent
    }
    $buildTmp = Join-Path $projectPath ".expo/build-tmp"
    New-Item -ItemType Directory -Force $buildTmp | Out-Null
    $env:JAVA_TOOL_OPTIONS = '-Djdk.net.unixdomain.tmpdir="' + $buildTmp + '"'
    $env:TEMP = $buildTmp
    $env:TMP = $buildTmp
    $env:NODE_ENV = if ($Mode -eq "Debug") { "development" } else { "production" }
    if ($Mode -ne "Debug") {
        node scripts/create-upload-key.cjs
        if ($LASTEXITCODE -ne 0) { throw "Signing setup failed." }
        $signing = Get-Content -LiteralPath ".credentials/signing.json" -Raw | ConvertFrom-Json
        $env:ANDROID_UPLOAD_STORE_FILE = $signing.storeFile
        $env:ANDROID_UPLOAD_STORE_PASSWORD = $signing.storePassword
        $env:ANDROID_UPLOAD_KEY_PASSWORD = $signing.keyPassword
        $env:ANDROID_UPLOAD_KEY_ALIAS = $signing.keyAlias
    }
    npx expo prebuild --platform android --no-install
    if ($LASTEXITCODE -ne 0) { throw "Android prebuild failed." }
    # Ninja limits generated object filenames to 260 characters on Windows.
    # A temporary drive alias shortens native staging paths without relocating source.
    foreach ($letter in @("R", "S", "T", "U", "V", "W", "X", "Y", "Z")) {
        if (!(Get-PSDrive -Name $letter -ErrorAction SilentlyContinue)) {
            $candidate = $letter + ":"
            # Expo's package search stops before a drive root, so keep the app
            # one directory below the alias rather than placing it at R:\.
            subst.exe $candidate (Split-Path $projectPath -Parent)
            if ($LASTEXITCODE -eq 0) { $buildDrive = $candidate; break }
        }
    }
    if (!$buildDrive) { throw "No free drive letter for a short native build path." }
    Push-Location (Join-Path ($buildDrive + "\") ((Split-Path $projectPath -Leaf) + "\android"))
    try {
        $tasks = switch ($Mode) { "Bundle" { ":app:bundleRelease"; ":app:assembleRelease" } "Preview" { ":app:assembleRelease" } "Debug" { ":app:assembleDebug" } }
        .\gradlew.bat @tasks --no-daemon --max-workers=2
        if ($LASTEXITCODE -ne 0) { throw "Android build failed. See Gradle diagnostics above." }
    } finally { Pop-Location }
} finally {
    if ($buildDrive) { subst.exe $buildDrive /D }
    Remove-Item Env:ANDROID_UPLOAD_STORE_PASSWORD,Env:ANDROID_UPLOAD_KEY_PASSWORD -ErrorAction SilentlyContinue
    Pop-Location
}
