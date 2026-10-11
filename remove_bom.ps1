$basePath = "c:\Users\Admin\Videos\toolshub-pro"
$files = Get-ChildItem -Path $basePath -Filter "*.php" -Recurse

foreach ($file in $files) {
    # Read as bytes to check for BOM (EF BB BF)
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        Write-Host "BOM detected in: $($file.FullName). Removing..."
        # Skip the first 3 bytes and write back
        $bomFreeBytes = $bytes[3..($bytes.Length - 1)]
        [System.IO.File]::WriteAllBytes($file.FullName, $bomFreeBytes)
    }
}

Write-Host "BOM removal completed."
