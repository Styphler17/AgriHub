Start-Transcript -Path "E:\AgriHub\extract_log.txt"
try {
    Write-Output "Copying..."
    Copy-Item "E:\AgriHub\docs\without-API\ghana-agrihub (1).zip" "E:\AgriHub\temp.zip" -Force
    if (Test-Path "E:\AgriHub\temp.zip") {
        Write-Output "File copied successfully."
    } else {
        Write-Error "File copy failed."
        exit 1
    }
    Write-Output "Extracting..."
    Expand-Archive -Path "E:\AgriHub\temp.zip" -DestinationPath "E:\AgriHub" -Force
    Write-Output "Cleaning..."
    Remove-Item "E:\AgriHub\temp.zip" -Force
    Write-Output "Done."
} catch {
    Write-Error "Error: $_"
}
Stop-Transcript
