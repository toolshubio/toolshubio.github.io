$basePath = "C:\Users\Admin\Videos"
# Targets: toolshub-pro/tools, seo-tools, text-tools, etc.
$files = Get-ChildItem -Path $basePath -Include "*.php", "*.html" -Recurse

Write-Host "Starting comprehensive fix..."

foreach ($file in $files) {
    # Skip large files or certain directories if needed, but for now we process all
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    $original = $content

    # Regex patterns for various permutations of ??
    # 1. <span>???</span> Small Caps -> <span>🔡</span>
    $content = $content -replace "<span>\?{2,4}</span>", "<span>✨</span>"
    
    # 2. <h1><span>??</span> Title -> <span>🛠️</span>
    # We use a placeholder first, then try to refine based on filename
    $content = $content -replace '<span>\?{1,4}</span>', '<span>⚡</span>'
    
    # 3. ?? Input -> 📥 Input
    $content = $content -replace '\?{1,4} Input', '📥 Input'
    
    # 4. ?? Output -> 📤 Output
    $content = $content -replace '\?{1,4} Output', '📤 Output'
    
    # 5. ?? Clear -> 🧹 Clear
    $content = $content -replace '\?{1,4} Clear', '🧹 Clear'
    
    # 6. ?? Copy -> 📋 Copy
    $content = $content -replace '\?{1,4} Copy', '📋 Copy'

    # 7. ?? Related -> 🔗 Related
    $content = $content -replace '\?{1,4} Related', '🔗 Related'

    # 8. ?? Replace All -> 🔄 Replace All
    $content = $content -replace '\?{1,4} Replace All', '🔄 Replace All'

    # 9. ?? Find & Replace -> 🔍 Find & Replace
    $content = $content -replace '\?{1,4} Find & Replace', '🔍 Find & Replace'

    # 10. ?? History -> 📜 History
    $content = $content -replace '\?{1,4} History', '📜 History'

    # 11. Theme toggle ?? -> 🌓
    $content = $content -replace 'id="theme-toggle">(\?{1,4})</button>', 'id="theme-toggle">🌓</button>'
    $content = $content -replace 'id="theme-toggle" aria-label="Toggle dark mode">(\?{1,4})</button>', 'id="theme-toggle" aria-label="Toggle dark mode">🌓</button>'

    # 12. Empty state ?? -> ✨
    $content = $content -replace 'style="font-size:3rem;margin-bottom:1rem;">\?{1,4}</div>', 'style="font-size:3rem;margin-bottom:1rem;">✨</div>'

    # 13. Results ?? -> 📊
    $content = $content -replace '\?{1,4} Results', '📊 Results'
    $content = $content -replace '\?{1,4} Result', '📊 Result'

    # 14. Settings ?? -> ⚙️
    $content = $content -replace '\?{1,4} Settings', '⚙️ Settings'

    # 15. Flip text upside down ?? -> 🙃
    $content = $content -replace 'Flip text upside down [^\s].*\?{2,4}', 'Flip text upside down 🙃'

    # If it's a specific tool, let's try to set the right icon
    if ($file.Name -like "*word-changer*") { $content = $content -replace '<span>⚡</span>', '<span>🔁</span>' }
    if ($file.Name -like "*word-counter*") { $content = $content -replace '<span>⚡</span>', '<span>📝</span>' }
    if ($file.Name -like "*text-case-changer*") { $content = $content -replace '<span>⚡</span>', '<span>🔡</span>' }
    if ($file.Name -like "*schema-generator*") { $content = $content -replace '<span>⚡</span>', '<span>🛠️</span>' }

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "Comprehensive fix completed."
