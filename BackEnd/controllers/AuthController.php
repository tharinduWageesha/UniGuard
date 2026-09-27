<?php

require_once __DIR__ . '/../models/User.php';

class AuthController
{
    private $userModel;

    public function __construct($db)
    {
        $this->userModel = new User($db);
    }

    /**
     * Handle User Login
     */
    public function login()
    {
        // Receive request data (JSON or Form POST)
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Username/Email and Password are required.'
            ]);
            return;
        }

        // Search user by username or email
        $user = $this->userModel->findByUsernameOrEmail($username);

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid username/email or password.'
            ]);
            return;
        }

        // Check account active status (Every user except System Admin cannot login if deactivated)
        $userRole = strtolower(trim($user['role'] ?? ''));
        $isAdminRole = in_array($userRole, ['admin', 'system admin']);

        if (!$isAdminRole && isset($user['status']) && strtolower(trim($user['status'])) === 'deactivated') {
            http_response_code(403);
            echo json_encode([
                'status' => 'error',
                'message' => 'Your Account is deactivated by the Admin'
            ]);
            return;
        }

        // Check role permission if required_role parameter is provided
        $requiredRole = trim($input['required_role'] ?? '');
        if (!empty($requiredRole) && !$this->isRoleMatch($user['role'], $requiredRole)) {
            http_response_code(403);
            echo json_encode([
                'status' => 'error',
                'message' => "Access denied. Your account role '{$user['role']}' is not authorized for {$requiredRole} login."
            ]);
            return;
        }

        // Start session and save authenticated user data
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $userData = [
            'id' => $user['id'],
            'fname' => $user['fname'],
            'lname' => $user['lname'],
            'email' => $user['email'],
            'username' => $user['username'],
            'role' => $user['role']
        ];

        $_SESSION['user'] = $userData;

        // Determine dashboard redirect URL based on role
        $redirectUrl = $this->getRedirectUrlForRole($user['role']);

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Login successful.',
            'user' => $userData,
            'redirect' => $redirectUrl
        ]);
    }

    /**
     * Handle User Logout
     */
    public function logout()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $_SESSION = array();

        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }

        session_destroy();

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Logout successful.'
        ]);
    }

    /**
     * Check active user session
     */
    public function checkAuth()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (isset($_SESSION['user']) && !empty($_SESSION['user']['id'])) {
            $userRole = $_SESSION['user']['role'] ?? null;
            $freshUser = $this->userModel->findById($_SESSION['user']['id'], $userRole);
            $userData = $freshUser ? $freshUser : $_SESSION['user'];

            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'authenticated' => true,
                'user' => $userData
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                'status' => 'error',
                'authenticated' => false,
                'message' => 'User not authenticated.'
            ]);
        }
    }

    /**
     * Helper to map user role to dashboard view page
     */
    private function getRedirectUrlForRole($role)
    {
        $roleLower = strtolower(trim($role));

        switch ($roleLower) {
            case 'admin':
            case 'system admin':
                return '/Uniguard/FrontEnd/Member3/admin/dashboard/index.html';

            case 'cso':
            case 'chief security officer':
                return '/Uniguard/FrontEnd/Member1/cso/dashboard/index.html';

            case 'jso':
            case 'junior security officer':
            case 'security officer':
                return '/Uniguard/FrontEnd/Member1/jso/dashboard/index.html';

            case 'oic':
            case 'officer in charge':
                return '/Uniguard/FrontEnd/Member1/oic/dashboard/dashboard.html';

            case 'staff':
                return '/Uniguard/FrontEnd/Member3/staff/dashboard/index.html';

            case 'student':
                return '/Uniguard/FrontEnd/Member3/student/dashboard/index.html';

            case 'visitor':
                return '/Uniguard/FrontEnd/Member 2/Visitor/dashboard/dashboard.html';

            case 'university management':
            case 'university admin':
            case 'um':
                return '/Uniguard/FrontEnd/Member 2/UniversityManagement/dashboard/dashboard.html';

            case 'support agent':
            case 'support':
            case 'support account':
            case 'help centre':
            case 'help center staff':
                return '/Uniguard/FrontEnd/Member 4/dashboard.html';

            default:
                return '/Uniguard/FrontEnd/Member 2/UniversityManagement/dashboard/dashboard.html';
        }
    }

    /**
     * Check if user role matches the required portal role
     */
    private function isRoleMatch($userRole, $requiredRole)
    {
        $u = strtolower(trim($userRole));
        $r = strtolower(trim($requiredRole));

        if ($u === $r) {
            return true;
        }

        $aliases = [
            'cso' => ['cso', 'chief security officer'],
            'jso' => ['jso', 'junior security officer', 'security officer'],
            'oic' => ['oic', 'officer in charge'],
            'admin' => ['admin', 'system admin'],
            'staff' => ['staff'],
            'student' => ['student'],
            'visitor' => ['visitor'],
            'university management' => ['university management', 'university admin', 'um'],
            'support agent' => ['support agent', 'support account', 'support', 'help centre', 'help center staff', 'user', 'user agent']
        ];

        foreach ($aliases as $key => $roleGroup) {
            if (in_array($r, $roleGroup) && in_array($u, $roleGroup)) {
                return true;
            }
        }

        return false;
    }
}
