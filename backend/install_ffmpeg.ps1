$ProgressPreference = 'SilentlyContinue'
$zipPath = "C:\Users\Nishi\ffmpeg2.zip"
$extractPath = "C:\Users\Nishi\ffmpeg2"
Write-Host "Downloading FFmpeg to $zipPath without progress bar for speed..."
Invoke-WebRequest -Uri "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip" -OutFile $zipPath
Write-Host "Extracting FFmpeg to $extractPath..."
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
Write-Host "Updating PATH..."
$ffmpegBin = "C:\Users\Nishi\ffmpeg2\ffmpeg-7.1-essentials_build\bin"
$currentPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
if ($currentPath -notlike "*$ffmpegBin*") {
    $newPath = $currentPath + ";" + $ffmpegBin
    [Environment]::SetEnvironmentVariable("Path", $newPath, [EnvironmentVariableTarget]::User)
    Write-Host "Added $ffmpegBin to user PATH"
} else {
    Write-Host "FFmpeg is already in PATH"
}
Write-Host "Done."
