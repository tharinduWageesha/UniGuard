/**
 * UniGuard Authentication & User Management Client Helper
 * Pure JavaScript (Fetch API) - Native PHP Backend Integration
 */

const API_BASE_URL = '/Uniguard/BackEnd/index.php';

const Auth = {
    /**
     * Authenticate user credentials against backend
     */
    async login(username, password, requiredRole = null) {
        try {
            const payload = { username, password };
            if (requiredRole) {
                payload.required_role = requiredRole;
            }

            const response = await fetch(`${API_BASE_URL}?action=login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                // Save user info locally for fast UI access
                sessionStorage.setItem('uniguard_user', JSON.stringify(data.user));
                return { success: true, data: data };
            } else {
                return { success: false, message: data.message || 'Login failed.' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Server connection error. Please try again.' };
        }
    },

    /**
     * Get local user cached in sessionStorage
     */
    getCurrentUser() {
        try {
            const userStr = sessionStorage.getItem('uniguard_user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            return null;
        }
    },

    /**
     * Log out current user session
     */
    async logout(redirectUrl = null) {
        let targetUrl = redirectUrl;
        const currentPath = decodeURIComponent(window.location.pathname);

        if (currentPath.includes('Member 4') || currentPath.includes('Member%204')) {
            targetUrl = '/Uniguard/FrontEnd/Member 4/login.html';
        } else if (!targetUrl) {
            const user = this.getCurrentUser();
            const userRole = (user && user.role) ? user.role.toLowerCase() : '';
            if (userRole.includes('admin')) {
                targetUrl = '/Uniguard/FrontEnd/Member3/admin/loginPage.html';
            } else if (userRole.includes('support') || userRole.includes('help centre')) {
                targetUrl = '/Uniguard/FrontEnd/Member 4/login.html';
            } else {
                targetUrl = '/Uniguard/FrontEnd/Member 2/UniversityManagement/Login/login.html';
            }
        }
        try {
            await fetch(`${API_BASE_URL}?action=logout`, { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            sessionStorage.removeItem('uniguard_user');
            sessionStorage.clear();
            window.location.href = targetUrl;
        }
    },

    /**
     * Check authenticated session status from server
     */
    async checkAuth() {
        try {
            const response = await fetch(`${API_BASE_URL}?action=check_auth`);
            const data = await response.json();
            if (response.ok && data.authenticated) {
                sessionStorage.setItem('uniguard_user', JSON.stringify(data.user));
                return data.user;
            } else {
                sessionStorage.removeItem('uniguard_user');
                return null;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            return null;
        }
    },

    /**
     * Enforce authentication & role check on protected portal pages
     */
    async requireAuth(requiredRole = null, loginUrl = '../loginPage.html') {
        const user = await this.checkAuth();
        if (!user) {
            window.location.href = loginUrl;
            return null;
        }

        const userRole = (user.role || '').toLowerCase().trim();
        const isAdminRole = ['admin', 'system admin'].includes(userRole);

        if (!isAdminRole && (user.status || '').toLowerCase().trim() === 'deactivated') {
            alert('Your Account is deactivated by the Admin');
            window.location.href = loginUrl;
            return null;
        }

        if (requiredRole) {
            const userRole = (user.role || '').toLowerCase().trim();
            const reqRole = requiredRole.toLowerCase().trim();
            const aliases = {
                'cso': ['cso', 'chief security officer'],
                'jso': ['jso', 'junior security officer', 'security officer'],
                'oic': ['oic', 'officer in charge'],
                'admin': ['admin', 'system admin'],
                'staff': ['staff'],
                'student': ['student'],
                'visitor': ['visitor'],
                'university management': ['university management', 'university admin', 'um'],
                'support account': ['support account']
            };

            let match = userRole === reqRole;
            if (!match && aliases[reqRole]) {
                match = aliases[reqRole].includes(userRole);
            }

            if (!match) {
                alert(`Access Denied. You must be logged in as ${requiredRole}.`);
                window.location.href = loginUrl;
                return null;
            }
        }

        return user;
    },

    /**
     * Add a new user account (Admin functionality)
     */
    async addUser(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}?action=add_user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (response.ok && data.status === 'success') {
                return { success: true, data: data };
            } else {
                return { success: false, message: data.message || 'Failed to add user.' };
            }
        } catch (error) {
            console.error('Add user error:', error);
            return { success: false, message: 'Server connection error.' };
        }
    },

    /**
     * Get list of all registered users (Admin functionality)
     */
    async getUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}?action=get_users`);
            const data = await response.json();
            if (response.ok && data.status === 'success') {
                return { success: true, users: data.data };
            } else {
                return { success: false, message: data.message || 'Failed to fetch users.' };
            }
        } catch (error) {
            console.error('Get users error:', error);
            return { success: false, message: 'Server connection error.' };
        }
    },

    /**
     * Update an existing user account
     */
    async updateUser(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}?action=update_user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (response.ok && data.status === 'success') {
                return { success: true, data: data };
            } else {
                return { success: false, message: data.message || 'Failed to update user.' };
            }
        } catch (error) {
            console.error('Update user error:', error);
            return { success: false, message: 'Server connection error.' };
        }
    },

    /**
     * Delete a user account (Admin functionality)
     */
    async deleteUser(userId, role = null) {
        try {
            const payload = { id: userId };
            if (role) {
                payload.role = role;
            }
            const response = await fetch(`${API_BASE_URL}?action=delete_user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok && data.status === 'success') {
                return { success: true, data: data };
            } else {
                return { success: false, message: data.message || 'Failed to delete user.' };
            }
        } catch (error) {
            console.error('Delete user error:', error);
            return { success: false, message: 'Server connection error.' };
        }
    }
};
