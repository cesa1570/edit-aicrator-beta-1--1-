
$log = "zip_log.txt"
$src = "public\extension"
$dest = "public\ai-affiliate-extension.zip"

"Starting zip process" | Out-File $log

if (!(Test-Path $src)) {
    "Error: Source $src does not exist" | Out-File $log -Append
    exit
}

if (Test-Path $dest) {
    "Removing old zip" | Out-File $log -Append
    Remove-Item $dest -Force
}

try {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory((Get-Item $src).FullName, (Get-Item $dest).FullName)
    "Zip created successfully via .NET" | Out-File $log -Append
} catch {
    "Error with .NET Zip: $_" | Out-File $log -Append
    try {
        Compress-Archive -Path $src -DestinationPath $dest -Force
        "Zip created successfully via Compress-Archive" | Out-File $log -Append
    } catch {
        "Error with Compress-Archive: $_" | Out-File $log -Append
    }
}

if (Test-Path $dest) {
    $size = (Get-Item $dest).Length
    "Final Zip Size: $size bytes" | Out-File $log -Append
} else {
    "Final Zip Check: File not found" | Out-File $log -Append
}
