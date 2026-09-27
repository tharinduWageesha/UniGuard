<?php

class User
{
    private $conn;

    private $roleTableMap = [
        'oic' => 'oics',
        'officer in charge' => 'oics',
        'cso' => 'csos',
        'chief security officer' => 'csos',
        'jso' => 'jsos',
        'junior security officer' => 'jsos',
        'security officer' => 'jsos',
        'student' => 'students',
        'staff' => 'staff',
        'visitor' => 'visitors',
        'university management' => 'university_management',
        'university admin' => 'university_management',
        'um' => 'university_management',
        'admin' => 'admins',
        'system admin' => 'admins',
        'support agent' => 'support_agent',
        'support' => 'support_agent',
        'support account' => 'support_agent',
        'help centre' => 'support_agent',
        'user' => 'support_agent'
    ];

    private $tableRoleMap = [
        'support_agent' => 'Support Agent',
        'oics' => 'OIC',
        'csos' => 'CSO',
        'jsos' => 'JSO',
        'students' => 'Student',
        'staff' => 'Staff',
        'visitors' => 'Visitor',
        'university_management' => 'University Management',
        'admins' => 'Admin'
    ];

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getTableForRole($role)
    {
        $r = strtolower(trim($role));
        return $this->roleTableMap[$r] ?? 'support_agent';
    }

    /**
     * Find user across role tables by username or email.
     */
    public function findByUsernameOrEmail($identifier, $role = null)
    {
        $tablesToSearch = $this->tableRoleMap;

        if ($role) {
            $tbl = $this->getTableForRole($role);
            $roleDisplay = $this->tableRoleMap[$tbl] ?? $role;
            $tablesToSearch = [$tbl => $roleDisplay];
        }

        foreach ($tablesToSearch as $table => $roleDisplay) {
            try {
                $query = "SELECT * FROM `{$table}` WHERE username = :identifier OR email = :identifier LIMIT 1";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":identifier", $identifier);
                $stmt->execute();
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($user) {
                    if (empty($user['role']) || (strtolower(trim($user['role'])) === 'user' && $table === 'support_agent')) {
                        $user['role'] = $roleDisplay;
                    }
                    $user['meta_data'] = [
                        'assigned_sector' => $user['assigned_sector'] ?? null,
                        'badge_id' => $user['badge_id'] ?? null,
                        'phone' => $user['phone'] ?? $user['contact_phone'] ?? $user['office_phone'] ?? null,
                        'shift_schedule' => $user['shift_schedule'] ?? null,
                        'reporting_cso' => $user['reporting_cso'] ?? null,
                        'department' => $user['department'] ?? null,
                        'faculty' => $user['faculty'] ?? null,
                        'index_number' => $user['index_number'] ?? null,
                        'employee_id' => $user['employee_id'] ?? null,
                        'designation' => $user['designation'] ?? null,
                        'profile_picture' => $user['profile_picture'] ?? null
                    ];
                    return $user;
                }
            } catch (Exception $e) {
                continue;
            }
        }

        return false;
    }

    /**
     * Find user by ID across role tables or specific role table.
     */
    public function findById($id, $role = null)
    {
        $tablesToSearch = $this->tableRoleMap;

        if ($role) {
            $tbl = $this->getTableForRole($role);
            $roleDisplay = $this->tableRoleMap[$tbl] ?? $role;
            $tablesToSearch = [$tbl => $roleDisplay];
        }

        foreach ($tablesToSearch as $table => $roleDisplay) {
            $query = "SELECT *, '{$roleDisplay}' AS role FROM `{$table}` WHERE id = :id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                $user['meta_data'] = [
                    'assigned_sector' => $user['assigned_sector'] ?? null,
                    'badge_id' => $user['badge_id'] ?? null,
                    'phone' => $user['phone'] ?? $user['contact_phone'] ?? $user['office_phone'] ?? null,
                    'shift_schedule' => $user['shift_schedule'] ?? null,
                    'reporting_cso' => $user['reporting_cso'] ?? null,
                    'department' => $user['department'] ?? null,
                    'faculty' => $user['faculty'] ?? null,
                    'index_number' => $user['index_number'] ?? null,
                    'employee_id' => $user['employee_id'] ?? null,
                    'designation' => $user['designation'] ?? null,
                    'profile_picture' => $user['profile_picture'] ?? null
                ];
                return $user;
            }
        }

        return false;
    }

    /**
     * Create a new user in the specific role table.
     */
    public function create($fname, $lname, $email, $username, $hashedPassword, $role, $status = 'Active', $extraData = null)
    {
        $table = $this->getTableForRole($role);

        if (isset($extraData['meta_data']) && is_array($extraData['meta_data'])) {
            $extraData = array_merge($extraData, $extraData['meta_data']);
            unset($extraData['meta_data']);
        }

        $fields = [
            'fname' => $fname,
            'lname' => $lname,
            'email' => $email,
            'username' => $username,
            'password' => $hashedPassword,
            'status' => $status
        ];

        if (is_array($extraData)) {
            foreach ($extraData as $k => $v) {
                if (!empty($k) && $k !== 'action' && $k !== 'password' && $k !== 'id') {
                    $fields[$k] = $v;
                }
            }
        }

        $colStmt = $this->conn->query("DESCRIBE `{$table}`");
        $tableCols = $colStmt->fetchAll(PDO::FETCH_COLUMN);

        $insertCols = [];
        $insertVals = [];
        $params = [];

        foreach ($fields as $col => $val) {
            if (in_array($col, $tableCols)) {
                $insertCols[] = "`{$col}`";
                $insertVals[] = ":{$col}";
                $params[":{$col}"] = $val;
            }
        }

        $query = "INSERT INTO `{$table}` (" . implode(', ', $insertCols) . ") VALUES (" . implode(', ', $insertVals) . ")";
        $stmt = $this->conn->prepare($query);

        if ($stmt->execute($params)) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    /**
     * Get all users across all role tables or filtered by specific role.
     */
    public function getAll($role = null)
    {
        $tablesToSearch = $this->tableRoleMap;

        if ($role) {
            $tbl = $this->getTableForRole($role);
            $roleDisplay = $this->tableRoleMap[$tbl] ?? $role;
            $tablesToSearch = [$tbl => $roleDisplay];
        }

        $allUsers = [];

        foreach ($tablesToSearch as $table => $roleDisplay) {
            $query = "SELECT *, '{$roleDisplay}' AS role FROM `{$table}` ORDER BY id DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as $row) {
                $row['meta_data'] = [
                    'assigned_sector' => $row['assigned_sector'] ?? null,
                    'badge_id' => $row['badge_id'] ?? null,
                    'phone' => $row['phone'] ?? $row['contact_phone'] ?? $row['office_phone'] ?? null,
                    'shift_schedule' => $row['shift_schedule'] ?? null,
                    'reporting_cso' => $row['reporting_cso'] ?? null,
                    'department' => $row['department'] ?? null,
                    'faculty' => $row['faculty'] ?? null,
                    'index_number' => $row['index_number'] ?? null,
                    'employee_id' => $row['employee_id'] ?? null,
                    'designation' => $row['designation'] ?? null,
                    'profile_picture' => $row['profile_picture'] ?? null
                ];
                $allUsers[] = $row;
            }
        }

        return $allUsers;
    }

    /**
     * Update an existing user in their role table.
     */
    public function update($id, $fname, $lname, $email, $username, $role, $status = 'Active', $password = null, $extraData = null)
    {
        $table = $this->getTableForRole($role);

        if (isset($extraData['meta_data']) && is_array($extraData['meta_data'])) {
            $extraData = array_merge($extraData, $extraData['meta_data']);
            unset($extraData['meta_data']);
        }

        $fields = [
            'fname' => $fname,
            'lname' => $lname,
            'email' => $email,
            'username' => $username,
            'status' => $status
        ];

        if (!empty($password)) {
            $fields['password'] = password_hash($password, PASSWORD_BCRYPT);
        }

        if (is_array($extraData)) {
            foreach ($extraData as $k => $v) {
                if (!empty($k) && $k !== 'action' && $k !== 'id' && $k !== 'role') {
                    $fields[$k] = $v;
                }
            }
        }

        $colStmt = $this->conn->query("DESCRIBE `{$table}`");
        $tableCols = $colStmt->fetchAll(PDO::FETCH_COLUMN);

        $sets = [];
        $params = [':id' => $id];

        foreach ($fields as $col => $val) {
            if (in_array($col, $tableCols)) {
                $sets[] = "`{$col}` = :{$col}";
                $params[":{$col}"] = $val;
            }
        }

        $query = "UPDATE `{$table}` SET " . implode(', ', $sets) . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        return $stmt->execute($params);
    }

    /**
     * Delete a user by ID and optional role.
     */
    public function delete($id, $role = null)
    {
        if ($role) {
            $table = $this->getTableForRole($role);
            $query = "DELETE FROM `{$table}` WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id, PDO::PARAM_INT);
            return $stmt->execute();
        }

        foreach ($this->tableRoleMap as $table => $roleDisplay) {
            $query = "DELETE FROM `{$table}` WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            if ($stmt->rowCount() > 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if username exists across all role tables.
     */
    public function usernameExists($username, $excludeId = null, $role = null)
    {
        $excludeTable = $role ? $this->getTableForRole($role) : null;
        foreach ($this->tableRoleMap as $table => $roleDisplay) {
            $query = "SELECT id FROM `{$table}` WHERE username = :username";
            $shouldExclude = ($excludeId && ($excludeTable ? $table === $excludeTable : true));
            if ($shouldExclude) {
                $query .= " AND id != :excludeId";
            }
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":username", $username);
            if ($shouldExclude) {
                $stmt->bindParam(":excludeId", $excludeId, PDO::PARAM_INT);
            }
            $stmt->execute();
            if ($stmt->rowCount() > 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if email exists across all role tables.
     */
    public function emailExists($email, $excludeId = null, $role = null)
    {
        $excludeTable = $role ? $this->getTableForRole($role) : null;
        foreach ($this->tableRoleMap as $table => $roleDisplay) {
            $query = "SELECT id FROM `{$table}` WHERE email = :email";
            $shouldExclude = ($excludeId && ($excludeTable ? $table === $excludeTable : true));
            if ($shouldExclude) {
                $query .= " AND id != :excludeId";
            }
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":email", $email);
            if ($shouldExclude) {
                $stmt->bindParam(":excludeId", $excludeId, PDO::PARAM_INT);
            }
            $stmt->execute();
            if ($stmt->rowCount() > 0) {
                return true;
            }
        }
        return false;
    }
}
