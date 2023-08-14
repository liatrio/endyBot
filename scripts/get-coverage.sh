#!/bin/bash

TEMP=`(npm run coverage | tail -n 3 | head -n 1 | awk -F'|' '{print $5}')` 2>/dev/null

TEMP=$(echo "$TEMP" | awk '{$1=$1; print}')

# Print the coverage percentage
echo "$TEMP"

# Run with: ./scripts/get-coverage.sh 2>/dev/null