$basePath = "c:\Users\Admin\Videos\toolshub-pro\tools"
$files = Get-ChildItem -Path $basePath -Filter "*.php" -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Common UI Replacements
    $content = $content -replace '<span>\?\?</span>', '<span>⚡</span>'
    $content = $content -replace '\?\? Input', '📥 Input'
    $content = $content -replace '\? Output', '📤 Output'
    $content = $content -replace '\?\? Output', '📤 Output'
    $content = $content -replace '\?\? Related', '🔗 Related'
    $content = $content -replace '\?\? Copy', '📋 Copy'
    $content = $content -replace '\?\? Clear', '🧹 Clear'
    $content = $content -replace '\? Clear', '🧹 Clear'
    $content = $content -replace '\?\? Replace All', '🔄 Replace All'
    $content = $content -replace '\?\? Find & Replace', '🔍 Find & Replace'
    $content = $content -replace 'id="theme-toggle">\?\?</button>', 'id="theme-toggle">🌓</button>'
    $content = $content -replace 'style="font-size:3rem;margin-bottom:1rem;">\?\?</div>', 'style="font-size:3rem;margin-bottom:1rem;">✨</div>'
    
    # Specific tool header icon fixes (best effort)
    if ($file.Name -eq "word-changer.php") { $content = $content -replace '<span>⚡</span> Word Changer', '<span>🔁</span> Word Changer' }
    if ($file.Name -eq "text-case-changer.php") { $content = $content -replace '<span>⚡</span>', '<span>🔡</span>' }
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}

Write-Host "Global fix completed for PHP files."
