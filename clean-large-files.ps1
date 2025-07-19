# clean-large-files.ps1
# Gorstan Git cleanup helper – removes public.zip from history

Write-Host "`n🧼 Starting Gorstan Git cleanup..."

# Step 1: Extract git-filter-repo
$archive = "git-filter-repo-2.47.0.tar.xz"
$toolFolder = "git-filter-repo-2.47.0"

if (!(Test-Path $toolFolder)) {
    Write-Host "📦 Extracting $archive..."
    tar -xf $archive
} else {
    Write-Host "📦 $toolFolder already extracted."
}

# Step 2: Run git-filter-repo
$scriptPath = Join-Path $toolFolder "git-filter-repo"

if (!(Test-Path $scriptPath)) {
    Write-Host "❌ Cannot find git-filter-repo script at $scriptPath"
    exit 1
}

Write-Host "🧨 Running git-filter-repo to remove public.zip..."
python $scriptPath --path public.zip --invert-paths

# Step 3: Clean reflog and GC
Write-Host "🧹 Cleaning up reflog and pruning history..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Step 4: Push forcefully to GitHub
Write-Host "🚀 Force pushing cleaned repo to GitHub..."
git push -f origin main

Write-Host "`n✅ Done. Your repo should now be accepted by GitHub."
