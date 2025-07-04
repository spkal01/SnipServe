import requests
import json
import time
import sys

class PastebinTester:
    def __init__(self, base_url='http://localhost:5000'):
        self.base_url = base_url
        self.session = requests.Session()
        self.api_key = None
        self.user_id = None
        self.paste_ids = []
        
    def log(self, message, status="INFO"):
        print(f"[{status}] {message}")
    
    def test_user_registration(self):
        """Test user registration"""
        self.log("Testing user registration...")
        
        # Test with invalid data
        response = self.session.post(f'{self.base_url}/api/user/register', json={})
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        self.log("✓ Invalid registration data rejected")
        
        # Test with valid data
        test_user_data = {
            'username': f'testuser_{int(time.time())}',
            'password': 'testpassword123',
            'invite_code': 'test'  # Update this with your actual invite code
        }
        
        response = self.session.post(f'{self.base_url}/api/user/register', json=test_user_data)
        if response.status_code == 201:
            result = response.json()
            self.api_key = result.get('api_key')
            self.log(f"✓ User registered successfully: {test_user_data['username']}")
            self.log(f"✓ API Key received: {self.api_key[:10]}...")
            return test_user_data
        else:
            self.log(f"✗ Registration failed: {response.json()}", "ERROR")
            return None
    
    def test_user_login(self, user_data):
        """Test user login"""
        self.log("Testing user login...")
        
        # Test with invalid credentials
        response = self.session.post(f'{self.base_url}/api/user/login', json={
            'username': 'nonexistent',
            'password': 'wrong'
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        self.log("✓ Invalid login rejected")
        
        # Test with valid credentials
        response = self.session.post(f'{self.base_url}/api/user/login', json={
            'username': user_data['username'],
            'password': user_data['password']
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        result = response.json()
        self.log(f"✓ Login successful: {result['message']}")
        
        # Verify API key is returned
        assert 'api_key' in result, "API key not returned in login response"
        self.log("✓ API key returned in login response")
    
    def test_get_user_info(self):
        """Test getting current user info"""
        self.log("Testing user info retrieval...")
        
        # Test with session authentication
        response = self.session.get(f'{self.base_url}/api/user/me')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        user_info = response.json()
        self.user_id = user_info['id']
        self.log(f"✓ User info retrieved via session: {user_info['username']}")
        
        # Test with API key authentication
        headers = {'X-API-Key': self.api_key}
        response = requests.get(f'{self.base_url}/api/user/me', headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        self.log("✓ User info retrieved via API key")
    
    def test_create_paste(self):
        """Test paste creation"""
        self.log("Testing paste creation...")
        
        # Test with invalid data
        response = self.session.post(f'{self.base_url}/api/pastes/create', json={})
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        self.log("✓ Invalid paste data rejected")
        
        # Test with session authentication
        paste_data = {
            'title': 'Test Paste 1',
            'content': 'This is a test paste content.',
            'hidden': False
        }
        response = self.session.post(f'{self.base_url}/api/pastes/create', json=paste_data)
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        paste1 = response.json()
        self.paste_ids.append(paste1['id'])
        self.log(f"✓ Paste created via session: {paste1['id']}")
        
        # Test with API key authentication
        headers = {'X-API-Key': self.api_key, 'Content-Type': 'application/json'}
        paste_data2 = {
            'title': 'Test Paste 2 (Hidden)',
            'content': 'This is a hidden test paste.',
            'hidden': True
        }
        response = requests.post(f'{self.base_url}/api/pastes/create', 
                               headers=headers, json=paste_data2)
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        paste2 = response.json()
        self.paste_ids.append(paste2['id'])
        self.log(f"✓ Hidden paste created via API key: {paste2['id']}")
        
        return paste1, paste2
    
    def test_get_paste(self, paste1, paste2):
        """Test paste retrieval"""
        self.log("Testing paste retrieval...")
        
        # Test getting public paste without auth
        response = requests.get(f'{self.base_url}/api/pastes/{paste1["id"]}')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        self.log("✓ Public paste retrieved without authentication")
        
        # Test getting hidden paste without auth (should fail)
        response = requests.get(f'{self.base_url}/api/pastes/{paste2["id"]}')
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        self.log("✓ Hidden paste access denied without authentication")
        
        # Test getting hidden paste with auth
        headers = {'X-API-Key': self.api_key}
        response = requests.get(f'{self.base_url}/api/pastes/{paste2["id"]}', headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        self.log("✓ Hidden paste retrieved with API key")
        
        # Test getting non-existent paste
        response = requests.get(f'{self.base_url}/api/pastes/nonexistent')
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        self.log("✓ Non-existent paste returns 404")
    
    def test_update_paste(self, paste1):
        """Test paste updating"""
        self.log("Testing paste updates...")
        
        # Test updating with session
        update_data = {
            'title': 'Updated Test Paste 1',
            'content': 'This content has been updated.',
            'hidden': True
        }
        response = self.session.put(f'{self.base_url}/api/pastes/{paste1["id"]}', 
                                  json=update_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        updated_paste = response.json()
        assert updated_paste['title'] == update_data['title'], "Title not updated"
        assert updated_paste['hidden'] == True, "Hidden status not updated"
        self.log("✓ Paste updated successfully")
        
        # Test updating non-existent paste
        response = self.session.put(f'{self.base_url}/api/pastes/nonexistent', 
                                  json=update_data)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        self.log("✓ Update non-existent paste returns 404")
    
    def test_get_my_pastes(self):
        """Test getting user's pastes"""
        self.log("Testing my pastes retrieval...")
        
        # Test with session
        response = self.session.get(f'{self.base_url}/api/user/my-pastes')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        pastes = response.json()
        assert len(pastes) >= 2, f"Expected at least 2 pastes, got {len(pastes)}"
        self.log(f"✓ Retrieved {len(pastes)} user pastes via session")
        
        # Test with API key
        headers = {'X-API-Key': self.api_key}
        response = requests.get(f'{self.base_url}/api/user/my-pastes', headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        self.log("✓ Retrieved user pastes via API key")
    
    def test_api_key_refresh(self):
        """Test API key refresh"""
        self.log("Testing API key refresh...")
        
        old_api_key = self.api_key
        response = self.session.get(f'{self.base_url}/api/user/api-key')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        result = response.json()
        new_api_key = result['api_key']
        
        assert new_api_key != old_api_key, "API key not refreshed"
        self.api_key = new_api_key
        self.log("✓ API key refreshed successfully")
        
        # Test that old key no longer works
        headers = {'X-API-Key': old_api_key}
        response = requests.get(f'{self.base_url}/api/user/me', headers=headers)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        self.log("✓ Old API key invalidated")
    
    def test_delete_paste(self):
        """Test paste deletion"""
        self.log("Testing paste deletion...")
        
        if self.paste_ids:
            paste_id = self.paste_ids[0]
            
            # Test deleting with session
            response = self.session.delete(f'{self.base_url}/api/pastes/{paste_id}')
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            self.log(f"✓ Paste {paste_id} deleted successfully")
            
            # Verify paste is gone
            response = requests.get(f'{self.base_url}/api/pastes/{paste_id}')
            assert response.status_code == 404, f"Expected 404, got {response.status_code}"
            self.log("✓ Deleted paste returns 404")
            
            # Test deleting non-existent paste
            response = self.session.delete(f'{self.base_url}/api/pastes/nonexistent')
            assert response.status_code == 404, f"Expected 404, got {response.status_code}"
            self.log("✓ Delete non-existent paste returns 404")
    
    def test_logout(self):
        """Test user logout"""
        self.log("Testing user logout...")
        
        response = self.session.post(f'{self.base_url}/api/user/logout')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        self.log("✓ User logged out successfully")
        
        # Verify session is invalidated
        response = self.session.get(f'{self.base_url}/api/user/me')
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        self.log("✓ Session invalidated after logout")
    
    def cleanup(self):
        """Clean up test data"""
        self.log("Cleaning up test data...")
        
        if self.api_key:
            headers = {'X-API-Key': self.api_key}
            for paste_id in self.paste_ids:
                response = requests.delete(f'{self.base_url}/api/pastes/{paste_id}', 
                                         headers=headers)
                if response.status_code == 200:
                    self.log(f"✓ Cleaned up paste {paste_id}")
    
    def run_all_tests(self):
        """Run all tests"""
        self.log("Starting comprehensive pastebin API tests...", "START")
        
        try:
            # User tests
            user_data = self.test_user_registration()
            if not user_data:
                self.log("Skipping remaining tests due to registration failure", "ERROR")
                return False
            
            self.test_user_login(user_data)
            self.test_get_user_info()
            
            # Paste tests
            paste1, paste2 = self.test_create_paste()
            self.test_get_paste(paste1, paste2)
            self.test_update_paste(paste1)
            self.test_get_my_pastes()
            
            # API key tests
            self.test_api_key_refresh()
            
            # Cleanup tests
            self.test_delete_paste()
            self.test_logout()
            
            self.log("All tests completed successfully! ✓", "SUCCESS")
            return True
            
        except AssertionError as e:
            self.log(f"Test failed: {e}", "ERROR")
            return False
        except Exception as e:
            self.log(f"Unexpected error: {e}", "ERROR")
            return False
        finally:
            self.cleanup()

def main():
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = 'http://localhost:5000'
    
    print(f"Testing pastebin server at: {base_url}")
    print("Make sure your server is running and update the invite code in the script!")
    print("-" * 60)
    
    tester = PastebinTester(base_url)
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Your pastebin API is working correctly.")
    else:
        print("\n❌ Some tests failed. Check the output above for details.")
        sys.exit(1)

if __name__ == '__main__':
    main()