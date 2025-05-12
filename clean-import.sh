#!/bin/bash

SOURCE="property-portal-main"

echo "Ì≥¶ Starting clean import from $SOURCE..."

# Clean target folders
echo "Ì∑π Removing node_modules and apps if they exist..."
rm -rf ./node_modules
rm -rf ./apps

# Move safe files
for file in "$SOURCE"/*; do
  fname=$(basename "$file")
  if [[ "$fname" == "node_modules" || "$fname" == ".git" ]]; then
    echo "‚è© Skipping $fname"
    continue
  fi
  echo "Ì≥Å Moving $fname"
  mv "$file" ./
done

# Move dotfiles individually
for file in ".env" ".gitignore" ".eslintrc" ".prettierrc" ".env.example"; do
  if [ -f "$SOURCE/$file" ]; then
    echo "Ì≥Å Moving $file"
    mv "$SOURCE/$file" ./
  fi
done

# Final cleanup
rm -rf "$SOURCE"
#!/bin/bash

SOURCE="property-portal-main"

echo "Ì≥¶ Starting clean import from $SOURCE..."

# Clean target folders
echo "Ì∑π Removing node_modules and apps if they exist..."
rm -rf ./node_modules
rm -rf ./apps

# Move safe files
for file in "$SOURCE"/*; do
  fname=$(basename "$file")
  if [[ "$fname" == "node_modules" || "$fname" == ".git" ]]; then
    echo "‚è© Skipping $fname"
    continue
  fi
  echo "Ì≥Å Moving $fname"
  mv "$file" ./
done

# Move dotfiles individually
for file in ".env" ".gitignore" ".eslintrc" ".prettierrc" ".env.example"; do
  if [ -f "$SOURCE/$file" ]; then
    echo "Ì≥Å Moving $file"
    mv "$SOURCE/$file" ./
  fi
done

# Final cleanup


