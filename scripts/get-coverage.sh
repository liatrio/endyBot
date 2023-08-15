#!/bin/bash

TEMP=`npm run coverage 2>/dev/null | tail | grep Lines | awk '{print $3}'`

# Print the coverage percentage
echo "$TEMP"

# Run with: ./scripts/get-coverage.sh 2>/dev/null