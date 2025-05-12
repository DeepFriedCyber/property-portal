#!/bin/bash

SOURCE="property-portal-main"

echo "� Starting clean import from $SOURCE..."

# Clean target folders
echo "� Removing node_modules and apps if they exist..."
rm -rf ./node_modules
rm -rf ./apps

# Move safe files
for file in "$SOURCE"/*; do
  fname=$(basename "$file")
  if [[ "$fname" == "node_modules" || "$fname" == ".git" ]]; then
    echo "⏩ Skipping $fname"
    continue
  fi
  echo "� Moving $fname"
  mv "$file" ./
done

# Move dotfiles individually
for file in ".env" ".gitignore" ".eslintrc" ".prettierrc" ".env.example"; do
  if [ -f "$SOURCE/$file" ]; then
    echo "� Moving $file"
    mv "$SOURCE/$file" ./
  fi
done

# Final cleanup
rm -rf "$SOURCE"
#!/bin/bash

SOURCE="property-portal-main"

echo "� Starting clean import from $SOURCE..."

# Clean target folders
echo "� Removing node_modules and apps if they exist..."
rm -rf ./node_modules
rm -rf ./apps

# Move safe files
for file in "$SOURCE"/*; do
  fname=$(basename "$file")
  if [[ "$fname" == "node_modules" || "$fname" == ".git" ]]; then
    echo "⏩ Skipping $fname"
    continue
  fi
  echo "� Moving $fname"
  mv "$file" ./
done

# Move dotfiles individually
for file in ".env" ".gitignore" ".eslintrc" ".prettierrc" ".env.example"; do
  if [ -f "$SOURCE/$file" ]; then
    echo "� Moving $file"
    mv "$SOURCE/$file" ./
  fi
done

# Final cleanup


