#!/usr/bin/env python3
"""
Likkle Legends Backend API Testing
Tests health check and Tanty Spice API endpoints
"""

import requests
import sys
import json
from datetime import datetime

class LikkleLegendsAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url.rstrip('/')
        self.tests_run = 0
        self.tests_passed = 0

    def log(self, message):
        """Log with timestamp"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status=200, data=None, headers=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        self.log(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=timeout)
            else:
                self.log(f"❌ Unsupported method: {method}")
                return False, {}

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - Status: {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    try:
                        return True, response.json()
                    except:
                        return True, {"text": response.text}
                else:
                    return True, {"text": response.text}
            else:
                self.log(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                self.log(f"   Response: {response.text[:500]}...")
                return False, {"error": response.text, "status": response.status_code}

        except requests.exceptions.Timeout:
            self.log(f"❌ FAILED - Request timeout after {timeout}s")
            return False, {"error": "timeout"}
        except Exception as e:
            self.log(f"❌ FAILED - Error: {str(e)}")
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test the health check API"""
        return self.run_test("Health Check", "GET", "api/health", expected_status=200)

    def test_tanty_spice_api(self):
        """Test Tanty Spice AI chatbot API"""
        test_messages = [
            {
                "role": "user", 
                "content": "Hello Tanty! My name is Alex and I'm feeling happy today!"
            }
        ]
        
        success, response = self.run_test(
            "Tanty Spice AI Chat",
            "POST", 
            "api/tanty-spice",
            expected_status=200,
            data={"messages": test_messages},
            timeout=30
        )
        
        if success and 'content' in response:
            content = response.get('content', '')
            # Check if response has Caribbean dialect characteristics
            caribbean_indicators = ['darlin', 'chile', 'me ', 'de ', 'yuh', 'dat', 'dis', 'tanty', 'sweet']
            has_dialect = any(indicator in content.lower() for indicator in caribbean_indicators)
            
            if has_dialect:
                self.log(f"✅ Caribbean dialect detected in response")
                self.log(f"   Response preview: {content[:100]}...")
            else:
                self.log(f"⚠️  Response may not have Caribbean dialect")
                self.log(f"   Response: {content}")
        
        return success, response

    def test_tanty_spice_no_messages(self):
        """Test Tanty Spice API with invalid input"""
        return self.run_test(
            "Tanty Spice API - No Messages",
            "POST", 
            "api/tanty-spice",
            expected_status=400,
            data={},
            timeout=15
        )

    def test_tanty_spice_empty_messages(self):
        """Test Tanty Spice API with empty messages array"""
        return self.run_test(
            "Tanty Spice API - Empty Messages",
            "POST", 
            "api/tanty-spice",
            expected_status=400,
            data={"messages": []},
            timeout=15
        )

    def run_all_tests(self):
        """Run all backend API tests"""
        self.log("🚀 Starting Likkle Legends Backend API Tests")
        self.log(f"   Base URL: {self.base_url}")
        self.log("="*60)

        # Test health check first
        health_success, health_response = self.test_health_check()
        if health_success:
            self.log("📊 Health Check Details:")
            if isinstance(health_response, dict):
                for key, value in health_response.items():
                    self.log(f"   {key}: {value}")

        self.log("")

        # Test Tanty Spice AI API
        self.test_tanty_spice_api()
        self.log("")

        # Test error handling
        self.test_tanty_spice_no_messages()
        self.log("")
        
        self.test_tanty_spice_empty_messages()
        self.log("")

        # Results
        self.log("="*60)
        self.log(f"📊 BACKEND TEST RESULTS:")
        self.log(f"   Tests Run: {self.tests_run}")
        self.log(f"   Tests Passed: {self.tests_passed}")
        self.log(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            self.log("🎉 ALL BACKEND TESTS PASSED!")
            return True
        else:
            self.log("⚠️  SOME TESTS FAILED - Check logs above")
            return False

def main():
    """Main test runner"""
    tester = LikkleLegendsAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())