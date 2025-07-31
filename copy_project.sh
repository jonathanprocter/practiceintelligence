
#!/bin/bash

# Copy essential files first
echo "Copying essential files..."
cp ../package*.json . 2>/dev/null
cp ../.env . 2>/dev/null
cp ../.gitignore . 2>/dev/null
cp ../README.md . 2>/dev/null
cp ../tsconfig*.json . 2>/dev/null
cp ../vite.config.ts . 2>/dev/null
cp ../.replit . 2>/dev/null
cp ../tailwind.config.ts . 2>/dev/null
cp ../replit.md . 2>/dev/null

# Copy directories
echo "Copying directories..."
cp -r ../src . 2>/dev/null
cp -r ../server . 2>/dev/null
cp -r ../api . 2>/dev/null
cp -r ../client . 2>/dev/null
cp -r ../dist . 2>/dev/null

# Copy Python files
echo "Copying Python files..."
cp ../*.py . 2>/dev/null

# Copy JavaScript files (in batches to avoid resource limits)
echo "Copying JavaScript files..."
find .. -maxdepth 1 -name "*.js" -exec cp {} . \; 2>/dev/null

# Copy other important files
echo "Copying other files..."
cp ../*.md . 2>/dev/null
cp ../*.json . 2>/dev/null
cp ../*.html . 2>/dev/null
cp ../*.txt . 2>/dev/null
cp ../*.sh . 2>/dev/null

# Remove the cloned directory from within itself
rm -rf ./practiceintelligence 2>/dev/null

echo "Files copied successfully!"
ls -la | wc -l
echo "Total files copied"
