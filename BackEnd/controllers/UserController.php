<?php

require_once __DIR__ . '/../models/User.php';

class UserController
{
    private $userModel;

    public function __construct($db)
    {
        $this->userModel = new User($db);
    }

    /**
     * Add a new user account (Admin only)
     */
    public function addUser()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $fname = trim($input['fname'] ?? '');
        $lname = trim($input['lname'] ?? '');
        $email = trim($input['email'] ?? '');
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');
        $role = trim($input['role'] ?? 'User');
        $status = trim($input['status'] ?? 'Active');
        $metaData = $input['meta_data'] ?? null;

        // Validation
        if (empty($fname) || empty($email) || empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'First Name, Email, Username, and Password are required.'
            ]);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid email address format.'
            ]);
            return;
        }

        // Duplicate checks
        if ($this->userModel->usernameExists($username)) {
            http_response_code(409);
            echo json_encode([
                'status' => 'error',
                'message' => 'Username is already taken.'
            ]);
            return;
        }

        if ($this->userModel->emailExists($email)) {
            http_response_code(409);
            echo json_encode([
                'status' => 'error',
                'message' => 'Email address is already registered.'
            ]);
            return;
        }

        // Hash password securely
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $userId = $this->userModel->create($fname, $lname, $email, $username, $hashedPassword, $role, $status, $metaData);

        if ($userId) {
            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'message' => 'User account created successfully.',
                'user_id' => $userId
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to create user account.'
            ]);
        }
    }

    /**
     * Get all users (Admin only)
     */
    public function getUsers()
    {
        $users = $this->userModel->getAll();

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'data' => $users
        ]);
    }

    /**
     * Update an existing user account
     */
    public function updateUser()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $id = intval($input['id'] ?? 0);
        $fname = trim($input['fname'] ?? '');
        $lname = trim($input['lname'] ?? '');
        $email = trim($input['email'] ?? '');
        $username = trim($input['username'] ?? '');
        $role = trim($input['role'] ?? '');
        $originalRole = trim($input['original_role'] ?? $role);
        $status = trim($input['status'] ?? 'Active');
        $password = trim($input['password'] ?? '');
        $metaData = $input['meta_data'] ?? null;

        if (!$id || empty($fname) || empty($email) || empty($username)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'User ID, First Name, Email, and Username are required.'
            ]);
            return;
        }

        if ($this->userModel->usernameExists($username, $id, $originalRole)) {
            http_response_code(409);
            echo json_encode([
                'status' => 'error',
                'message' => 'Username is already taken by another account.'
            ]);
            return;
        }

        if ($this->userModel->emailExists($email, $id, $originalRole)) {
            http_response_code(409);
            echo json_encode([
                'status' => 'error',
                'message' => 'Email is already taken by another account.'
            ]);
            return;
        }

        // Check if role changed
        if (!empty($originalRole) && strtolower(trim($originalRole)) !== strtolower(trim($role))) {
            // Role changed: remove from old role table and insert into new role table
            $this->userModel->delete($id, $originalRole);
            $hashedPassword = !empty($password) ? password_hash($password, PASSWORD_BCRYPT) : password_hash('User123!', PASSWORD_BCRYPT);
            $newId = $this->userModel->create($fname, $lname, $email, $username, $hashedPassword, $role, $status, $metaData);
            $success = (bool)$newId;
        } else {
            $success = $this->userModel->update($id, $fname, $lname, $email, $username, $role, $status, !empty($password) ? $password : null, $metaData);
        }

        if ($success) {
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => 'User updated successfully.'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to update user.'
            ]);
        }
    }

    /**
     * Delete a user account (Admin only)
     */
    public function deleteUser()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_REQUEST;
        }

        $id = intval($input['id'] ?? 0);
        $role = trim($input['role'] ?? '');

        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Valid User ID is required.'
            ]);
            return;
        }

        $success = $this->userModel->delete($id, !empty($role) ? $role : null);

        if ($success) {
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => 'User account deleted successfully.'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to delete user account.'
            ]);
        }
    }
}
