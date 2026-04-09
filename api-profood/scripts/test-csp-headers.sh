#!/bin/bash

# Script to test CSP headers on the Profood API
# Usage: ./scripts/test-csp-headers.sh [API_URL]
# Example: ./scripts/test-csp-headers.sh http://localhost:8000

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default API URL (can be overridden by command line argument)
API_URL="${1:-http://localhost:8000}"

echo -e "${BLUE}======================================"
echo "Content Security Policy Headers Test"
echo "======================================"
echo -e "API URL: ${YELLOW}${API_URL}${NC}\n"

# Function to check if a header exists and display it
check_header() {
    local endpoint="$1"
    local header_name="$2"
    local expected_contains="$3"  # Optional: check if header contains this string

    echo -e "${BLUE}Testing endpoint:${NC} ${endpoint}"
    echo -e "${BLUE}Looking for header:${NC} ${header_name}"

    # Make the request and extract the specific header
    response=$(curl -s -I "${API_URL}${endpoint}" | grep -i "^${header_name}:")

    if [ -n "$response" ]; then
        echo -e "${GREEN}✓ Header found:${NC}"
        echo "  $response"

        # If we have an expected substring, check for it
        if [ -n "$expected_contains" ]; then
            if echo "$response" | grep -q "$expected_contains"; then
                echo -e "${GREEN}✓ Contains expected value: ${expected_contains}${NC}"
            else
                echo -e "${RED}✗ Does not contain expected value: ${expected_contains}${NC}"
            fi
        fi
    else
        echo -e "${RED}✗ Header not found${NC}"
    fi

    echo ""
}

# Function to display all security headers for an endpoint
display_all_security_headers() {
    local endpoint="$1"

    echo -e "${BLUE}======================================"
    echo "All Security Headers for: ${endpoint}"
    echo -e "======================================${NC}\n"

    # Make request and filter security-related headers
    curl -s -I "${API_URL}${endpoint}" | grep -iE "(Content-Security-Policy|X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|Referrer-Policy|Permissions-Policy|Strict-Transport-Security)"

    echo ""
}

# Test public endpoints
echo -e "${YELLOW}Testing Public Endpoints${NC}"
echo "========================"
echo ""

check_header "/api/get-box-types" "Content-Security-Policy" "default-src 'none'"
check_header "/api/get-box-types" "X-Frame-Options" "DENY"
check_header "/api/get-box-types" "X-Content-Type-Options" "nosniff"
check_header "/api/get-box-types" "X-XSS-Protection" "1; mode=block"
check_header "/api/get-box-types" "Referrer-Policy" "strict-origin-when-cross-origin"
check_header "/api/get-box-types" "Permissions-Policy"

echo -e "${YELLOW}CSP Directive Checks${NC}"
echo "===================="
echo ""

# Check for critical CSP directives
check_header "/api/get-box-types" "Content-Security-Policy" "frame-ancestors 'none'"
check_header "/api/get-box-types" "Content-Security-Policy" "upgrade-insecure-requests"
check_header "/api/get-box-types" "Content-Security-Policy" "block-all-mixed-content"

echo -e "${YELLOW}External Service Allowances${NC}"
echo "==========================="
echo ""

# Check that external services are allowed in connect-src
check_header "/api/get-box-types" "Content-Security-Policy" "googleapis.com"
check_header "/api/get-box-types" "Content-Security-Policy" "paytech.sn"
check_header "/api/get-box-types" "Content-Security-Policy" "twilio.com"
check_header "/api/get-box-types" "Content-Security-Policy" "postmarkapp.com"

echo -e "${YELLOW}Security Best Practices${NC}"
echo "======================"
echo ""

# Check that unsafe directives are NOT present
echo -e "${BLUE}Checking for unsafe CSP directives (should NOT be present)${NC}"
response=$(curl -s -I "${API_URL}/api/get-box-types" | grep -i "Content-Security-Policy")

if echo "$response" | grep -q "'unsafe-inline'"; then
    echo -e "${RED}✗ WARNING: 'unsafe-inline' found in CSP (security risk!)${NC}"
else
    echo -e "${GREEN}✓ 'unsafe-inline' not present (good)${NC}"
fi

if echo "$response" | grep -q "'unsafe-eval'"; then
    echo -e "${RED}✗ WARNING: 'unsafe-eval' found in CSP (security risk!)${NC}"
else
    echo -e "${GREEN}✓ 'unsafe-eval' not present (good)${NC}"
fi

echo ""

# Display full headers for reference
display_all_security_headers "/api/get-box-types"

echo -e "${YELLOW}Testing Additional Endpoints${NC}"
echo "============================"
echo ""

# Test multiple endpoints to ensure consistency
endpoints=(
    "/api/get-categories"
    "/api/get-slices"
)

for endpoint in "${endpoints[@]}"; do
    echo -e "${BLUE}Endpoint:${NC} ${endpoint}"
    response=$(curl -s -I "${API_URL}${endpoint}" | grep -i "Content-Security-Policy")
    if [ -n "$response" ]; then
        echo -e "${GREEN}✓ CSP header present${NC}"
    else
        echo -e "${RED}✗ CSP header missing${NC}"
    fi
    echo ""
done

# HSTS check (only in production)
echo -e "${YELLOW}HSTS (Strict-Transport-Security) Check${NC}"
echo "======================================"
echo ""

response=$(curl -s -I "${API_URL}/api/get-box-types" | grep -i "Strict-Transport-Security")
if [ -n "$response" ]; then
    echo -e "${GREEN}✓ HSTS header found:${NC}"
    echo "  $response"
    echo -e "${YELLOW}Note: HSTS should only be present in production${NC}"
else
    echo -e "${YELLOW}⚠ HSTS header not found${NC}"
    echo "  This is expected in development/test environments"
fi

echo ""
echo -e "${GREEN}======================================"
echo "CSP Headers Test Complete"
echo -e "======================================${NC}"
